<?php

namespace Aaran\Tenant\Models\Scopes;

use Aaran\Tenant\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->bound(Tenant::class)) {
            return;
        }

        $tenant = app(Tenant::class);

        $builder->where(function ($q) use ($tenant, $model) {
            $q->where($model->getTable().'.tenant_id', $tenant->id)
                ->orWhereNull($model->getTable().'.tenant_id');
        });
    }
}
