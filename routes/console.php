<?php

use App\Jobs\UpdateAgentxOrderBalance;
use App\Models\Order;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Order::where('pushed', false)
        ->where('amount_paid', '>', 0)
        ->each(function ($order) {
            Log::info('Scheduling UpdateAgentxOrderBalance job for unpushed order', [
                'order_id' => $order->id,
                'amount_paid' => $order->amount_paid,
            ]);
            UpdateAgentxOrderBalance::dispatch($order->id);
        });
})->everyMinute()->name('sync-unpushed-orders-to-agentx')->withoutOverlapping();

Schedule::command('bookmarks:purge-expired')->daily();