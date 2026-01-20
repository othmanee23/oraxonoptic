<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrder extends Model
{
    protected $fillable = [
        'store_id',
        'reference',
        'supplier_name',
        'supplier_id',
        'status',
        'type',
        'total_amount',
        'invoice_id',
        'invoice_number',
        'client_name',
        'lens_type',
        'lens_treatments',
        'lens_parameters',
        'items',
        'notes',
        'expected_date',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'lens_treatments' => 'array',
            'lens_parameters' => 'array',
            'items' => 'array',
            'total_amount' => 'decimal:2',
            'expected_date' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
