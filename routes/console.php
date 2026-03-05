<?php

use App\Jobs\PushOrderPaymentJob;
use App\Jobs\UpdateAgentxOrderBalance;
use App\Models\Order;
use App\Models\PaymentReceipt;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Push unpushed payments to AgentX every 5 minutes
Schedule::call(function () {
    // Find paid receipts that haven't been pushed yet
    PaymentReceipt::where('status', 'paid')
        ->where('pushed', false)
        ->each(function ($payment) {
            Log::info('Scheduling PushOrderPaymentJob for unpushed payment', [
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'amount' => $payment->amount,
            ]);
            PushOrderPaymentJob::dispatch($payment->id);
        });
})->everyFiveMinutes()->name('push-unpushed-payments-to-agentx')->withoutOverlapping();

Schedule::command('bookmarks:purge-expired')->daily();