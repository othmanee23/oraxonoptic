<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'subtitle',
        'logo',
        'address',
        'city',
        'phone',
        'email',
        'website',
        'ice',
        'rc',
        'patente',
        'cnss',
        'rib',
        'footer_text',
        'primary_color',
        'currency',
        'notify_low_stock_in_app',
        'notify_low_stock_email',
        'notify_workshop_ready_in_app',
        'notify_workshop_ready_email',
        'notify_new_client_in_app',
        'notify_new_client_email',
        'notify_invoice_created_in_app',
        'notify_invoice_created_email',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
