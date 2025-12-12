<?php

return [
    'roadmap' => [
        'phase_1' => [
            'name' => 'Authentification & Utilisateurs',
            'tasks' => [
                'Installation Laravel LTS',
                'Configuration base de données',
                'Gestion des rôles et permissions',
                'CRUD utilisateurs (bailleurs, locataires, employés)',
                'Connexion, inscription, récupération mot de passe'
            ]
        ],

        'phase_2' => [
            'name' => 'Gestion des biens et propriétés',
            'tasks' => [
                'Création des entités Bien, Propriétaire, Multi-propriétaires',
                'Fiche bien avec diagnostics et annexes',
                'Gestion équipements et compteurs',
                'Modèle document lié au bien (bail, quittances)'
            ]
        ],

        'phase_3' => [
            'name' => 'Gestion des locataires',
            'tasks' => [
                'Création et modification de la fiche locataire',
                'Gestion garant et RIB',
                'Portail locataire et invitation',
                'Transformation candidats en locataires'
            ]
        ],

        'phase_4' => [
            'name' => 'Baux & Locations',
            'tasks' => [
                'Création du bail et choix type (nu, meublé, colocation, saisonnier)',
                'Paramétrage loyer, charges, dépôt, échéances, prorata',
                'Génération des baux et annexes',
                'Signature électronique et archivage'
            ]
        ],

        'phase_5' => [
            'name' => 'Loyers & Paiements',
            'tasks' => [
                'Génération automatique des loyers',
                'Avis d’échéance et relances',
                'Encaissements et rapprochements bancaires',
                'Paiements en ligne intégrés (Stripe/PayPal/GoCardless)'
            ]
        ],

        'phase_6' => [
            'name' => 'Charges, révisions et comptabilité',
            'tasks' => [
                'Suivi des charges et pièces jointes',
                'Révision annuelle et indexation',
                'Tableaux revenus/dépenses et exports',
                'Préparation déclarations foncières'
            ]
        ],

        'phase_7' => [
            'name' => 'Documents & États des lieux',
            'tasks' => [
                'Gestion EDL d’entrée/sortie',
                'Inventaire mobilier',
                'PDF & signature électronique',
                'Archivage et historique'
            ]
        ],

        'phase_8' => [
            'name' => 'Interventions & Maintenance',
            'tasks' => [
                'Tickets de maintenance',
                'Gestion tâches et rappels',
                'Notifications et historique'
            ]
        ],

        'phase_9' => [
            'name' => 'Messagerie & Notifications',
            'tasks' => [
                'Messagerie interne bailleur ↔ locataire',
                'Notifications email programmables',
                'Historique et suivi'
            ]
        ],

        'phase_10' => [
            'name' => 'Applications mobiles et API',
            'tasks' => [
                'Préparer endpoints API pour mobile',
                'Gestion multi-biens et documents',
                'Synchronisation agenda et notifications'
            ]
        ],

        'phase_11' => [
            'name' => 'Tests & Déploiement',
            'tasks' => [
                'Tests unitaires et fonctionnels',
                'Seeders et données tests',
                'Configuration prod/dev/staging',
                'Jobs et queues pour tâches asynchrones'
            ]
        ],

        'phase_12' => [
            'name' => 'Documentation & Maintenabilité',
            'tasks' => [
                'Documentation API et guide utilisateur',
                'Diagrammes ERD et workflow',
                'Plan de maintenance et historique des versions'
            ]
        ],
    ]
];
