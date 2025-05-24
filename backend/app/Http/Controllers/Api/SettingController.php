<?php

namespace App\Http\Controllers\Api;

use Illuminate\Routing\Controller;

use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct()
    {
        // parent::__construct();
        // $this->middleware('permission:setting-edit');
    }

    /**
     * Display the settings.
     */
    public function index()
    {
        $setting = Setting::first();

        if (!$setting) {
            $setting = Setting::create([
                'company_name' => 'Simple POS',
                'tax_rate' => 0,
                'currency' => 'IDR',
            ]);
        }

        return new SettingResource($setting);
    }

    /**
     * Update the settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'string', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:20'],
            'company_address' => ['nullable', 'string'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'currency' => ['required', 'string', 'max:10'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            'favicon' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,ico', 'max:1024'],
            'invoice_auto_print' => ['boolean'],
        ]);

        $setting = Setting::first();

        if (!$setting) {
            $setting = new Setting();
        }

        $settingData = [
            'company_name' => $request->company_name,
            'company_email' => $request->company_email,
            'company_phone' => $request->company_phone,
            'company_address' => $request->company_address,
            'tax_number' => $request->tax_number,
            'tax_rate' => $request->tax_rate,
            'currency' => $request->currency,
            'invoice_auto_print' => $request->invoice_auto_print ?? false,
        ];

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($setting->logo) {
                Storage::disk('public')->delete($setting->logo);
            }
            $settingData['logo'] = $request->file('logo')->store('settings', 'public');
        }

        if ($request->hasFile('favicon')) {
            // Delete old favicon
            if ($setting->favicon) {
                Storage::disk('public')->delete($setting->favicon);
            }
            $settingData['favicon'] = $request->file('favicon')->store('settings', 'public');
        }

        $setting->fill($settingData);
        $setting->save();

        return new SettingResource($setting);
    }
}