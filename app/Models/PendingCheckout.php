<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class PendingCheckout extends Model
{
    protected $fillable = [
        'reference',
        'provider',
        'amount',
        'payment_percentage',
        'checkout_data',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'checkout_data' => 'array',
        'amount' => 'decimal:2',
        'payment_percentage' => 'integer',
        'expires_at' => 'datetime',
    ];

    /**
     * Find a pending checkout by its payment reference.
     */
    public static function findByReference(string $reference): ?self
    {
        return static::where('reference', $reference)->first();
    }

    /**
     * Find an active (non-expired) pending checkout by reference.
     */
    public static function findActiveByReference(string $reference): ?self
    {
        return static::where('reference', $reference)
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Atomically claim this checkout for processing.
     * Returns true only if this call transitioned it from 'pending' to 'processing'.
     * This prevents duplicate order creation from concurrent requests.
     */
    public function claim(): bool
    {
        $affected = static::where('id', $this->id)
            ->where('status', 'pending')
            ->update(['status' => 'processing']);

        if ($affected > 0) {
            $this->status = 'processing';
            return true;
        }

        return false;
    }

    /**
     * Mark as paid.
     */
    public function markAsPaid(): bool
    {
        return $this->update(['status' => 'paid']);
    }

    /**
     * Mark as expired.
     */
    public function markAsExpired(): bool
    {
        return $this->update(['status' => 'expired']);
    }

    /**
     * Mark as cancelled.
     */
    public function markAsCancelled(): bool
    {
        return $this->update(['status' => 'cancelled']);
    }

    /**
     * Scope a query to only include pending checkouts.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include non-expired checkouts.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now());
    }

    /**
     * Check if checkout is still valid.
     */
    public function isValid(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isFuture();
    }
}
