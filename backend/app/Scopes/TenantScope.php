<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (! app()->bound('tenant_id')) {
            return;
        }

        $tenantId = app('tenant_id');
        if ($tenantId) {
            $builder->where($model->getTable() . '.clinica_id', $tenantId);
        }
    }
}
