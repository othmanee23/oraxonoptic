<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PricingConfig extends Model
{
    protected $fillable = [
        'monthly_price',
        'price_per_store',
        'currency',
    ];

    protected function casts(): array
    {
        return [
            'monthly_price' => 'decimal:2',
            'price_per_store' => 'decimal:2',
        ];
    }
}
