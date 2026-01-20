<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'client_id',
        'date',
        'prescriber',
        'expiry_date',
        'od_sphere',
        'od_cylinder',
        'od_axis',
        'od_addition',
        'od_pd',
        'og_sphere',
        'og_cylinder',
        'og_axis',
        'og_addition',
        'og_pd',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'expiry_date' => 'date',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
