## Module Facturation — Résumé des livrables

Date : 7 janvier 2026

### Objectif
Permettre au propriétaire d’émettre des factures facilement et au locataire de les consulter et les payer en toute sécurité.

Le système couvre :
- la création des factures
- la consultation
- le paiement en ligne
- la confirmation automatique après paiement

### Fonctionnalités livrées

**Côté Propriétaire**

1. Émission d’une facture
- Interface simple pour créer une facture :
  - Sélection de la location
  - Affichage automatique (non modifiable) : nom du locataire, montant du loyer, charges associées
  - Choix du mois de facturation
  - Choix du moyen de paiement : Carte bancaire ou Argent mobile (Mobile Money)
  - Saisie du numéro à débiter (sans choix de réseau)
  - Bouton « Soumettre la facture »

  Remarque : l'interface collecte et transmet les données au backend ; aucune logique de paiement n'est exécutée côté écran.

2. Confirmation après création
- Message : « Facture créée avec succès ».
- Redirection vers la liste des factures ou le détail.

3. Liste des factures
- Affichage clair de toutes les factures avec filtres disponibles.
- Gestion améliorée des erreurs côté client (corrections liées aux réponses serveur).

**Côté Locataire**

4. Tableau de bord — Factures
- Rubrique « Factures » listant : mois, montant, statut.
- Statuts visuels :
  - 🟡 En attente
  - 🔵 En cours de paiement
  - 🟢 Payée
  - 🔴 Échouée
- Actions : télécharger la facture en PDF, voir le détail.

5. Paiement de la facture
- Bouton « Payer » visible uniquement si la facture est en attente.
- Redirection sécurisée vers le prestataire de paiement (Fedapay).
- Aucune manipulation de paiement côté application ; tout est géré par le prestataire.

6. Confirmation après paiement
- Écran de confirmation et affichage du reçu.
- Mise à jour automatique du statut après vérification côté serveur.

### Éléments techniques (simplifiés)
- Ajout du moyen de paiement sur les factures (champ enregistré côté serveur).
- Support des paiements : Carte bancaire et Argent mobile.
- Vérification du paiement via le serveur avant affichage de la confirmation.
- Optimisations : chargement plus rapide des tableaux de bord et gestion séparée des erreurs pour éviter blocages UI.

### Points à vérifier / recommandations
- **Base de données** : s'assurer que les migrations et champs ajoutés sont appliqués et persistés côté serveur.
- **Paiement automatique** : vérifier que Fedapay envoie bien les confirmations (webhooks) et que le backend :
  - met le statut en « Payée »,
  - enregistre les informations de transaction (ID, montant, date).
- **Optionnel** : enregistrer le numéro Mobile Money côté serveur pour traçabilité (vérifier conformité & confidentialité).

### Fichier ajouté
- Résumé ajouté à la racine : [README_FACTURES.md](README_FACTURES.md)

### Commandes Git suggérées
```powershell
git add README_FACTURES.md
git commit -m "Ajout README module facturation"
git push origin tobi1
```

### Prochaines étapes proposées
- Valider le contenu du README avec l'équipe produit.
- Appliquer les migrations DB si nécessaires et tester un cycle de paiement en sandbox Fedapay.
- Monitorer les webhooks en staging pour vérification de la confirmation automatique.

### Contact
Pour toute question technique, consulter `Backend/` et `Frontend/` et contacter l'équipe technique responsable du déploiement.
