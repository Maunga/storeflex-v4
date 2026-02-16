<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PaynowEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $reference;
    public $message;

    public function __construct($reference, $message)
    {
        Log::info('PaynowEvent: ' . $message);
        $this->reference = $reference;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel("paynow-channel");
    }

    public function broadcastAs()
    {
        return 'PaynowEvent';
    }

    public function broadcastWith()
    {
        return [
            'message'      => $this->message,
            'reference'      => $this->reference,
        ];
    }
}
