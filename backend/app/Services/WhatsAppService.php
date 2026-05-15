<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class WhatsAppService
{
    public function __construct(
        private readonly ?string $url = null,
        private readonly ?string $instance = null,
        private readonly ?string $apiKey = null,
        private readonly string $countryCode = '55',
    ) {}

    public static function fromConfig(): self
    {
        return new self(
            url:         config('services.evolution.url'),
            instance:    config('services.evolution.instance'),
            apiKey:      config('services.evolution.api_key'),
            countryCode: config('services.evolution.country_code', '55'),
        );
    }

    public function isConfigured(): bool
    {
        return ! empty($this->url) && ! empty($this->instance) && ! empty($this->apiKey);
    }

    /**
     * Envia texto simples via Evolution API.
     * Lança RuntimeException em falha para que o caller (Job) possa marcar 'falhou' ou tentar novamente.
     */
    public function enviarTexto(string $telefone, string $texto): array
    {
        if (! $this->isConfigured()) {
            throw new RuntimeException('Evolution API não configurada. Defina EVOLUTION_URL, EVOLUTION_INSTANCE e EVOLUTION_API_KEY no .env.');
        }

        $numero   = $this->normalizarNumero($telefone);
        $endpoint = rtrim($this->url, '/') . "/message/sendText/{$this->instance}";

        $response = Http::withHeaders([
                'apikey'       => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(15)
            ->post($endpoint, [
                'number' => $numero,
                'text'   => $texto,
            ]);

        if (! $response->successful()) {
            Log::warning('Evolution API falhou', [
                'status' => $response->status(),
                'body'   => $response->body(),
                'numero' => $numero,
            ]);

            throw new RuntimeException(
                "Evolution API retornou {$response->status()}: " . substr($response->body(), 0, 200)
            );
        }

        return $response->json() ?? [];
    }

    /**
     * Normaliza número para formato E.164 sem '+'.
     * "(11) 90000-0000" => "5511900000000"
     * "11900000000"     => "5511900000000"
     * "5511900000000"   => "5511900000000"
     */
    public function normalizarNumero(string $telefone): string
    {
        $digitos = preg_replace('/\D/', '', $telefone) ?? '';

        if ($digitos === '') {
            throw new RuntimeException('Telefone vazio.');
        }

        // Já tem código do país BR
        if (str_starts_with($digitos, $this->countryCode) && strlen($digitos) >= 12) {
            return $digitos;
        }

        return $this->countryCode . $digitos;
    }
}
