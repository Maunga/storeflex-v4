<?php

namespace App\Services\Payments;

use App\Enums\PaynowStatus;
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Paynow as PaynowRecord;
use Illuminate\Support\Facades\Log;
use Paynow\Payments\Paynow;

class PaynowService implements PaymentGatewayInterface
{
    protected Paynow $paynow;
    protected string $integrationKey;
    protected bool $isMobile;

    public function __construct(bool $isMobile = false)
    {
        $integrationId = config('services.paynow.integration_id', '');
        $this->integrationKey = config('services.paynow.integration_key', '');
        $appUrl = config('app.url');
        $returnUrl = config('services.paynow.return_url') ?? $appUrl . '/checkout/payment/callback';
        $resultUrl = config('services.paynow.result_url') ?? $appUrl . '/api/payments/paynow/webhook';
        
        Log::info('Paynow: Initializing SDK', [
            'integrationId' => $integrationId,
            'returnUrl' => $returnUrl,
            'resultUrl' => $resultUrl,
            'isMobile' => $isMobile,
        ]);
        
        $this->paynow = new Paynow($integrationId, $this->integrationKey, $returnUrl, $resultUrl);
        $this->isMobile = $isMobile;
    }

    public function getIdentifier(): string
    {
        return $this->isMobile ? 'ecocash' : 'paynow';
    }

    public function getName(): string
    {
        return $this->isMobile ? 'EcoCash' : 'Paynow';
    }

    public function supportsMobilePush(): bool
    {
        return $this->isMobile;
    }

    public function requiresRedirect(): bool
    {
        return !$this->isMobile;
    }

