<?php

namespace App\Services\Fedapay;

use Illuminate\Support\Facades\Http;

class FedapayClient
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $env = config('fedapay.env', 'sandbox');
        $this->baseUrl = $env === 'live'
            ? 'https://api.fedapay.com/v1'
            : 'https://sandbox-api.fedapay.com/v1';

        $this->apiKey = (string) config('fedapay.api_key');
    }

    public function post(string $path, array $payload = []): array
    {
        $res = Http::withToken($this->apiKey)
            ->acceptJson()
            ->asJson()
            ->post($this->baseUrl . $path, $payload);

        if (!$res->successful()) {
            throw new \RuntimeException("FedaPay POST {$path} failed: " . $res->body());
        }

        return $res->json();
    }

    public function get(string $path): array
    {
        $res = Http::withToken($this->apiKey)
            ->acceptJson()
            ->get($this->baseUrl . $path);

        if (!$res->successful()) {
            throw new \RuntimeException("FedaPay GET {$path} failed: " . $res->body());
        }

        return $res->json();
    }
}
