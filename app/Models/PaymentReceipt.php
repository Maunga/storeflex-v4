<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'provider',
        'reference',
        'provider_reference',
        'amount',
        'currency',
        'status',
        'metadata',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the order that this payment belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Check if the payment is successful.
     */
    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    /**
     * Mark the payment as paid.
     */
    public function markAsPaid(string $providerReference = null): void
    {
        $this->update([
            'status' => 'paid',
            'provider_reference' => $providerReference ?? $this->provider_reference,
            'paid_at' => now(),
        ]);
    }

    /**
     * Mark the payment as failed.
     */
    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
        ]);
    }
}
