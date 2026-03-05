<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PaymentReceipt;
use App\Utilities\BaseUtil;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncPaymentToWooCommerce implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        protected int $orderId,
        protected float $amountPaid,
        protected string $provider,
        protected ?string $providerReference = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $order = Order::find($this->orderId);

        if (!$order) {
            Log::error('SyncPaymentToWooCommerce: Order not found', ['order_id' => $this->orderId]);
            return;
        }

        Log::info('SyncPaymentToWooCommerce: Processing payment', [
            'order_id' => $order->id,
            'woocommerce_order_id' => $order->woocommerce_order_id,
            'amount_paid' => $this->amountPaid,
            'provider' => $this->provider,
        ]);

        // Calculate new balance
        $currentAmountPaid = (float) ($order->getRawOriginal('amount_paid') ?? 0) / 100;
        $newAmountPaid = $currentAmountPaid + $this->amountPaid;
        $orderTotal = $order->total; // Already converted to dollars via accessor
        $newBalance = max(0, $orderTotal - $newAmountPaid);

        // Determine the new status
        $newStatus = $this->determineOrderStatus($newBalance, $orderTotal);

        Log::info('SyncPaymentToWooCommerce: Calculated values', [
            'current_amount_paid' => $currentAmountPaid,
            'new_amount_paid' => $newAmountPaid,
            'order_total' => $orderTotal,
            'new_balance' => $newBalance,
            'new_status' => $newStatus,
        ]);

        // Update local order
        $order->update([
            'amount_paid' => $newAmountPaid,
            'balance' => $newBalance,
            'status' => $newStatus,
            'payment_provider' => $this->provider,
        ]);

        // Update WooCommerce order
        $this->updateWooCommerceOrder($order, $newStatus, $newAmountPaid, $newBalance);

        Log::info('SyncPaymentToWooCommerce: Completed', [
            'order_id' => $order->id,
            'new_status' => $newStatus,
        ]);
    }

    /**
     * Determine the order status based on payment.
     */
    protected function determineOrderStatus(float $balance, float $total): string
    {
        if ($balance <= 0) {
            // Fully paid
            return 'PROCESSING';
        }

        if ($balance < $total) {
            // Partially paid
            return 'PARTLY_PAID';
        }

        // No payment yet
        return 'PENDING';
    }

    /**
     * Update the order status in WooCommerce.
     */
    protected function updateWooCommerceOrder(Order $order, string $status, float $amountPaid, float $balance): void
    {
        try {
            // Map our status to WooCommerce status
            $wooStatus = match ($status) {
                'PROCESSING' => 'processing',
                'PARTLY_PAID' => 'on-hold', // WooCommerce doesn't have partial, use on-hold
                'COMPLETED' => 'completed',
                'CANCELLED' => 'cancelled',
                'REFUNDED' => 'refunded',
                'FAILED' => 'failed',
                default => 'pending',
            };

            $payload = [
                'status' => $wooStatus,
                'meta_data' => [
                    [
                        'key' => 'amount_paid',
                        'value' => (string) $amountPaid,
                    ],
                    [
                        'key' => 'payment_provider',
                        'value' => $this->provider,
                    ],
                    [
                        'key' => 'last_payment_reference',
                        'value' => $this->providerReference ?? '',
                    ],
                    [
                        'key' => 'last_payment_date',
                        'value' => now()->toIso8601String(),
                    ],
                ],
            ];

            // If fully paid, mark as paid
            if ($status === 'PROCESSING') {
                $payload['set_paid'] = true;
                $payload['transaction_id'] = $this->providerReference ?? '';
            }

            Log::info('SyncPaymentToWooCommerce: Updating WooCommerce order', [
                'woocommerce_order_id' => $order->woocommerce_order_id,
                'payload' => $payload,
            ]);

            $result = BaseUtil::updateWooCommerceOrder($order->woocommerce_order_id, $payload);

            Log::info('SyncPaymentToWooCommerce: WooCommerce update result', [
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('SyncPaymentToWooCommerce: Failed to update WooCommerce', [
                'error' => $e->getMessage(),
                'order_id' => $order->id,
            ]);

            // Re-throw to trigger retry
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SyncPaymentToWooCommerce: Job failed after retries', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
        ]);
    }
}
