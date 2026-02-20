# Architecture du Composant Sidebar Réutilisable

## Overview

Ce système permet de partager l'état de sélection académique (année, section, filière, promotion) entre plusieurs pages via un Context API.

## Structure

```
src/
├── app/
│   ├── components/
│   │   └── AcademicSidebar/
│   │       └── index.tsx          # Composant sidebar réutilisable
│   ├── contexts/
│   │   └── AcademicContext.tsx    # Context pour partager l'état
│   └── (auth)/
│       └── (enseignement)/
│           ├── layout.tsx         # Layout avec sidebar et provider
│           └── cours/
│               └── page.tsx       # Exemple d'utilisation
```

## Composants

### 1. AcademicSidebar (Composant Réutilisable)

**Localisation:** `src/app/components/AcademicSidebar/index.tsx`

Un composant sidebar qui affiche:

- Sélecteur d'année académique
- Liste des sections
- Liste des filières (par section)
- Liste des promotions (par filière)

**Props:**

- `annees`: Liste des années académiques
- `sections`: Liste des sections
- `selectedAnnee`: Année académique sélectionnée
- `selectedSection`: Section sélectionnée
- `expandedFiliere`: ID de la filière expanded
- `selectedPromotion`: Promotion sélectionnée
- `onSelectedAnnee`: Callback pour changer l'année
- `onSelectedSection`: Callback pour changer la section
- `onExpandedFiliere`: Callback pour expand/collapse une filière
- `onSelectedPromotion`: Callback pour sélectionner une promotion

**Types Exportés:**

- `AnneeType`
- `ProgrammeType`
- `FiliereType`
- `SectionType`
- `PromotionSelection`

### 2. AcademicContext (Context Provider)

**Localisation:** `src/app/contexts/AcademicContext.tsx`

Gère l'état global de la sélection académique et le partage entre les pages.

**État partagé:**

- `annees`: Toutes les années académiques
- `sections`: Toutes les sections
- `selectedAnnee`: Année sélectionnée
- `selectedSection`: Section sélectionnée
- `expandedFiliere`: Filière expanded
- `selectedPromotion`: Promotion sélectionnée
- `selectedProgramme`: Objet programme complet
- `isLoading`: État de chargement

**Fonctions:**

- `setSelectedAnnee(annee)`: Change l'année académique
- `setSelectedSection(section)`: Change la section (reset filière et promotion)
- `setExpandedFiliere(filiereId)`: Expand/collapse une filière
- `setSelectedPromotion(promotion, programme)`: Sélectionne une promotion

### 3. Layout (enseignement)

**Localisation:** `src/app/(auth)/(enseignement)/layout.tsx`

Le layout enveloppe toutes les pages de la section enseignement avec:

- `AcademicProvider`: Fournit le context à toutes les pages enfants
- `AcademicSidebar`: Affiche le sidebar
- Slot pour le contenu des pages

## Utilisation

### Dans un Layout (Exemple: section enseignement)

```tsx
"use client";

import {
  AcademicProvider,
  useAcademicContext,
} from "@/app/contexts/AcademicContext";
import AcademicSidebar from "@/app/components/AcademicSidebar";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const {
    annees,
    sections,
    selectedAnnee,
    selectedSection,
    expandedFiliere,
    selectedPromotion,
    setSelectedAnnee,
    setSelectedSection,
    setExpandedFiliere,
    setSelectedPromotion,
    isLoading,
  } = useAcademicContext();

  return (
    <div className="flex">
      <AcademicSidebar
        annees={annees}
        sections={sections}
        selectedAnnee={selectedAnnee}
        selectedSection={selectedSection}
        expandedFiliere={expandedFiliere}
        selectedPromotion={selectedPromotion}
        onSelectedAnnee={setSelectedAnnee}
        onSelectedSection={setSelectedSection}
        onExpandedFiliere={setExpandedFiliere}
        onSelectedPromotion={setSelectedPromotion}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AcademicProvider>
      <LayoutContent>{children}</LayoutContent>
    </AcademicProvider>
  );
}
```

### Dans une Page (Exemple: page cours)

```tsx
"use client";

import { useAcademicContext } from "@/app/contexts/AcademicContext";

export default function CoursPage() {
  const {
    selectedAnnee,
    selectedSection,
    selectedPromotion,
    selectedProgramme,
  } = useAcademicContext();

  // Vérifier si une promotion est sélectionnée
  if (!selectedPromotion || !selectedAnnee) {
    return <div>Sélectionnez une promotion</div>;
  }

  // Utiliser les données
  return (
    <div>
      <h1>Cours de {selectedPromotion.name}</h1>
      <p>Année: {selectedAnnee._id}</p>
      <p>Promotion ID: {selectedPromotion.id}</p>
      {/* Votre contenu ici */}
    </div>
  );
}
```

### Utilisation Standalone (sans Context)

Si vous voulez utiliser le sidebar dans une page qui n'est pas dans le layout (comme la page Students dans admin):

```tsx
"use client";

import { useState } from "react";
import AcademicSidebar from "@/app/components/AcademicSidebar";
import type {
  AnneeType,
  SectionType,
  PromotionSelection,
} from "@/app/components/AcademicSidebar";

export default function MyPage() {
  const [annees, setAnnees] = useState<AnneeType[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneeType | null>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(
    null,
  );
  const [expandedFiliere, setExpandedFiliere] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionSelection | null>(null);

  // Charger les données...

  return (
    <div className="flex">
      <AcademicSidebar
        annees={annees}
        sections={sections}
        selectedAnnee={selectedAnnee}
        selectedSection={selectedSection}
        expandedFiliere={expandedFiliere}
        selectedPromotion={selectedPromotion}
        onSelectedAnnee={setSelectedAnnee}
        onSelectedSection={setSelectedSection}
        onExpandedFiliere={setExpandedFiliere}
        onSelectedPromotion={setSelectedPromotion}
      />
      <div className="flex-1">{/* Votre contenu */}</div>
    </div>
  );
}
```

## Avantages

1. **Réutilisabilité**: Le composant sidebar peut être utilisé dans plusieurs layouts
2. **Partage d'état**: Le Context permet de partager l'état entre pages sans prop drilling
3. **Séparation des préoccupations**:
   - Le sidebar gère uniquement l'UI
   - Le Context gère l'état et la logique
   - Les pages consomment les données
4. **Flexibilité**: Peut être utilisé avec ou sans Context
5. **Type-safe**: Utilise TypeScript pour la sécurité des types

## Flux de Données

```
AcademicProvider (Context)
    ↓
    ├─→ AcademicSidebar (UI)
    │       ↓ (user interaction)
    │   setSelectedPromotion()
    │       ↓
    └─→ Page (Consumer)
            ↓ (reads)
        selectedPromotion
        selectedAnnee
        selectedProgramme
```

## Notes Importantes

1. **Le layout doit être "use client"** car il utilise des hooks (useAcademicContext)
2. **Les pages enfants doivent aussi être "use client"** si elles utilisent le Context
3. **L'état est initialisé automatiquement** au montage du Provider
4. **Changer de section reset** la filière et la promotion
5. **Les IDs sont accessibles** via `selectedPromotion.id` et `selectedAnnee._id`
