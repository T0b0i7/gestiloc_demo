<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuration Financière Gestiloc
    |--------------------------------------------------------------------------
    |
    | Paramètres pour le monitoring financier et les alertes
    |
    */

    // Taux de commission plate-forme (5% par défaut)
    'commission_rate' => env('GESTILOC_COMMISSION_RATE', 0.05),

    /*
    |--------------------------------------------------------------------------
    | Seuils d'alertes
    |--------------------------------------------------------------------------
    */
    'alerts' => [
        // Nombre de paiements échoués pour déclencher une alerte
        'failed_payments_threshold' => env('FAILED_PAYMENTS_THRESHOLD', 10),

        // Seuil de revenus pour alerte (en XOF)
        'revenue_threshold' => env('REVENUE_THRESHOLD', 1000000),

        // Nombre d'heures pour considérer une transaction comme "en attente prolongée"
        'pending_threshold' => env('PENDING_TRANSACTION_HOURS', 24),

        // Multiplicateur pour détecter les volumes anormaux (3x la moyenne)
        'volume_anomaly_multiplier' => env('VOLUME_ANOMALY_MULTIPLIER', 3),
    ],

    /*
    |--------------------------------------------------------------------------
    | Export settings
    |--------------------------------------------------------------------------
    */
    'exports' => [
        // Limite de lignes pour les exports CSV
        'max_export_rows' => env('MAX_EXPORT_ROWS', 10000),

        // Format par défaut pour les exports
        'default_format' => env('DEFAULT_EXPORT_FORMAT', 'csv'),
    ],
];
