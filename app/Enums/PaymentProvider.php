<?php

namespace App\Enums;

enum PaymentProvider: string
{
    case CASH = 'cash';
    case ECOCASH = 'ecocash';
    case PAYNOW = 'paynow';
    case PAYPAL = 'paypal';
    case STRIPE = 'stripe';

    public function label(): string
    {
        return match ($this) {
            self::CASH => 'Cash Drop Off',
            self::ECOCASH => 'EcoCash',
            self::PAYNOW => 'Paynow',
            self::PAYPAL => 'PayPal',
            self::STRIPE => 'Stripe',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::CASH => 'Pay minimum 75% within 3 days, balance on delivery',
            self::ECOCASH => 'Pay with EcoCash mobile money - USSD prompt sent to your phone',
            self::PAYNOW => 'Pay via Paynow (Bank transfer, ZimSwitch, etc.)',
            self::PAYPAL => 'Pay with PayPal account or credit/debit card',
            self::STRIPE => 'Pay with credit/debit card via Stripe',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::CASH => 'cash',
            self::ECOCASH => 'ecocash',
            self::PAYNOW => 'paynow',
            self::PAYPAL => 'paypal',
            self::STRIPE => 'stripe',
        };
    }
}
