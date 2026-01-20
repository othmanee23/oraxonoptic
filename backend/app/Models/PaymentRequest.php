<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class PaymentRequest extends Model
{
    protected $fillable = [
        'user_id',
        'user_email',
        'user_name',
        'amount',
        'months_requested',
        'stores_count',
        'screenshot',
        'submitted_at',
        'status',
        'processed_at',
        'processed_by',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
