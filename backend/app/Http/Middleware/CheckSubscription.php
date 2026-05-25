<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->is_super_admin) {
            $clinica = $user->clinica;

            if (! $clinica || ! $clinica->assinaturaAtiva()) {
                return response()->json([
                    'message' => 'Assinatura expirada ou clínica inativa.',
                    'code'    => 'SUBSCRIPTION_EXPIRED',
                ], 403);
            }
        }

        return $next($request);
    }
}
