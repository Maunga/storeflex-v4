<?php

namespace App\Enums;

enum WeightStatus: string {
    case PENDING = 'PENDING';
    case ACCEPTABLE = 'ACCEPTABLE';
    case UNDERWEIGHT = 'UNDERWEIGHT';
    case OVERWEIGHT = 'OVERWEIGHT';
}