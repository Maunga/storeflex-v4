<?php

namespace App\Services\Payments;

use App\Interfaces\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StripeService implements PaymentGatewayInterface
{
    protected string $secretKey;
    protected string $publishableKey;
    protected string $webhookSecret;
    protected string $returnUrl;
    protected string $cancelUrl;

    public function __construct()
    {
        $this->secretKey = config('services.stripe.secret', '');
        $this->publishableKey = config('services.stripe.key', '');
        $this->webhookSecret = config('services.stripe.webhook_secret', '');
        $this->returnUrl = config('services.stripe.return_url') ?? url('/checkout/payment/callback');
        $this->cancelUrl = config('services.stripe.cancel_url') ?? url('/checkout/payment/cancel');
    }

    public function getIdentifier(): string
    {
        return 'stripe';
    }

    public function getName(): string
    {
        return 'Stripe';
    }

    public function supportsMobilePush(): bool
    {
        return false;
    }

    public function requiresRedirect(): bool
    {
        return true;
    }

    /**
     * Get the publishable key for frontend
     */
    public function getPublishableKey(): string
    {
        return $this->publishableKey;
    }

    /**
     * Initialize a Stripe Checkout Session
     */
    public function initiate(array $orderData): array
    {
        try {
            $reference = $orderData['reference'] ?? 'ORDER-' . time();
            $rawAmount = app()->environment('production') ? $orderData['amount'] : 0.03;
            $amount = (int) round($rawAmount * 100); // Stripe uses cents
            $currency = strtolower($orderData['currency'] ?? 'usd');
            $description = $orderData['description'] ?? 'Storeflex Order';
            $customerEmail = $orderData['email'] ?? null;
            $productName = $orderData['product_name'] ?? 'Order';
            $productImage = $orderData['product_image'] ?? null;

            $lineItems = [
                [
                    'price_data' => [
                        'currency' => $currency,
                        'product_data' => [
                            'name' => $productName,
                            'description' => $description,
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ],
            ];

            // Add image if provided
            if ($productImage) {
                $lineItems[0]['price_data']['product_data']['images'] = [$productImage];
            }

            $payload = [
                'payment_method_types' => ['card'],
                'line_items' => $lineItems,
                'mode' => 'payment',
                'success_url' => $this->returnUrl . '?provider=stripe&reference=' . $reference . '&session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $this->cancelUrl . '?provider=stripe&reference=' . $reference,
                'client_reference_id' => $reference,
                'metadata' => [
                    'reference' => $reference,
                ],
            ];

            if ($customerEmail) {
                $payload['customer_email'] = $customerEmail;
            }

            Log::info('Stripe: Creating checkout session', ['reference' => $reference, 'amount' => $amount]);

            $response = Http::withBasicAuth($this->secretKey, '')
                ->asForm()
                ->post('https://api.stripe.com/v1/checkout/sessions', $this->flattenForStripe($payload));

            if (!$response->successful()) {
                Log::error('Stripe: Session creation failed', ['response' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Failed to create Stripe checkout session',
                ];
            }

            $data = $response->json();

            Log::info('Stripe: Session created', ['session_id' => $data['id']]);

            return [
                'success' => true,
                'redirect_url' => $data['url'],
                'session_id' => $data['id'],
                'reference' => $reference,
                'requires_redirect' => true,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe: Initiation failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Flatten nested array for Stripe's form encoding
     */
    protected function flattenForStripe(array $data, string $prefix = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $newKey = $prefix ? "{$prefix}[{$key}]" : $key;

            if (is_array($value)) {
                $result = array_merge($result, $this->flattenForStripe($value, $newKey));
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Check payment status by session ID
     */
    public function checkStatus(string $sessionId): array
    {
        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->get("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Failed to check session status',
                ];
            }

            $data = $response->json();
            $status = $data['payment_status'] ?? 'unknown';

            return [
                'success' => true,
                'status' => $status,
                'paid' => $status === 'paid',
                'session_id' => $sessionId,
                'reference' => $data['client_reference_id'] ?? null,
                'customer_email' => $data['customer_email'] ?? null,
                'amount_total' => ($data['amount_total'] ?? 0) / 100,
            ];
        } catch (\Exception $e) {
            Log::error('Stripe: Status check failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to check payment status',
            ];
        }
    }

    /**
     * Handle webhook callback from Stripe
     */
    public function handleCallback(array $payload): array
    {
        Log::info('Stripe: Callback received', ['payload' => $payload]);

        // For redirect callbacks, check session status
        $sessionId = $payload['session_id'] ?? null;

        if ($sessionId) {
            return $this->checkStatus($sessionId);
        }

        return [
            'success' => false,
            'message' => 'Missing session ID',
        ];
    }

    /**
     * Verify Stripe webhook signature
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        if (empty($this->webhookSecret)) {
            return true; // Skip verification if no secret configured
        }

        try {
            $elements = explode(',', $signature);
            $timestamp = null;
            $signatures = [];

            foreach ($elements as $element) {
                $parts = explode('=', $element, 2);
                if (count($parts) === 2) {
                    if ($parts[0] === 't') {
                        $timestamp = $parts[1];
                    } elseif ($parts[0] === 'v1') {
                        $signatures[] = $parts[1];
                    }
                }
            }

            if (!$timestamp || empty($signatures)) {
                return false;
            }

            $signedPayload = "{$timestamp}.{$payload}";
            $expectedSignature = hash_hmac('sha256', $signedPayload, $this->webhookSecret);

            return in_array($expectedSignature, $signatures);
        } catch (\Exception $e) {
            Log::error('Stripe: Webhook signature verification failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Handle Stripe webhook event
     */
    public function handleWebhookEvent(string $payload, string $signature): array
    {
        if (!$this->verifyWebhookSignature($payload, $signature)) {
            return [
                'success' => false,
                'message' => 'Invalid webhook signature',
            ];
        }

        $event = json_decode($payload, true);

        Log::info('Stripe: Webhook event received', ['type' => $event['type'] ?? 'unknown']);

        $type = $event['type'] ?? '';
        $object = $event['data']['object'] ?? [];

        if ($type === 'checkout.session.completed') {
            return [
                'success' => true,
                'event' => 'payment_completed',
                'status' => 'paid',
                'paid' => true,
                'session_id' => $object['id'] ?? null,
                'reference' => $object['client_reference_id'] ?? null,
                'customer_email' => $object['customer_email'] ?? null,
                'amount_total' => ($object['amount_total'] ?? 0) / 100,
            ];
        }

        return [
            'success' => true,
            'event' => $type,
            'status' => 'unknown',
            'paid' => false,
        ];
    }
}
