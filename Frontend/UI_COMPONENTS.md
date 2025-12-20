# 🎨 Composants UI utilisés dans Locataire

## 📋 Inventaire des composants

Le module Locataire utilise **40+ composants** de la librairie **shadcn/ui**.

### Composants Core (Les plus utilisés)

```
✅ Button           - Boutons d'action
✅ Card             - Conteneurs de contenu
✅ Badge            - Tags/Labels
✅ Tabs             - Navigation par onglets
✅ Dialog           - Modales
✅ Input            - Champs texte
✅ Textarea         - Champs multi-lignes
✅ Label            - Labels de formulaires
```

### Composants Formulaires

```
✅ Input            - Text input
✅ Textarea         - Multi-line text
✅ Select           - Dropdown sélection
✅ Checkbox         - Cases à cocher
✅ RadioGroup       - Boutons radio
✅ DatePicker       - Sélection de date
✅ Toggle           - Boutons toggles
✅ Slider           - Curseur de plage
✅ Switch           - Interrupteur on/off
```

### Composants Navigation

```
✅ Tabs             - Onglets de navigation
✅ Navigation Menu  - Menu de navigation
✅ Breadcrumb       - Fil d'Ariane
✅ Sidebar          - Barre latérale
✅ Menubar          - Barre de menu
```

### Composants Affichage

```
✅ Alert            - Messages d'alerte
✅ Toast            - Notifications
✅ Badge            - Étiquettes
✅ Avatar           - Images de profil
✅ Progress         - Barres de progression
✅ Skeleton         - Placeholder de chargement
✅ Carousel         - Carrousel d'images
```

### Composants Contenu

```
✅ Card             - Cartes de contenu
✅ Accordion        - Accordéons extensibles
✅ Collapsible      - Contenu pliable
✅ Separator        - Séparateurs
✅ ScrollArea       - Zone de défilement
✅ AspectRatio      - Ratio d'aspect fixe
```

### Composants Interaction

```
✅ Dialog           - Fenêtres modales
✅ Drawer           - Tiroirs (mobile-friendly)
✅ DropdownMenu     - Menus déroulants
✅ ContextMenu      - Menus contextuels
✅ Popover          - Popovers
✅ HoverCard        - Cartes au survol
✅ AlertDialog      - Dialogues d'alerte
```

### Composants Données

```
✅ Table            - Tableaux de données
✅ Chart            - Graphiques (Recharts)
✅ Pagination       - Pagination
```

---

## 🎯 Utilisation par onglet

### 🏠 Dashboard

```typescript
// Composants utilisés
<Card>                      // Conteneur principal
  <Badge>                   // Statut paiement
  <Progress>                // Avancement
  <Avatar>                  // Photo utilisateur
  <Button>                  // Actions
  <ScrollArea>              // Listes scrollables
</Card>
```

**Exemple de layout** :
```
┌─────────────────────────────────┐
│ [Avatar] Bienvenue, John!       │
├─────────────────────────────────┤
│ Votre Compte                    │
│ ┌─────────────┐ ┌─────────────┐│
│ │ Loyer: 1000FCFA│ │ Paiements: 3││
│ │ [Badge]     │ │ [Badge]     ││
│ └─────────────┘ └─────────────┘│
│                                 │
│ [Boutons rapides]               │
├─────────────────────────────────┤
│ Derniers paiements              │
│ ┌─────────────────────────────┐ │
│ │ • Janvier: Payé   [Badge]   │ │
│ │ • Février: En attente [B.]  │ │
│ │ • Mars: En retard   [Badge] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 💳 Payments

```typescript
// Composants utilisés
<Tabs>                      // Filtres (historique, planifié)
  <Table>                   // Liste des paiements
    <Badge>                 // Statut de chaque paiement
    <Button>                // Actions (payer, télécharger)
  </Table>
</Tabs>

<Dialog>                    // Modal de paiement
  <Form>                    // Formulaire
    <Input>                 // Champs
    <Button>                // Soumettre
  </Form>
