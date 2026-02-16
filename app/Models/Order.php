<?php

namespace App\Models;

use App\Jobs\UpdateAgentxOrderBalance;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'amount_paid' => 'integer',
    ];

    public static function boot()
    {
        parent::boot();

        static::created(function ($order) {
            Log::info('Order created', $order->toArray());
        });

        static::updated(function ($order) {
            $orderArr = $order->toArray();
            Log::info('Order updated', $orderArr);

            Log::info('Order balance and amount paid', [
                'balance' => $orderArr['balance'] / 100,
                'amount_paid' => $orderArr['amount_paid'] / 100,
            ]);

          
        });
    }

    public function purchased_items(): HasMany
    {
        return $this->hasMany(PurchasedItem::class);
    }

    /**
     * Get the payment receipts for this order.
     */
    public function payment_receipts(): HasMany
    {
        return $this->hasMany(PaymentReceipt::class);
    }

    /**
     * Get the total in dollars.
     *
     * @return float
     */
    public function getTotalAttribute($value)
    {
        return $value / 100;
    }

    /**
     * Get the balance in dollars.
     *
     * @return float
     */
    public function getBalanceAttribute($value)
    {
        return $value / 100;
    }

    /**
     * Get the amount paid in dollars.
     *
     * @return float
     */
    public function getAmountPaidAttribute($value)
    {
        return ($value ?? 0) / 100;
    }

    /**
     * Set the balance in cents.
     *
     * @param  float  $value
     * @return void
     */
    public function setBalanceAttribute($value)
    {
        $this->attributes['balance'] = ((float)str_replace(',', '', $value)) * 100;
    }

    /**
     * Set the total in cents.
     *
     * @param  float  $value
     * @return void
     */
    public function setTotalAttribute($value)
    {
        $this->attributes['total'] = ((float)str_replace(',', '', $value)) * 100;
    }

    /**
     * Set the amount paid in cents.
     *
     * @param  float  $value
     * @return void
     */
    public function setAmountPaidAttribute($value)
    {
        $this->attributes['amount_paid'] = ((float)str_replace(',', '', $value)) * 100;
    }

    /**
     * Check if the order is fully paid.
     */
    public function isFullyPaid(): bool
    {
        return $this->balance <= 0;
    }

    /**
     * Check if the order is partially paid.
     */
    public function isPartiallyPaid(): bool
    {
        return $this->amount_paid > 0 && $this->balance > 0;
    }

    /**
     * Get a payment reference for this order.
     */
    public function generatePaymentReference(): string
    {
        return 'SF-' . $this->id . '-' . time();
    }

    /**
     * Find an order by payment reference.
     */
    public static function findByPaymentReference(string $reference): ?self
    {
        // Reference format: SF-{order_id}-{timestamp}
        $parts = explode('-', $reference);
        if (count($parts) >= 2 && $parts[0] === 'SF') {
            return self::find($parts[1]);
        }

        // Also check payment_reference column
        return self::where('payment_reference', $reference)->first();
    }

    public function shipping_details(): HasOne
    {
        return $this->hasOne(ShippingInformation::class);
    }

    public function billing_details(): HasOne
    {
        return $this->hasOne(BillingInformation::class);
    }
}
