<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', 'superadmin@optic.local');
        $firstName = env('SUPER_ADMIN_FIRST_NAME', 'Super');
        $lastName = env('SUPER_ADMIN_LAST_NAME', 'Admin');
        $password = env('SUPER_ADMIN_PASSWORD', 'superadmin123');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name' => trim($firstName.' '.$lastName),
                'first_name' => $firstName,
                'last_name' => $lastName,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'is_active' => true,
                'is_pending_approval' => false,
            ]
        );
    }
}
