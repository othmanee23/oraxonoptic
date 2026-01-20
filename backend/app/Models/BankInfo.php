<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankInfo extends Model
{
    protected $fillable = [
        'bank_name',
        'account_name',
        'iban',
        'swift',
        'rib',
    ];
}
