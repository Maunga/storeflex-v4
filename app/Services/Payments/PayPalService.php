<?php

namespace App\Services\Payments;

use App\Interfaces\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PayPalService implements PaymentGatewayInterface
{
    protected string $clientId;
    protected string $clientSecret;
    protected string $baseUrl;
    protected string $returnUrl;
    protected string $cancelUrl;

    public function __construct()
    {
        $this->clientId = config('services.paypal.client_id', '');
        $this->clientSecret = config('services.paypal.client_secret', '');
        $this->baseUrl = config('services.paypal.sandbox', true)
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';
        $this->returnUrl = config('services.paypal.return_url') ?? url('/checkout/payment/callback');
        $this->cancelUrl = config('services.paypal.cancel_url') ?? url('/checkout/payment/cancel');
    }

    public function getIdentifier(): string
    {
        return 'paypal';
    }

    public function getName(): string
    {
        return 'PayPal';
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
     * Get access token for PayPal API
     */
    protected function getAccessToken(): ?string
    {
        $cacheKey = 'paypal_access_token';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::withBasicAuth($this->clientId, $this->clientSecret)
                ->asForm()
                ->post("{$this->baseUrl}/v1/oauth2/token", [
                    'grant_type' => 'client_credentials',
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $token = $data['access_token'];
                $expiresIn = $data['expires_in'] ?? 3600;

                // Cache token for slightly less than its expiry
                Cache::put($cacheKey, $token, now()->addSeconds($expiresIn - 60));

                return $token;
            }

            Log::error('PayPal: Failed to get access token', ['response' => $response->body()]);
            return null;
        } catch (\Exception $e) {
            Log::error('PayPal: Token request failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Initialize a PayPal payment (create order)
     */
    public function initiate(array $orderData): array
    {
        try {
            $token = $this->getAccessToken();

            if (!$token) {
                return [
                    'success' => false,
                    'message' => 'Failed to authenticate with PayPal',
                ];
            }

            $reference = $orderData['reference'] ?? 'ORDER-' . time();
            $rawAmount = app()->environment('production') ? $orderData['amount'] : 0.03;
            $amount = number_format($rawAmount, 2, '.', '');
            $currency = $orderData['currency'] ?? 'USD';
            $description = $orderData['description'] ?? 'Storeflex Order';

            $payload = [
                'intent' => 'CAPTURE',
                'purchase_units' => [
                    [
                        'reference_id' => $reference,
                        'description' => $description,
                        'amount' => [
                            'currency_code' => $currency,
                            'value' => $amount,
                        ],
                    ],
                ],
                'payment_source' => [
                    'paypal' => [
                        'experience_context' => [
                            'payment_method_preference' => 'IMMEDIATE_PAYMENT_REQUIRED',
                            'brand_name' => 'Storeflex',
                            'locale' => 'en-US',
                            'landing_page' => 'LOGIN',
                            'shipping_preference' => 'NO_SHIPPING',
                            'user_action' => 'PAY_NOW',
                            'return_url' => $this->returnUrl . '?provider=paypal&reference=' . $reference,
                            'cancel_url' => $this->cancelUrl . '?provider=paypal&reference=' . $reference,
                        ],
                    ],
                ],
            ];

            Log::info('PayPal: Creating order', ['reference' => $reference, 'amount' => $amount]);

            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/v2/checkout/orders", $payload);

            if (!$response->successful()) {
                Log::error('PayPal: Order creation failed', ['response' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Failed to create PayPal order',
                ];
            }

            $data = $response->json();

            // Find the approval URL
            $approvalUrl = collect($data['links'] ?? [])
                ->firstWhere('rel', 'payer-action')['href'] ?? null;

            Log::info('PayPal: Order created', ['order_id' => $data['id'], 'approval_url' => $approvalUrl]);

            return [
                'success' => true,
                'redirect_url' => $approvalUrl,
                'order_id' => $data['id'],
                'reference' => $reference,
                'requires_redirect' => true,
            ];
        } catch (\Exception $e) {
            Log::error('PayPal: Initiation failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Capture a PayPal payment after approval
     */
    public function capture(string $orderId): array
    {
        try {
            $token = $this->getAccessToken();

            if (!$token) {
                return [
                    'success' => false,
                    'message' => 'Failed to authenticate with PayPal',
                ];
            }

            Log::info('PayPal: Capturing payment', ['order_id' => $orderId]);

            $response = Http::withToken($token)
                ->post("{$this->baseUrl}/v2/checkout/orders/{$orderId}/capture");

            if (!$response->successful()) {
                Log::error('PayPal: Capture failed', ['response' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Failed to capture payment',
                ];
            }

            $data = $response->json();

            $status = strtolower($data['status'] ?? 'unknown');
            $isPaid = $status === 'completed';

            Log::info('PayPal: Payment captured', ['status' => $status, 'data' => $data]);

            return [
                'success' => true,
                'status' => $status,
                'paid' => $isPaid,
                'order_id' => $orderId,
                'payer_id' => $data['payer']['payer_id'] ?? null,
                'payer_email' => $data['payer']['email_address'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('PayPal: Capture failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Payment capture failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus(string $orderId): array
    {
        try {
            $token = $this->getAccessToken();

            if (!$token) {
                return [
                    'success' => false,
                    'message' => 'Failed to authenticate with PayPal',
                ];
            }

            $response = Http::withToken($token)
                ->get("{$this->baseUrl}/v2/checkout/orders/{$orderId}");

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'message' => 'Failed to check order status',
                ];
            }

            $data = $response->json();
            $status = strtolower($data['status'] ?? 'unknown');

            return [
                'success' => true,
                'status' => $status,
                'paid' => $status === 'completed',
                'order_id' => $orderId,
            ];
        } catch (\Exception $e) {
            Log::error('PayPal: Status check failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to check payment status',
            ];
        }
    }

    /**
     * Handle webhook callback from PayPal
     */
    public function handleCallback(array $payload): array
    {
        Log::info('PayPal: Callback received', ['payload' => $payload]);

        // For PayPal, the callback is usually a redirect with token/PayerID
        $orderId = $payload['token'] ?? $payload['order_id'] ?? null;

        if (!$orderId) {
            return [
                'success' => false,
                'message' => 'Missing order ID',
            ];
        }

        // Capture the payment
        return $this->capture($orderId);
    }
}
