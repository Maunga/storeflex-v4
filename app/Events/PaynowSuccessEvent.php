<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PaynowSuccessEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user_id;
    public $message;

    public function __construct($user_id, $message)
    {
        $this->user_id = $user_id;
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel("paynow-success-channel-{$this->user_id}");
    }

    public function broadcastAs()
    {
        return 'PaynowSuccessEvent';
    }

    public function broadcastWith()
    {
        return [
            'message'      => $this->message,
        ];
    }
}
