<?php

namespace App\Enums;

enum CacheKeys: string
{
    case RECENT_ITEMS = 'recent_items';
    case TRENDING_ITEMS = 'trending_items';
    case POPULAR_ITEMS = 'popular_items';
    case DISCOVER_ITEMS = 'discover_items';
    case AMAZONAE_ITEMS = 'amazonae_items';
}
