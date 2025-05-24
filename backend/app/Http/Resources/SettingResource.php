<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'company_email' => $this->company_email,
            'company_phone' => $this->company_phone,
            'company_address' => $this->company_address,
            'tax_number' => $this->tax_number,
            'tax_rate' => $this->tax_rate,
            'currency' => $this->currency,
            'logo' => $this->logo ? asset('storage/' . $this->logo) : null,
            'favicon' => $this->favicon ? asset('storage/' . $this->favicon) : null,
            'invoice_auto_print' => $this->invoice_auto_print,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}