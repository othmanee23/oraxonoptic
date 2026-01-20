<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryNote extends Model
{
    protected $fillable = [
        'store_id',
        'reference',
        'purchase_order_id',
        'purchase_order_ref',
        'supplier_id',
        'supplier_name',
        'items',
        'status',
        'notes',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'validated_at' => 'datetime',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