</Dialog>
```

**Exemple de layout** :
```
┌──────────────────────────────────┐
│ Paiements                        │
├──────────┬───────────────────────┤
│ Historiq.│ Planifiés             │
├──────────┴───────────────────────┤
│ Date    │ Montant │ Statut       │
├─────────┼─────────┼──────────────┤
│ Jan 24  │ FCFA1,000  │ [Payé]       │
│ Fév 24  │ FCFA1,000  │ [Attente]    │
│ Mar 24  │ FCFA1,000  │ [Retard]     │
├─────────┴─────────┴──────────────┤
│ [Payer]  [Télécharger]  [+]     │
└──────────────────────────────────┘
```

### 💬 Messages

```typescript
// Composants utilisés
<Tabs>                      // Conversations (propriétaire, agence)
  <ScrollArea>              // Historique des messages
    <Avatar>                // Photo du contact
    <Badge>                 // "Vous", "Propriétaire"
  </ScrollArea>
  
  <Input>                   // Champ message
  <Button>                  // Envoyer
</Tabs>
```

**Exemple de layout** :
```
┌─────────────────────────────────┐
│ Propriétaire │ Agence          │
├─────────────────────────────────┤
│                                 │
│ [Avatar] Propriétaire           │
│ "Bonjour, comment allez-vous?"  │
│ 14:30                           │
│                                 │
│                   [Avatar] Vous  │
│         "Très bien, merci !"    │
│                               14:32
│                                 │
├─────────────────────────────────┤
│ [Tapez un message...        ] [>]
└─────────────────────────────────┘
```

### 🔧 Interventions

```typescript
// Composants utilisés
<Select>                    // Filtrer par type
  <Tabs>                    // Filtrer par statut
    <Card>                  // Chaque intervention
      <Badge>               // Type et statut
      <Button>              // Actions
    </Card>
  </Tabs>
</Select>

<Dialog>                    // Modal créer intervention
  <Form>
    <Input>                 // Titre
    <Textarea>              // Description
    <Select>                // Type
    <DatePicker>            // Date souhaitée
    <Button>                // Soumettre
  </Form>
</Dialog>
```

**Exemple de layout** :
```
┌────────────────────────────────────┐
│ Interventions Demandées            │
├────────────────────────────────────┤
│ Type:    [Tous ▼]                  │
│ Statut:  [Tous ▼]                  │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ Fuite robinet cuisine          │ │
│ │ [Plomberie] [En cours]         │ │
│ │ 15 Jan 2024                    │ │
│ │ Plombier: Mr. Dupont           │ │
│ │ [Modifier] [Annuler]           │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Radiateur chambre ne chauffe   │ │
│ │ [Chauffage] [Planifié]         │ │
│ │ 20 Jan 2024                    │ │
│ │ [Modifier] [Annuler]           │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ [+ Nouvelle intervention]           │
└────────────────────────────────────┘
```

### 📄 Documents

```typescript
// Composants utilisés
<Tabs>                      // Type de documents
  <ScrollArea>              // Liste des documents
    <Card>                  // Chaque document
      <Avatar>              // Icône type
      <Badge>               // Type
      <Button>              // Télécharger, Voir
    </Card>
  </ScrollArea>
</Tabs>

<Dialog>                    // Visualiseur de documents
  <DocumentViewer />
</Dialog>
```

**Exemple de layout** :
```
┌──────────────────────────────────┐
│ Documents                        │
├──────┬──────┬────────┬───────────┤
│ Tous │ Cont.│ Diagn. │ Charges  │
├──────┴──────┴────────┴───────────┤
│ ┌────────────────────────────────┐
│ │ 📄 Contrat_2023.pdf            │
│ │ [Contrat] • 15 Janvier 2023    │
│ │ [Voir] [Télécharger]           │
│ └────────────────────────────────┘
│
│ ┌────────────────────────────────┐
│ │ 📋 Amiante_Diagnostic.pdf      │
│ │ [Diagnostic] • 10 Janvier 2023 │
│ │ [Voir] [Télécharger]           │
│ └────────────────────────────────┘
│
│ ┌────────────────────────────────┐
│ │ 💰 Charges_Janvier_2024.pdf    │
│ │ [Charges] • 1 Janvier 2024     │
│ │ [Voir] [Télécharger]           │
│ └────────────────────────────────┘
└──────────────────────────────────┘
```

### 🏢 Property / 📋 Lease

```typescript
// Composants utilisés
<Card>                      // Conteneur principal
  <Separator>               // Sections
  <Badge>                   // Informations importantes
  <Progress>                // Durée restante du bail
  <Button>                  // Actions
