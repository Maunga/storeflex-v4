<?php

namespace App\Enums;

enum PaynowStatus: string
{
    case PENDING = 'PENDING';
    case PUSHED = 'PUSHED';
    case PAID = 'PAID';
    case FAILED = 'FAILED';
    case CANCELLED = 'CANCELLED';
}
