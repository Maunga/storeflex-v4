<?php

namespace App\Models;

use App\Enums\PaynowStatus;
use Illuminate\Database\Eloquent\Model;

class Paynow extends Model
{
    protected $table = 'paynow';

    protected $fillable = [
        'reference',
        'paynowreference',
        'amount',
        'paynow_status',
        'currency',
        'pollurl',
        'hash',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'status' => PaynowStatus::class,
    ];

    /**
     * Find by reference
     */
    public static function findByReference(string $reference): ?self
    {
        return static::where('reference', $reference)->first();
    }

    /**
     * Find by Paynow reference
     */
    public static function findByPaynowReference(string $paynowReference): ?self
    {
        return static::where('paynowreference', $paynowReference)->first();
    }

    /**
     * Find by poll URL
     */
    public static function findByPollUrl(string $pollUrl): ?self
    {
        return static::where('pollurl', $pollUrl)->first();
    }

    /**
     * Check if payment is pending
     */
    public function isPending(): bool
    {
        return $this->status === PaynowStatus::PENDING;
    }

    /**
     * Check if payment was pushed (USSD sent)
     */
    public function isPushed(): bool
    {
        return $this->status === PaynowStatus::PUSHED;
    }

    /**
     * Mark as pushed
     */
    public function markAsPushed(): void
    {
        $this->update(['status' => PaynowStatus::PUSHED]);
    }

    /**
     * Mark as paid
     */
    public function markAsPaid(): void
    {
        $this->update(['status' => PaynowStatus::PAID]);
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => PaynowStatus::FAILED]);
    }

    /**
     * Mark as cancelled
     */
    public function markAsCancelled(): void
    {
        $this->update(['status' => PaynowStatus::CANCELLED]);
    }
}