</Card>

<ScrollArea>                // Contenu long
</ScrollArea>
```

### 👤 Profile

```typescript
// Composants utilisés
<Form>                      // Formulaire
  <Input>                   // Champs personnels
  <DatePicker>              // Dates
  <Button>                  // Sauvegarder
</Form>

<AlertDialog>               // Confirmation déconnexion
  <Button>                  // Déconnexion
</AlertDialog>
```

---

## 🎨 Système de design

### Couleurs

```
Primary      : Bleu (#3b82f6)
Success      : Vert (#10b981)
Warning      : Orange (#f59e0b)
Error        : Rouge (#ef4444)
Neutral      : Gris (#6b7280)
```

### Composants Badge par contexte

```
Statut Paiement:
  Payé        → [Vert] "Payé"
  En attente  → [Orange] "En attente"
  En retard   → [Rouge] "En retard"
  Impayé      → [Rouge] "Impayé"

Statut Intervention:
  Planifié    → [Bleu] "Planifié"
  En cours    → [Orange] "En cours"
  Terminé     → [Vert] "Terminé"

Type Intervention:
  Plomberie   → [Badge] "Plomberie"
  Électricité → [Badge] "Électricité"
  Chauffage   → [Badge] "Chauffage"
  Autre       → [Badge] "Autre"
```

---

## 🔔 Système de notifications (Toast)

### Types disponibles

```typescript
notify('Message de succès', 'success')   // Vert ✓
notify('Message d\'erreur', 'error')     // Rouge ✗
notify('Message informatif', 'info')     // Bleu ℹ
```

### Exemples de notifications

```
✅ "Paiement effectué avec succès!"
❌ "Erreur lors de la création de l'intervention"
ℹ️  "Message envoyé au propriétaire"
✅ "Profil mis à jour"
❌ "Impossible de télécharger le document"
```

---

## 📱 Responsive Design

Tous les composants sont **mobile-friendly** :

```
Desktop (1200px+)  → Layout complet avec sidebar
Tablet (768px)     → Sidebar réduite/collapsible
Mobile (320px)     → Drawer au lieu de sidebar
```

Composants utilisés pour la responsivité :
- `Drawer` - Remplace la sidebar sur mobile
- `ScrollArea` - Gère le défilement sur petits écrans
- Tailwind CSS breakpoints - Responsive classes

---

## 🎬 Animations

### Utilise Framer Motion pour :

```
✨ Transitions de page
✨ Animations de toast
✨ Hover effects
✨ Ouverture/Fermeture de modales
✨ Transitions d'onglets
```

### Exemples de transitions

```
Dialog    → Fade in/out + scale
Toast     → Slide + fade out
Tabs      → Smooth transitions
Drawer    → Slide from side
Accordion → Smooth expand/collapse
```

---

## 🎯 Performance des composants

### Optimisations appliquées

```
✅ Lazy loading des modales
✅ Memoization des composants
✅ Code splitting possible
✅ Minimal CSS bundle
✅ Icons SVG optimisées
```

### Taille des composants

```
Button         : ~2KB
Card           : ~1KB
Dialog         : ~5KB
Tabs           : ~3KB
Form           : ~4KB
Table          : ~8KB

Total UI bundle : ~150KB (non gzippé)
```

---

## 🔐 Accessibilité

Tous les composants shadcn/ui incluent :

```
✅ ARIA labels
✅ Keyboard navigation
✅ Screen reader support
✅ Focus management
✅ Color contrast
✅ Semantic HTML
```

---

## 📚 Documentation des composants

Pour chaque composant utilisé :

```
shadcn/ui → https://ui.shadcn.com/docs
Radix UI  → https://radix-ui.com/docs/primitives
Tailwind  → https://tailwindcss.com/docs
```

---

## 🚀 Résumé

Le module Locataire utilise une palette complète et moderne de **composants UI shadcn/ui**, offrant une **interface professionnelle, accessible et responsive** adaptée aux besoins des locataires.

**Tous les composants sont** :
- ✅ Testés et éprouvés
- ✅ Accessibles (WCAG 2.1)
- ✅ Customisables
- ✅ Performants
- ✅ Mobile-friendly

**Résultat final** : Une application moderne, professionnelle et intuitive ! 🎨
