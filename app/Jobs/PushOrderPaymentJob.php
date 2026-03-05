<?php

namespace App\Jobs;

use App\Models\Order;
use App\Models\PaymentReceipt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushOrderPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(protected int $paymentId)
    {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $payment = PaymentReceipt::find($this->paymentId);
        if (!$payment) {
            Log::error("PushOrderPaymentJob: Payment not found", ['payment_id' => $this->paymentId]);
            return;
        }

        $order = $payment->order;
        if (!$order) {
            Log::error("PushOrderPaymentJob: Order not found for payment", ['payment_id' => $this->paymentId]);
            return;
        }

        $url = config('services.agentx.domain') . 'v1/orders/upload-sf-pop';
        $payload = [
            'order_id' => $order->woocommerce_order_id,
            'amount' => $payment->amount * 100,
        ];

        Log::info('PushOrderPaymentJob: Sending payment data', $payload);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.agentx.master_key'),
                'Production' => 'true',
            ])->post($url, $payload);

            $responseData = $response->json();

            Log::info('PushOrderPaymentJob: Response', [
                'status' => $response->status(),
                'body' => $responseData,
            ]);

            if ($response->successful() && ($responseData['success'] ?? false)) {
                $approved = $responseData['data']['approved'] ?? 0;
                $payment->update(['pushed' => (bool) $approved]);
                Log::info('PushOrderPaymentJob: Payment pushed status updated', [
                    'payment_id' => $this->paymentId,
                    'approved' => $approved,
                    'pushed' => (bool) $approved,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('PushOrderPaymentJob: Request failed', [
                'payment_id' => $this->paymentId,
                'error' => $e->getMessage(),
            ]);
            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('PushOrderPaymentJob: Job failed after retries', [
            'payment_id' => $this->paymentId,
            'error' => $exception->getMessage(),
        ]);
    }
}
