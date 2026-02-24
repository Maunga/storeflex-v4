<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Enums\PaymentProvider;
use App\Jobs\SyncPaymentToWooCommerce;
use App\Enums\PaynowStatus;
use App\Models\Order;
use App\Models\Paynow;
use App\Models\PaymentReceipt;
use App\Models\PendingCheckout;
use App\Services\Payments\PaynowService;
use App\Services\Payments\PayPalService;
use App\Services\Payments\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Get available payment methods for the checkout
     */
    public function methods()
    {
        $methods = [
            [
                'id' => PaymentProvider::CASH->value,
                'title' => PaymentProvider::CASH->label(),
                'description' => PaymentProvider::CASH->description(),
                'icon' => PaymentProvider::CASH->icon(),
                'type' => 'cash',
                'requires_phone' => false,
            ],
            [
                'id' => PaymentProvider::ECOCASH->value,
                'title' => PaymentProvider::ECOCASH->label(),
                'description' => PaymentProvider::ECOCASH->description(),
                'icon' => PaymentProvider::ECOCASH->icon(),
                'type' => 'mobile_push',
                'requires_phone' => true,
            ],
            [
                'id' => PaymentProvider::PAYPAL->value,
                'title' => PaymentProvider::PAYPAL->label(),
                'description' => PaymentProvider::PAYPAL->description(),
                'icon' => PaymentProvider::PAYPAL->icon(),
                'type' => 'redirect',
                'requires_phone' => false,
            ],
            [
                'id' => PaymentProvider::STRIPE->value,
                'title' => PaymentProvider::STRIPE->label(),
                'description' => PaymentProvider::STRIPE->description(),
                'icon' => PaymentProvider::STRIPE->icon(),
                'type' => 'redirect',
                'requires_phone' => false,
            ],
        ];

        return response()->json($methods);
    }

    /**
     * Initialize a payment
     */
    public function initiate(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:cash,ecocash,paynow,paypal,stripe',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'required|string',
            'email' => 'required|email',
            'phone' => 'nullable|string',
            'description' => 'nullable|string',
            'product_name' => 'nullable|string',
            'product_image' => 'nullable|url',
            'currency' => 'nullable|string',
            'payment_percentage' => 'nullable|integer|in:75,100',
            'checkout_data' => 'nullable|array', // For payment-first flow
        ]);

        $provider = $validated['provider'];
        $orderData = [
            'amount' => $validated['amount'],
            'reference' => $validated['reference'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? '',
            'description' => $validated['description'] ?? 'Storeflex Order',
            'product_name' => $validated['product_name'] ?? 'Order',
            'product_image' => $validated['product_image'] ?? null,
            'currency' => $validated['currency'] ?? 'USD',
        ];

        Log::info('Payment: Initiating', ['provider' => $provider, 'reference' => $orderData['reference']]);

        // Store checkout data for payment-first flow (non-cash payments)
        if (!empty($validated['checkout_data']) && $provider !== 'cash') {
            PendingCheckout::updateOrCreate(
                ['reference' => $validated['reference']],
                [
                    'provider' => $provider,
                    'amount' => $validated['amount'],
                    'payment_percentage' => $validated['payment_percentage'] ?? 100,
                    'checkout_data' => $validated['checkout_data'],
                    'status' => 'pending',
                    'expires_at' => now()->addHours(1),
                ]
            );
            Log::info('Payment: Stored pending checkout', ['reference' => $validated['reference']]);
        }

        // Cash payments don't need external payment processing
        if ($provider === 'cash') {
            return response()->json([
                'success' => true,
                'type' => 'cash',
                'message' => 'Order confirmed. Pay with cash on delivery/pickup.',
            ]);
        }

        $service = $this->getService($provider);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment provider',
            ], 400);
        }

        $result = $service->initiate($orderData);

        return response()->json($result);
    }

    /**
     * Check payment status
     */
    public function status(Request $request)
    {
        $validated = $request->validate([
            'provider' => 'required|string|in:cash,ecocash,paynow,paypal,stripe',
            'poll_url' => 'required_if:provider,ecocash,paynow|nullable|string',
            'order_id' => 'required_if:provider,paypal|nullable|string',
            'session_id' => 'required_if:provider,stripe|nullable|string',
            'reference' => 'nullable|string', // Payment reference for order lookup
        ]);

        $provider = $validated['provider'];
        $reference = $validated['reference'] ?? null;
        $service = $this->getService($provider);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid payment provider',
            ], 400);
        }

        // Determine the identifier based on provider
        $identifier = match ($provider) {
            'ecocash', 'paynow' => $validated['poll_url'],
            'paypal' => $validated['order_id'],
            'stripe' => $validated['session_id'],
            default => null,
        };

        if (!$identifier) {
            return response()->json([
                'success' => false,
                'message' => 'Missing payment identifier',
            ], 400);
        }

        $result = $service->checkStatus($identifier);
        
        // If payment is confirmed, process it and return order data
        if (($result['paid'] ?? false) && $reference) {
            $amount = (float) ($result['amount'] ?? 0);
            
            // Process the payment (creates order from pending checkout if needed)
            $order = $this->processSuccessfulPayment(
                reference: $reference,
                provider: $provider,
                providerReference: $result['paynow_reference'] ?? null,
                amount: $amount,
                metadata: $result
            );
            
            if ($order) {
                $result['order'] = [
                    'id' => $order->id,
                    'woocommerce_order_id' => $order->woocommerce_order_id,
                    'total' => $order->total,
                ];
            }
        }

        return response()->json($result);
    }

    /**
     * Handle payment callback (redirect return)
     */
    public function callback(Request $request)
    {
        $provider = $request->query('provider');
        $reference = $request->query('reference');

        Log::info('Payment: Callback received', ['provider' => $provider, 'reference' => $reference, 'query' => $request->query()]);

        $service = $this->getService($provider);

        if (!$service) {
            return redirect('/checkout?error=invalid_provider');
        }

        $result = $service->handleCallback($request->all());

        if ($result['paid'] ?? false) {
            // Get the amount from the result
            $amount = (float) ($result['amount'] ?? $result['amount_total'] ?? 0);
            
            // For Stripe, amount_total is in cents
            if ($provider === 'stripe' && isset($result['amount_total'])) {
                $amount = $result['amount_total']; // Already converted in service
            }

            // Process the payment
            $this->processSuccessfulPayment(
                reference: $reference,
                provider: $provider,
                providerReference: $result['paynow_reference'] ?? $result['order_id'] ?? $result['session_id'] ?? null,
                amount: $amount,
                metadata: $result
            );

            // Payment successful - redirect to success page
            return redirect('/checkout/success?reference=' . $reference . '&provider=' . $provider);
        }

        // Payment not completed
        return redirect('/checkout?error=payment_failed&reference=' . $reference);
    }

    /**
    /**
     * Handle Paynow webhook (Ecocash and Paynow web)
     */
    public function paynowWebhook(Request $request)
    {
        Log::info('Paynow Webhook received', ['payload' => $request->all()]);

        $service = new PaynowService();
        $result = $service->handleCallback($request->all());

        if (!$result['success']) {
            Log::warning('Paynow webhook: Invalid callback', ['result' => $result]);
            return response()->json(['success' => false, 'message' => 'Invalid callback'], 400);
        }

        // Process payment if paid
        if ($result['paid'] ?? false) {
            $this->processSuccessfulPayment(
                reference: $result['reference'] ?? '',
                provider: 'paynow',
                providerReference: $result['paynow_reference'] ?? null,
                amount: (float) ($result['amount'] ?? 0),
                metadata: $result
            );
        }

        return response()->json(['success' => true]);
    }

    /**
     * Handle Stripe webhook
     */
    public function stripeWebhook(Request $request)
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature', '');

        $service = new StripeService();
        $result = $service->handleWebhookEvent($payload, $signature);

        if (!$result['success']) {
            Log::warning('Stripe webhook: Invalid event', ['result' => $result]);
            return response()->json(['error' => $result['message']], 400);
        }

        // Process payment if completed
        if (($result['event'] ?? '') === 'payment_completed' && ($result['paid'] ?? false)) {
            $this->processSuccessfulPayment(
                reference: $result['reference'] ?? '',
                provider: 'stripe',
                providerReference: $result['session_id'] ?? null,
                amount: (float) ($result['amount_total'] ?? 0),
                metadata: $result
            );
        }

        return response()->json(['success' => true]);
    }

    /**
     * Handle PayPal webhook
     */
    public function paypalWebhook(Request $request)
    {
        Log::info('PayPal Webhook received', ['payload' => $request->all()]);

        $payload = $request->all();
        $eventType = $payload['event_type'] ?? '';

        // Handle PAYMENT.CAPTURE.COMPLETED event
        if ($eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            $resource = $payload['resource'] ?? [];
            $customId = $resource['custom_id'] ?? '';
            $amount = (float) ($resource['amount']['value'] ?? 0);
            $captureId = $resource['id'] ?? '';

            if ($customId) {
                $this->processSuccessfulPayment(
                    reference: $customId,
                    provider: 'paypal',
                    providerReference: $captureId,
                    amount: $amount,
                    metadata: $payload
                );
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Process a successful payment - ONLY call this after verifying payment is paid
     */
    protected function processSuccessfulPayment(
        string $reference,
        string $provider,
        ?string $providerReference,
        float $amount,
        array $metadata = []
    ): ?Order {
        // Guard: Ensure this is only called for confirmed payments
        if (empty($reference)) {
            Log::warning('processSuccessfulPayment called without reference');
            return null;
        }

        // Idempotency guard: if a receipt already exists for this reference, skip
        $existingReceipt = PaymentReceipt::where('reference', $reference)
            ->where('status', 'paid')
            ->first();

        if ($existingReceipt) {
            Log::info('processSuccessfulPayment: Already processed, skipping', [
                'reference' => $reference,
                'existing_receipt_id' => $existingReceipt->id,
                'order_id' => $existingReceipt->order_id,
            ]);
            return Order::find($existingReceipt->order_id);
        }

        Log::info('Processing SUCCESSFUL payment', [
            'reference' => $reference,
            'provider' => $provider,
            'provider_reference' => $providerReference,
            'amount' => $amount,
        ]);

        // First, check for pending checkout (payment-first flow)
        $pendingCheckout = PendingCheckout::findActiveByReference($reference);
        $order = null;
        
        // Store payment percentage for later use
        $paymentPercentage = 100;
        
        if ($pendingCheckout) {
            // Atomically claim the pending checkout to prevent duplicate processing
            if (!$pendingCheckout->claim()) {
                Log::info('processSuccessfulPayment: PendingCheckout already claimed by another process', [
                    'reference' => $reference,
                ]);
                // Another process is handling this - wait briefly and return the order if it exists
                sleep(2);
                $existingReceipt = PaymentReceipt::where('reference', $reference)->where('status', 'paid')->first();
                return $existingReceipt ? Order::find($existingReceipt->order_id) : null;
            }

            Log::info('Processing payment-first flow', ['reference' => $reference]);
            
            // Get payment percentage from pending checkout
            $paymentPercentage = $pendingCheckout->payment_percentage ?? 100;
            
            // Create order from pending checkout data
            $order = $this->createOrderFromPendingCheckout($pendingCheckout);
            
            if ($order) {
                // Mark pending checkout as paid
                $pendingCheckout->markAsPaid();
                Log::info('Order created from pending checkout', ['order_id' => $order->id]);
            } else {
                Log::error('Failed to create order from pending checkout', ['reference' => $reference]);
                return null;
            }
        } else {
            // Fallback: Find existing order by reference (order-first flow)
            $order = Order::findByPaymentReference($reference);
        }

        if (!$order) {
            Log::error('Payment processing: Order not found', ['reference' => $reference]);
            return null;
        }

        // Calculate actual payment amount based on order total and percentage
        // (Don't use gateway response amount in dev mode - it's $0.03)
        $actualAmountPaid = $order->total * ($paymentPercentage / 100);
        
        Log::info('Payment amount calculation', [
            'gateway_amount' => $amount,
            'order_total' => $order->total,
            'payment_percentage' => $paymentPercentage,
            'actual_amount_paid' => $actualAmountPaid,
        ]);

        // Persist Paynow record for paynow/ecocash providers
        if (in_array($provider, ['paynow', 'ecocash'])) {
            try {
                Paynow::updateOrCreate(
                    ['reference' => $reference],
                    [
                        'paynowreference' => $providerReference ?: null,
                        'amount' => $amount,
                        'paynow_status' => $metadata['status'] ?? 'paid',
                        'currency' => 'USD',
                        'pollurl' => $metadata['poll_url'] ?? '',
                        'hash' => $metadata['hash'] ?? '',
                        'status' => PaynowStatus::PAID,
                    ]
                );
                Log::info('Paynow record saved', ['reference' => $reference]);
            } catch (\Exception $e) {
                Log::error('Failed to save Paynow record', ['reference' => $reference, 'error' => $e->getMessage()]);
            }
        }

        // Create payment receipt with actual amount
        $receipt = PaymentReceipt::create([
            'order_id' => $order->id,
            'provider' => $provider,
            'reference' => $reference,
            'provider_reference' => $providerReference,
            'amount' => $actualAmountPaid,
            'currency' => 'USD',
            'status' => 'paid',
            'metadata' => $metadata,
            'paid_at' => now(),
        ]);

        Log::info('Payment receipt created', ['receipt_id' => $receipt->id, 'order_id' => $order->id]);

        // Dispatch job to sync with WooCommerce using actual amount
        SyncPaymentToWooCommerce::dispatch(
            orderId: $order->id,
            amountPaid: $actualAmountPaid,
            provider: $provider,
            providerReference: $providerReference
        );

        Log::info('SyncPaymentToWooCommerce job dispatched', ['order_id' => $order->id]);
        
        return $order;
    }

    /**
     * Create order from pending checkout data
     */
    protected function createOrderFromPendingCheckout(PendingCheckout $pendingCheckout): ?Order
    {
        $checkoutData = $pendingCheckout->checkout_data;
        
        if (empty($checkoutData)) {
            Log::error('Pending checkout has no checkout data', ['reference' => $pendingCheckout->reference]);
            return null;
        }

        try {
            // Call the CheckoutApiController to process the order
            $request = new \Illuminate\Http\Request($checkoutData);
            $controller = app(CheckoutApiController::class);
            
            $response = $controller->process($request);
            $responseData = json_decode($response->getContent(), true);
            
            if (!($responseData['success'] ?? false)) {
                Log::error('Failed to create order from pending checkout', [
                    'reference' => $pendingCheckout->reference,
                    'error' => $responseData['message'] ?? 'Unknown error'
                ]);
                return null;
            }
            
            $orderId = $responseData['data']['order']['id'] ?? null;
            
            if (!$orderId) {
                Log::error('Order created but no ID returned', ['reference' => $pendingCheckout->reference]);
                return null;
            }
            
            return Order::find($orderId);
            
        } catch (\Exception $e) {
            Log::error('Exception creating order from pending checkout', [
                'reference' => $pendingCheckout->reference,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get the appropriate payment service
     */
    protected function getService(string $provider)
    {
        return match ($provider) {
            'ecocash' => new PaynowService(isMobile: true),
            'paynow' => new PaynowService(isMobile: false),
            'paypal' => new PayPalService(),
            'stripe' => new StripeService(),
            default => null,
        };
    }
}
