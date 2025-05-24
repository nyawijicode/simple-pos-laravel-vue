<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
        'tax_number',
        'tax_rate',
        'currency',
        'logo',
        'favicon',
        'invoice_auto_print',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'tax_rate' => 'decimal:2',
        'invoice_auto_print' => 'boolean',
    ];
}