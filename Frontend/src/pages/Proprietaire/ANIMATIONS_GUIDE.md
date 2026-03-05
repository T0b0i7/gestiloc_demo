# Guide d'Animations Fluides - GestiLoc

Ce guide explique comment utiliser le système d'animations fluides ajouté à l'application GestiLoc.

## 🎨 Fichiers d'animations

### 1. `animations.css`
Contient toutes les animations CSS et les classes utilitaires.

### 2. Composants d'animation
- `AnimatedPage.tsx` - Pour les pages complètes
- `AnimatedCard.tsx` - Pour les cartes et conteneurs
- `AnimatedList.tsx` - Pour les listes avec animations décalées

## 🚀 Comment utiliser les animations

### Pour une page complète
```tsx
import { AnimatedPage } from './AnimatedPage';

const MaPage = () => {
  return (
    <AnimatedPage animation="fadeInUp" delay={100}>
      {/* Contenu de la page */}
    </AnimatedPage>
  );
};
```

### Pour une carte
```tsx
import { AnimatedCard } from './AnimatedCard';

const MaCarte = () => {
  return (
    <AnimatedCard animation="fadeInLeft" delay={200} hover={true}>
      <div className="bg-white p-6 rounded-xl">
        {/* Contenu de la carte */}
      </div>
    </AnimatedCard>
  );
};
```

### Pour une liste
```tsx
import { AnimatedList } from './AnimatedList';

const MaListe = () => {
  return (
    <AnimatedList stagger={true}>
      {items.map((item, index) => (
        <div key={item.id} className="menu-item-enter animate-delay-{index * 100}">
          {/* Élément de liste */}
        </div>
      ))}
    </AnimatedList>
  );
};
```

## 🎭 Types d'animations disponibles

### Animations d'entrée
- `fadeInUp` - Apparition de bas en haut
- `fadeInDown` - Apparition de haut en bas
- `fadeInLeft` - Apparition de gauche à droite
- `fadeInRight` - Apparition de droite à gauche
- `slideInScale` - Apparition avec effet de scale
- `bounceIn` - Apparition avec effet de rebond

### Classes d'interaction
- `card-hover` - Effet de survol pour les cartes
- `btn-hover` - Effet de survol pour les boutons
- `menu-item` - Effet de survol pour les éléments de menu
- `interactive-element` - Effet interactif général

### Delays d'animation
- `animate-delay-100` à `animate-delay-800` - Délais de 0.1s à 0.8s

## 📱 Responsive et performance

### Mobile optimisé
Les animations sont automatiquement réduites sur mobile pour de meilleures performances.

### Accessibilité
Le système respecte `prefers-reduced-motion` pour les utilisateurs qui préfèrent moins d'animations.

## 🎯 Exemples pratiques

### Dashboard avec cartes animées
```tsx
const Dashboard = () => {
  return (
    <AnimatedPage animation="fadeInUp">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard animation="fadeInUp" delay={100}>
          <StatCard title="Biens" value="12" />
        </AnimatedCard>
        <AnimatedCard animation="fadeInUp" delay={200}>
          <StatCard title="Locataires" value="8" />
        </AnimatedCard>
        <AnimatedCard animation="fadeInUp" delay={300}>
          <StatCard title="Revenus" value="2.4M" />
        </AnimatedCard>
      </div>
    </AnimatedPage>
  );
};
```

### Tableau avec lignes animées
```tsx
const TableauLocataires = () => {
  return (
    <AnimatedPage animation="fadeInLeft">
      <table className="w-full">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Bien</th>
            <th>Loyer</th>
          </tr>
        </thead>
        <tbody>
          {locataires.map((locataire, index) => (
            <tr key={locataire.id} className="table-row menu-item-enter animate-delay-{index * 50}">
              <td>{locataire.nom}</td>
              <td>{locataire.bien}</td>
              <td>{locataire.loyer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AnimatedPage>
  );
};
```

### Formulaire avec champs animés
```tsx
const Formulaire = () => {
  return (
    <AnimatedPage animation="slideInScale">
      <form className="space-y-6">
        <div className="form-input animate-delay-100">
          <label>Nom</label>
          <input type="text" />
        </div>
        <div className="form-input animate-delay-200">
          <label>Email</label>
          <input type="email" />
        </div>
        <button className="btn-hover animate-delay-300">
          Envoyer
        </button>
      </form>
    </AnimatedPage>
  );
};
```

## 🔧 Personnalisation

### Ajouter une nouvelle animation
Dans `animations.css` :
```css
@keyframes maNouvelleAnimation {
  from { opacity: 0; transform: rotate(180deg); }
  to { opacity: 1; transform: rotate(0deg); }
}

.animate-maNouvelleAnimation {
  animation: maNouvelleAnimation 0.6s ease-out forwards;
}
```

### Modifier les timings
```css
/* Pour accélérer les animations sur mobile */
@media (max-width: 768px) {
  .animate-fadeInUp {
    animation-duration: 0.4s;
  }
}
```

## 📋 Checklist d'intégration

Pour chaque nouveau composant :

1. **Importer les composants d'animation nécessaires**
2. **Envelopper le contenu avec `AnimatedPage`**
3. **Ajouter des `AnimatedCard` pour les sections**
4. **Utiliser `AnimatedList` pour les listes**
5. **Appliquer les classes d'interaction appropriées**
6. **Tester sur mobile et desktop**
7. **Vérifier l'accessibilité**

## 🎨 Bonnes pratiques

1. **Utiliser des delays progressifs** pour créer un effet cascade
2. **Limiter le nombre d'animations simultanées** pour les performances
3. **Privilégier les animations subtiles** plutôt que les effets excessifs
4. **Tester avec `prefers-reduced-motion`**
5. **Maintenir la cohérence** des animations dans toute l'application

## 🚨 À éviter

- Ne pas surcharger une page avec trop d'animations
- Éviter les animations trop longues (> 1s)
- Ne pas utiliser d'animations pour des éléments critiques
- Éviter les animations qui causent du motion sickness

---

*Ce guide sera mis à jour au fur et à mesure de l'évolution du système d'animations.*
