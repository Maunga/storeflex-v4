<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCheckoutProfile extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getShippingDataAttribute(): array
    {
        return [
            'first_name' => $this->shipping_first_name,
            'last_name' => $this->shipping_last_name,
            'address_1' => $this->shipping_address_1,
            'address_2' => $this->shipping_address_2,
            'city' => $this->shipping_city,
            'state' => $this->shipping_state,
            'postcode' => $this->shipping_postcode,
            'country' => $this->shipping_country,
            'email' => $this->shipping_email,
            'phone' => $this->shipping_phone,
        ];
    }

    public function getBillingDataAttribute(): array
    {
        return [
            'first_name' => $this->billing_first_name,
            'last_name' => $this->billing_last_name,
            'address_1' => $this->billing_address_1,
            'address_2' => $this->billing_address_2,
            'city' => $this->billing_city,
            'state' => $this->billing_state,
            'postcode' => $this->billing_postcode,
            'country' => $this->billing_country,
            'email' => $this->billing_email,
            'phone' => $this->billing_phone,
        ];
    }
}
