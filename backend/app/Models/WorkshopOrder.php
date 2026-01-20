<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkshopOrder extends Model
{
    protected $fillable = [
        'store_id',
        'invoice_id',
        'invoice_number',
        'client_id',
        'client_name',
        'purchase_order_id',
        'purchase_order_ref',
        'order_number',
        'status',
        'priority',
        'lens_type',
        'lens_treatments',
        'lens_parameters',
        'lens_supplier',
        'lens_supplier_order_ref',
        'lens_supplier_id',
        'lens_purchase_price',
        'lens_selling_price',
        'notes',
        'lens_received_at',
        'completed_at',
        'delivered_at',
        'expected_date',
    ];

    protected function casts(): array
    {
        return [
            'lens_treatments' => 'array',
            'lens_parameters' => 'array',
            'lens_purchase_price' => 'decimal:2',
            'lens_selling_price' => 'decimal:2',
            'lens_received_at' => 'datetime',
            'completed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'expected_date' => 'datetime',
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

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }
}
