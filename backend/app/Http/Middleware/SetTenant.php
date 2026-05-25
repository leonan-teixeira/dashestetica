<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->clinica_id && ! $user->is_super_admin) {
            app()->instance('tenant_id', $user->clinica_id);
        }

        return $next($request);
    }
}
