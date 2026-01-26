<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionDuration extends Model
{
    protected $fillable = [
        'months',
        'base_price',
        'label',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
        ];
    }
}
