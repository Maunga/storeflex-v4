<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UpdateAgentxOrderBalance implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(protected int $orderId)
    {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $order = Order::find($this->orderId);
        if (!$order) {
            Log::error("UpdateAgentxOrderBalance: Order not found", ['order_id' => $this->orderId]);
            return;
        }

        $url = config('services.agentx.domain') . 'v1/orders/upload-sf-pop';
        $payload = [
            'order_id' => $order->woocommerce_order_id,
            'amount' => $order->amount_paid * 100,
        ];

        Log::info('UpdateAgentxOrderBalance: Sending payment data', $payload);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.agentx.master_key'),
                'Production' => 'true',
            ])->post($url, $payload);

            $responseData = $response->json();

            Log::info('UpdateAgentxOrderBalance: Response', [
                'status' => $response->status(),
                'body' => $responseData,
            ]);

            if ($response->successful() && ($responseData['success'] ?? false)) {
                $approved = $responseData['data']['approved'] ?? 0;
                $order->update(['pushed' => (bool) $approved]);
                Log::info('UpdateAgentxOrderBalance: Order pushed status updated', [
                    'order_id' => $this->orderId,
                    'approved' => $approved,
                    'pushed' => (bool) $approved,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('UpdateAgentxOrderBalance: Request failed', [
                'order_id' => $this->orderId,
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
        Log::error('UpdateAgentxOrderBalance: Job failed after retries', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
        ]);
    }
}
