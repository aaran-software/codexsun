<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Aaran\admin\Models\Role;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function permissions(): Collection
    {
        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique();
    }

    public function hasPermissionTo(string $permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    public function hasRole($role): bool
    {
        if (is_array($role)) {
            return $this->roles->pluck('name')->intersect($role)->isNotEmpty();
        }

        return $this->roles->pluck('name')->contains($role);
    }

    public function hasPermission($permission): bool
    {
        return $this->permissions()->contains($permission);
    }

    public function assignRole(...$roles): static
    {
        $roles = collect($roles)->flatten()->map(function ($role) {
            if ($role instanceof Role) {
                return $role;
            }

            // Find existing role (fail if not found)
            return Role::where('name', $role)
                ->where('guard_name', 'web')
                ->firstOrFail();
        });

        $this->roles()->syncWithoutDetaching($roles->pluck('id')->all());

        return $this;
    }

    public function removeRole(...$roleNames): void
    {
        $roles = Role::whereIn('name', $roleNames)->pluck('id');
        $this->roles()->detach($roles);
    }

    public function syncRoles($roleNames): void
    {
        $roles = Role::whereIn('name', $roleNames)->pluck('id');
        $this->roles()->sync($roles);
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    // Accessor for profile photo URL
    protected $appends = ['profile_photo_url', 'default_profile_photo_url'];

    public function getProfilePhotoUrlAttribute(): string
    {
        return $this->profile_photo_path
            ? asset('storage/'.$this->profile_photo_path)
            : $this->default_profile_photo_url;
    }

    public function getDefaultProfilePhotoUrlAttribute(): string
    {
        $initials = trim(collect(explode(' ', $this->name))
            ->map(fn ($part) => mb_substr($part, 0, 1))
            ->join(' ')
        );

        return 'https://ui-avatars.com/api/?name='.urlencode($initials).'&color=7F9CF5&background=EBF4FF';
    }

    // Optional: Delete old photo on update
    public function deleteProfilePhoto()
    {
        if ($this->profile_photo_path && Storage::disk('public')->exists($this->profile_photo_path)) {
            Storage::disk('public')->delete($this->profile_photo_path);
        }
    }

    public function scopeEngineer($query)
    {
        return $query->whereHas('roles', fn ($q) => $q->where('name', 'engineer'));
    }
}
