# Documentation - Module de Gestion des Finances

## Vue d'ensemble
Le module de gestion des finances a été intégré au tableau de bord admin en se basant sur le contrôleur backend `FinanceController.php`. Ce module offre une vue complète de tous les aspects financiers de la plateforme Gestiloc.

## Fichiers créés

### Services API
- **`src/services/financeApi.ts`** - Service API pour communiquer avec le backend
  - `getDashboard()` - Récupère les statistiques financières principales
  - `getTransactions()` - Liste les transactions FedaPay avec filtres
  - `getAlerts()` - Récupère les alertes financières
  - `generateReport()` - Génère des rapports (CSV/PDF)
  - `downloadReport()` - Utilitaire pour télécharger les fichiers

### Composants React
1. **`src/pages/Admin/components/FinanceManagement.tsx`** - Composant principal
   - Vue d'ensemble des finances
   - Statistiques principales (revenus, commissions, etc.)
   - Graphiques de tendances
   - Navigation par onglets

2. **`src/pages/Admin/components/TransactionsList.tsx`** - Gestion des transactions
   - Liste paginée des transactions FedaPay
   - Filtres avancés (statut, montant, dates, emails)
   - Tri customisable
   - Export des données

3. **`src/pages/Admin/components/FinancialAlerts.tsx`** - Gestion des alertes
   - Affichage des alertes financières
   - Filtrage par sévérité (critique, élevée, moyenne, info)
   - Sélection de période
   - Affichage des détails des alertes (seuils, valeurs actuelles)

4. **`src/pages/Admin/components/ReportGenerator.tsx`** - Génération de rapports
   - Sélection du type de rapport (revenus, transactions, commissions)
   - Choix de la période (prédéfinie ou personnalisée)
   - Format d'export (CSV, PDF)
   - Historique des rapports générés

## Intégrations effectuées

### App.tsx
- Import du composant `FinanceManagement`
- Ajout du cas 'finance' dans le switch de `renderView()`

### types.ts
- Ajout du type 'finance' à la union type `ViewType`

### Sidebar.tsx
- Import de l'icône `BarChart3` (lucide-react)
- Ajout du menu "Finances" dans la liste des éléments du menu
- Affichage avec le label "Finances"

## Fonctionnalités principales

### 1. Vue d'ensemble (Overview)
- Statistiques clés:
  - Revenus totaux
  - Commissions plateforme
  - Revenus nets
  - Taux de succès des transactions

- Statistiques des transactions:
  - Total des transactions
  - Transactions réussies/échouées/en attente
  - Montant moyen des transactions

- Graphiques:
  - Tendance des revenus (courbe)
  - Tendance des transactions (barres)

### 2. Gestion des transactions
- Filtrage par:
  - Statut (réussie, échouée, en attente)
  - ID de transaction
  - Email du locataire/propriétaire
  - Plage de montants
  - Plage de dates

- Pagination (25 éléments par page)
- Tri par date, montant ou statut
- Affichage détaillé de chaque transaction

### 3. Alertes financières
Types d'alertes suivis:
- **Critique**: Activité suspecte (fraude potentielle)
- **Élevée**: 
  - Taux d'échec élevé des paiements
  - Volume anormal de transactions

- **Moyenne**: Transactions en attente prolongées
- **Info**: Seuil de revenus dépassé

### 4. Générateur de rapports
Types de rapports:
1. **Rapport des revenus**
   - Détail par facture payée
   - Propriétaire, locataire, montant

2. **Rapport des transactions**
   - Historique FedaPay complet
   - Statuts, montants, adresses IP

3. **Rapport des commissions**
   - Commissions par propriétaire
   - Revenus totaux/nets
   - Taux de commission

Périodes disponibles:
- Aujourd'hui
- Cette semaine
- Ce mois-ci
- Ce trimestre
- Cette année
- Période personnalisée

## Formats supportés
- **CSV**: Immédiatement disponible
- **PDF**: Configuration additionnelle requise (librairie DomPDF)

## Points de connexion avec le backend

### Endpoints utilisés
```
GET  /admin/finance/dashboard?period={period}
GET  /admin/finance/transactions?{filters}
GET  /admin/finance/alerts?period={period}
POST /admin/finance/reports
```

### Modèles de données
- `Payment` - Transactions de paiement
- `Invoice` - Factures générées
- `Lease` - Contrats de location
- `Property` - Propriétés
- `Landlord/Tenant` - Utilisateurs

## Configuration requise

### Environnement
- Node.js et npm/bun installés
- Frontend configuré avec React + TypeScript
- Backend Laravel avec les routes API configurées

### Dépendances
- `recharts` - Graphiques (déjà dans le projet)
- `lucide-react` - Icônes (déjà dans le projet)
- API service existante (`services/api.ts`)

## Utilisation

### Accès au module
1. Naviguer vers le tableau de bord admin
2. Cliquer sur "Finances" dans la barre latérale
3. Explorer les 4 onglets:
   - Vue d'ensemble
   - Transactions
   - Alertes
   - Rapports

### Exemple de génération de rapport
1. Aller à l'onglet "Rapports"
2. Sélectionner le type (ex: "Revenus")
3. Choisir la période (ex: "Ce mois-ci")
4. Sélectionner le format (CSV recommandé)
5. Cliquer "Générer le rapport"
6. Le fichier est téléchargé automatiquement

### Filtrage des transactions
1. Aller à l'onglet "Transactions"
2. Cliquer sur le bouton "Filtres"
3. Remplir les critères souhaités
4. Les résultats se mettent à jour automatiquement

## Prochaines étapes (optionnelles)

1. **Implémentation PDF**
   - Intégrer une librairie côté backend (DomPDF)
   - Mettre à jour le endpoint `/admin/finance/reports`

2. **Alertes en temps réel**
   - Intégrer WebSocket pour les alertes critiques
   - Notifications push

3. **Export avancé**
   - Support multi-format supplémentaires
   - Export par email

4. **Tableau de bord personnalisé**
   - Widgets customisables
   - Sauvegarde des préférences utilisateur

5. **Analytique avancée**
   - Prévisions de revenus
   - Analyse des tendances
   - Comparaison périodique

## Notes de développement

### Architecture
- Composants React fonctionnels avec hooks
- Gestion d'état locale avec `useState`
- Appels API centralisés via `financeApi`
- Messages toast pour feedback utilisateur

### Styling
- Tailwind CSS avec support dark mode
- Responsive design (mobile, tablet, desktop)
- Animations et transitions fluides

### Erreurs et gestion
- Gestion centralisée des erreurs API
- Messages d'erreur utilisateur-friendly
- États de chargement et vides

## Support et maintenance

Pour toute question ou problème:
1. Vérifier que les routes API backend sont accessibles
2. Vérifier les logs de la console navigateur
3. Consulter la documentation du FinanceController.php backend
