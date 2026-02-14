<?php

namespace Aaran\admin\database\seeders;

use Aaran\admin\Models\Permission;
use Aaran\admin\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    use \Illuminate\Database\Console\Seeds\WithoutModelEvents;

    public function run(): void
    {
        $users = [
            ['Sundar',           'sundar@sundar.com',     'Kalarani1@@',    ['super-admin']],
            ['Demo',             'demo@demo.com',         'Password1',   ['super-admin']],
            ['DevOps',           'devops@codexsun.com',   'Devops123',  ['devops']],
        ];

        $created = $updated = 0;

        foreach ($users as [$name, $email, $plainPassword, $roleNames]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => Hash::make($plainPassword),
                    'active' => true,
                ]
            );

            $roles = Role::whereIn('name', $roleNames)
                ->where('guard_name', 'web')
                ->get();

            $user->roles()->sync($roles->pluck('id')->all());

            $user->wasRecentlyCreated ? $created++ : $updated++;
        }

        // ──────── GRANT ALL PERMISSIONS TO SUPER-ADMIN ────────
        $superAdminRole = Role::where('name', 'super-admin')
            ->where('guard_name', 'web')
            ->first();

        if ($superAdminRole) {
            $allPermissions = Permission::where('guard_name', 'web')
                ->pluck('id') // pluck IDs for pivot
                ->toArray();

            // Replace all existing permissions
            $superAdminRole->permissions()->sync($allPermissions);

            $this->command->info('Super-admin granted ALL permissions ('.count($allPermissions).')');
        }

        $this->command->info("Users: {$created} created, {$updated} updated.");
    }
}
