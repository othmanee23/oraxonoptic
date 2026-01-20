<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionOffer extends Model
{
    protected $fillable = [
        'key',
        'label',
        'store_limit',
        'monthly_price',
        'is_custom',
        'type_label',
        'currency',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'is_custom' => 'boolean',
        ];
    }
}
