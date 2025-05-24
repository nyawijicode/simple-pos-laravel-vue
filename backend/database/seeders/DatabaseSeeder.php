<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // User permissions
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',

            // Category permissions
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',

            // Product permissions
            'product-list',
            'product-create',
            'product-edit',
            'product-delete',

            // Customer permissions
            'customer-list',
            'customer-create',
            'customer-edit',
            'customer-delete',

            // Sale permissions
            'sale-list',
            'sale-create',
            'sale-edit',
            'sale-delete',

            // Setting permissions
            'setting-edit',

            // Dashboard permission
            'dashboard-view',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::create(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        $managerRole = Role::create(['name' => 'manager']);
        $managerRole->givePermissionTo([
            'user-list',
            'category-list',
            'category-create',
            'category-edit',
            'category-delete',
            'product-list',
            'product-create',
            'product-edit',
            'product-delete',
            'customer-list',
            'customer-create',
            'customer-edit',
            'customer-delete',
            'sale-list',
            'sale-create',
            'sale-edit',
            'sale-delete',
            'setting-edit',
            'dashboard-view',
        ]);

        $cashierRole = Role::create(['name' => 'cashier']);
        $cashierRole->givePermissionTo([
            'product-list',
            'customer-list',
            'customer-create',
            'customer-edit',
            'sale-list',
            'sale-create',
            'dashboard-view',
        ]);

        $userRole = Role::create(['name' => 'user']);
        $userRole->givePermissionTo([
            'product-list',
            'customer-list',
            'sale-list',
        ]);

        // Create admin user
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);
        $adminUser->assignRole('admin');

        // Create manager user
        $managerUser = User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
        ]);
        $managerUser->assignRole('manager');

        // Create cashier user
        $cashierUser = User::create([
            'name' => 'Cashier User',
            'email' => 'cashier@example.com',
            'password' => Hash::make('password'),
        ]);
        $cashierUser->assignRole('cashier');
    }
}