    /**
     * Format phone number to local format (e.g., 0773719320)
     */
    protected function formatPhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        // Convert international format (263...) to local format (0...)
        if (str_starts_with($phone, '263')) {
            $phone = '0' . substr($phone, 3);
        } elseif (!str_starts_with($phone, '0')) {
            $phone = '0' . $phone;
        }
        return $phone;
    }

    /**
     * Initialize a Paynow payment
     */
    public function initiate(array $orderData): array
    {
        try {
            $reference = $orderData['reference'] ?? 'ORDER-' . time();
            $amount = app()->environment('production') ? $orderData['amount'] : 0.03;
            $email = $orderData['email'];
            $phone = $orderData['phone'] ?? '';
            $description = $orderData['description'] ?? 'Storeflex Order';

            Log::info('Paynow: Initiating payment', [
                'reference' => $reference,
                'amount' => $amount,
                'isMobile' => $this->isMobile,
            ]);

            // Create payment using SDK
            $payment = $this->paynow->createPayment($reference, $email);
            $payment->add($description, $amount);

            // If mobile (EcoCash), send USSD push
            if ($this->isMobile && !empty($phone)) {
                $formattedPhone = $this->formatPhone($phone);
                
                Log::info('Paynow: Sending EcoCash USSD push', ['phone' => $formattedPhone]);
                
                $response = $this->paynow->sendMobile($payment, $formattedPhone, 'ecocash');

                if ($response->success()) {
                    Log::info('Paynow: Mobile push sent successfully', [
                        'pollUrl' => $response->pollUrl(),
                    ]);

                    return [
                        'success' => true,
                        'poll_url' => $response->pollUrl(),
                        'requires_redirect' => false,
                        'message' => 'A payment prompt has been sent to your phone. Please enter your EcoCash PIN to complete the payment.',
                        'status' => 'pending',
                        'reference' => $reference,
                    ];
                }

                Log::error('Paynow: Mobile push failed', ['error' => $response->error()]);
                return [
                    'success' => false,
                    'message' => $response->error() ?? 'Failed to send mobile payment prompt',
                ];
            }

            // For web payments, send and get redirect URL
            $response = $this->paynow->send($payment);

            if ($response->success()) {
                Log::info('Paynow: Web payment initiated', [
                    'redirectUrl' => $response->redirectUrl(),
                    'pollUrl' => $response->pollUrl(),
                ]);

                return [
                    'success' => true,
                    'redirect_url' => $response->redirectUrl(),
                    'poll_url' => $response->pollUrl(),
                    'reference' => $reference,
                    'requires_redirect' => true,
                ];
            }

            Log::error('Paynow: Web payment initiation failed', ['error' => $response->error()]);
            return [
                'success' => false,
                'message' => $response->error() ?? 'Failed to initialize payment',
            ];
        } catch (\Exception $e) {
            Log::error('Paynow: Initiation failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Payment initialization failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus(string $pollUrl): array
    {
        try {
            $status = $this->paynow->pollTransaction($pollUrl);

            Log::info('Paynow: Status check', [
                'status' => $status->status(),
                'paid' => $status->paid(),
            ]);

            $statusStr = strtolower($status->status());
            $isPaid = $status->paid();

            // Persist payment data to paynow table when confirmed
            if ($isPaid) {
                try {
                    PaynowRecord::updateOrCreate(
                        ['reference' => $status->reference()],
                        [
                            'paynowreference' => $status->paynowReference() ?: null,
                            'amount' => (float) $status->amount(),
                            'paynow_status' => $status->status(),
                            'currency' => 'USD',
                            'pollurl' => $pollUrl,
                            'hash' => '',
                            'status' => $this->mapPaynowStatus($status->status()),
                        ]
                    );
                    Log::info('Paynow: Status poll - record persisted', ['reference' => $status->reference()]);
                } catch (\Exception $e) {
                    Log::error('Paynow: Failed to persist status poll data', ['error' => $e->getMessage()]);
                }
            }

            return [
                'success' => true,
                'status' => $statusStr,
                'paid' => $isPaid,
                'reference' => $status->reference(),
                'amount' => $status->amount(),
                'paynow_reference' => $status->paynowReference(),
            ];
        } catch (\Exception $e) {
            Log::error('Paynow: Status check failed', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to check payment status',
            ];
        }
    }

    /**
     * Generate hash for verification
     */
    protected function generateHash(array $values): string
    {
        $string = implode('', $values) . $this->integrationKey;
        return strtoupper(hash('sha512', $string));
    }

    /**
     * Handle webhook callback from Paynow
     */
    public function handleCallback(array $payload): array
    {
        Log::info('Paynow: Webhook received', ['payload' => $payload]);

        $reference = $payload['reference'] ?? null;
        $paynowReference = $payload['paynowreference'] ?? null;
        $amount = $payload['amount'] ?? null;
        $paynowStatus = $payload['status'] ?? 'Unknown';
        $pollUrl = $payload['pollurl'] ?? '';
        $hash = $payload['hash'] ?? '';

        // Validate required fields
        if (empty($reference)) {
            Log::warning('Paynow: Webhook missing reference');
            return ['success' => false, 'message' => 'Missing reference'];
        }

        // Persist webhook data to paynow table
        try {
            $record = PaynowRecord::updateOrCreate(
                ['reference' => $reference],
                [
                    'paynowreference' => $paynowReference ?: null, // null if empty to avoid unique constraint
                    'amount' => (float) $amount,
                    'paynow_status' => $paynowStatus,
                    'currency' => 'USD',
                    'pollurl' => $pollUrl,
                    'hash' => $hash,
                    'status' => $this->mapPaynowStatus($paynowStatus),
                ]
            );

            Log::info('Paynow: Webhook data persisted', [
                'record_id' => $record->id,
                'reference' => $reference,
                'paynow_status' => $paynowStatus,
            ]);
        } catch (\Exception $e) {
            Log::error('Paynow: Failed to persist webhook data', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);
            // Continue processing even if persistence fails
        }

        $status = strtolower($paynowStatus);
        $isPaid = in_array($status, ['paid', 'awaiting delivery', 'delivered']);

        return [
            'success' => true,
            'status' => $status,
            'paid' => $isPaid,
            'reference' => $reference,
            'paynow_reference' => $paynowReference,
            'amount' => $amount,
        ];
    }

    /**
     * Map Paynow status string to PaynowStatus enum
     */
    protected function mapPaynowStatus(string $status): PaynowStatus
    {
        return match (strtolower($status)) {
            'paid', 'awaiting delivery', 'delivered' => PaynowStatus::PAID,
            'sent', 'pending' => PaynowStatus::PUSHED,
            'cancelled' => PaynowStatus::CANCELLED,
            'failed' => PaynowStatus::FAILED,
            default => PaynowStatus::PENDING,
        };
    }
}
