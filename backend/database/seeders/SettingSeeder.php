<?php
// database/seeders/SettingSeeder.php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Check if settings already exist
        if (Setting::count() > 0) {
            $this->command->info('Settings already exist. Skipping...');
            return;
        }

        $this->command->info('Creating default settings...');

        Setting::create([
            'company_name' => 'Simple POS',
            'company_email' => 'info@simplepos.com',
            'company_phone' => '+6281234567890',
            'company_address' => 'Jl. Pahlawan No. 123, Jakarta, Indonesia',
            'tax_number' => '123.456.789.0-000.000',
            'tax_rate' => 11.0, // PPN Indonesia 11%
            'currency' => 'IDR',
            'logo' => null, // Logo akan diupload melalui UI
            'favicon' => null, // Favicon akan diupload melalui UI
            'invoice_auto_print' => false,
        ]);

        $this->command->info('Default settings created successfully!');
    }
}