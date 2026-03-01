# Ajustements Nécessaires pour Compléter l'Intégration

## Problèmes Identifiés et Solutions

### 1. Paramètres Manquants dans les Actions

Les actions serveur requièrent des paramètres supplémentaires qui ne sont pas actuellement fournis par les composants :

#### `createQCMActivity` et `createQuestionnaireActivity`

**Paramètres requis:**

```typescript
{
  titulaireId: string;    // ❌ Manquant
  elementId: string;       // ✅ Fourni
  promotionId: string;     // ❌ Manquant
  anneeId: string;         // ❌ Manquant
  designation: string;
  description: string[];
  questions: Array<...>;
  currency?: string;
  amount?: number;
  maxPts?: number;
}
```

#### `createRessource`

**Paramètres requis:**

```typescript
{
  titulaireId: string;    // ❌ Manquant
  elementId: string;       // ✅ Fourni
  promotionId: string;     // ❌ Manquant
  anneeId: string;         // ❌ Manquant
  designation: string;
  description: string[];
  url: string;             // ⚠️ Utilise "document" au lieu de "url"
  reference: string;       // ⚠️ Actuellement optionnel dans le composant
  currency?: string;
  amount?: number;
}
```

#### `createSeance`

**Paramètres requis:**

```typescript
{
  elementId: string;       // ✅ Fourni
  promotionId: string;     // ❌ Manquant
  anneeId: string;         // ❌ Manquant
  designation: string;
  description: string[];
  coords?: {
    latitude: string;
    longitude: string;
  };
}
```

### 2. Solutions Recommandées

#### Option A: Modifier les Composants pour Accepter les Props Supplémentaires

**ActivitesManager.tsx:**

```typescript
interface ActivitesManagerProps {
  elementId: string;
  titulaireId: string; // Ajouter
  promotionId: string; // Ajouter
  anneeId: string; // Ajouter
  onCreateNew: (type: "qcm" | "questionnaire") => void;
}
```

**CreateActivityModal.tsx:**

```typescript
interface CreateActivityModalProps {
  elementId: string;
  titulaireId: string; // Ajouter
  promotionId: string; // Ajouter
  anneeId: string; // Ajouter
  type: "qcm" | "questionnaire";
  onClose: () => void;
  onSuccess: () => void;
}

// Dans handleSubmit
const payload = {
  titulaireId, // Ajouter
  elementId,
  promotionId, // Ajouter
  anneeId, // Ajouter
  designation,
  description: description.filter((d) => d.trim()),
  currency,
  amount: amount ? parseFloat(amount) : undefined,
  maxPts: maxPts ? parseFloat(maxPts) : undefined,
  questions,
};
```

**RessourcesManager.tsx:**

```typescript
interface RessourcesManagerProps {
  elementId: string;
  titulaireId: string; // Ajouter
  promotionId: string; // Ajouter
  anneeId: string; // Ajouter
}

// Dans handleCreate
const result = await createRessource({
  titulaireId, // Ajouter
  elementId,
  promotionId, // Ajouter
  anneeId, // Ajouter
  designation,
  description: description.filter((d) => d.trim()),
  url: documentUrl || "", // Changer de "document" à "url"
  reference: reference || "", // Rendre obligatoire (string vide si non fourni)
});
```

**SeancesManager.tsx:**

```typescript
interface SeancesManagerProps {
  elementId: string;
  promotionId: string; // Ajouter
  anneeId: string; // Ajouter
}

// Dans handleCreate
const result = await createSeance({
  elementId,
  promotionId, // Ajouter
  anneeId, // Ajouter
  designation,
  description: description.filter((d) => d.trim()),
  ...(latitude &&
    longitude && {
      coords: {
        latitude: latitude, // Déjà string
        longitude: longitude, // Déjà string
      },
    }),
});
```

#### Option B: Modifier les Actions pour Récupérer les Données Automatiquement

Si vous préférez ne pas passer ces props manuellement, modifiez les actions pour récupérer les informations depuis l'élément :

**Exemple pour `createQCMActivity`:**

```typescript
export async function createQCMActivity(data: {
  elementId: string;  // Seulement elementId nécessaire
  designation: string;
  description: string[];
  questions: Array<...>;
  currency?: string;
  amount?: number;
  maxPts?: number;
}) {
  try {
    await connectDB();

    // Récupérer l'élément pour obtenir le contexte
    const section = await Section.findOne({
      "filieres.programmes.semestres.unites.elements._id": new mongoose.Types.ObjectId(data.elementId)
    }).lean();

    // Extraire les informations nécessaires
    let titulaireId, promotionId, anneeId;
    for (const filiere of section.filieres) {
      for (const programme of filiere.programmes) {
        for (const semestre of programme.semestres) {
          for (const unite of semestre.unites) {
            const element = unite.elements.find(e => e._id.toString() === data.elementId);
            if (element) {
              titulaireId = element.titulaire;
              promotionId = programme._id; // ou section._id selon votre logique
              anneeId = /* récupérer depuis context */;
              break;
            }
          }
        }
      }
    }

    // Créer l'activité avec les données complètes
    const activity = await QCMActivity.create({
      ...data,
      titulaireId,
      promotionId,
      anneeId,
      type: "qcm"
    });

    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error) {
    console.error("Error creating QCM activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}
```

### 3. Correction Immédiate: Récupérer le Contexte dans la Page Principale

La meilleure approche est de charger les informations de l'élément dans la page principale et de les passer aux composants :

**charge-horaire/[id]/page.tsx:**

```typescript
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchElementById } from "@/app/actions/unite-element.actions";
import { FicheCotation } from "@/app/components/ChargeHoraire/FicheCotation";
import { ActivitesManager } from "@/app/components/ChargeHoraire/ActivitesManager";
import { CreateActivityModal } from "@/app/components/ChargeHoraire/CreateActivityModal";
import { RessourcesManager } from "@/app/components/ChargeHoraire/RessourcesManager";
import { RecoursManager } from "@/app/components/ChargeHoraire/RecoursManager";
import { SeancesManager } from "@/app/components/ChargeHoraire/SeancesManager";

interface Element {
  _id: string;
  designation: string;
  code: string;
  credits: number;
  volumeHoraire: number;
  titulaire: string;        // Ajouter
  promotionId: string;      // Ajouter
  anneeId: string;          // Ajouter
}

export default function CourseDetailPage() {
  const params = useParams();
  const elementId = params?.id as string;
  const [activeTab, setActiveTab] = useState("notes");
  const [element, setElement] = useState<Element | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityType, setActivityType] = useState<"qcm" | "questionnaire">("qcm");

  useEffect(() => {
    if (elementId) loadElement();
  }, [elementId]);

  const loadElement = async () => {
    const result = await fetchElementById(elementId);
    if (result.success) {
      setElement(result.data);
    }
  };

  const handleCreateActivity = (type: "qcm" | "questionnaire") => {
    setActivityType(type);
    setShowActivityModal(true);
  };

  const tabs = [
    { key: "notes", label: "Fiche de Cotation" },
    { key: "activites", label: "Activités" },
    { key: "ressources", label: "Ressources" },
    { key: "recours", label: "Recours" },
    { key: "seances", label: "Séances" },
  ];

  if (!element) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with course info */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {element.designation}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {element.code} • {element.credits} crédits • {element.volumeHoraire}h
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700 overflow-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 whitespace-nowrap transition ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "notes" && (
          <FicheCotation
            elementId={elementId}
            promotionId={element.promotionId}
            anneeId={element.anneeId}
          />
        )}
        {activeTab === "activites" && (
          <ActivitesManager
            elementId={elementId}
            titulaireId={element.titulaire}
            promotionId={element.promotionId}
            anneeId={element.anneeId}
            onCreateNew={handleCreateActivity}
          />
        )}
        {activeTab === "ressources" && (
          <RessourcesManager
            elementId={elementId}
            titulaireId={element.titulaire}
            promotionId={element.promotionId}
            anneeId={element.anneeId}
          />
        )}
        {activeTab === "recours" && (
          <RecoursManager elementId={elementId} />
        )}
        {activeTab === "seances" && (
          <SeancesManager
            elementId={elementId}
            promotionId={element.promotionId}
            anneeId={element.anneeId}
          />
        )}
      </div>

      {/* Activity Creation Modal */}
      {showActivityModal && (
        <CreateActivityModal
          elementId={elementId}
          titulaireId={element.titulaire}
          promotionId={element.promotionId}
          anneeId={element.anneeId}
          type={activityType}
          onClose={() => setShowActivityModal(false)}
          onSuccess={() => setShowActivityModal(false)}
        />
      )}
    </div>
  );
}
```

### 4. Fichiers à Modifier

1. **ActivitesManager.tsx** - Ajouter props titulaireId, promotionId, anneeId
2. **CreateActivityModal.tsx** - Ajouter props et les passer aux actions
3. **RessourcesManager.tsx** - Ajouter props, changer "document" en "url", rendre reference obligatoire
4. **SeancesManager.tsx** - Ajouter props promotionId, anneeId
5. **charge-horaire/[id]/page.tsx** - Charger contexte de l'élément et passer aux composants

### 5. Vérification de fetchElementById

Assurez-vous que `fetchElementById` dans `unite-element.actions.ts` retourne toutes les données nécessaires :

```typescript
export async function fetchElementById(elementId: string) {
  try {
    await connectDB();

    const section = await Section.findOne({
      "filieres.programmes.semestres.unites.elements._id":
        new mongoose.Types.ObjectId(elementId),
    })
      .populate("filieres.programmes.semestres.unites.elements.titulaire")
      .lean();

    // Extraire l'élément avec son contexte
    let element = null;
    let promotionId = null;
    let anneeId = null;

    for (const filiere of section.filieres) {
      for (const programme of filiere.programmes) {
        for (const semestre of programme.semestres) {
          for (const unite of semestre.unites) {
            const found = unite.elements.find(
              (e) => e._id.toString() === elementId,
            );
            if (found) {
              element = {
                ...found,
                promotionId: programme._id.toString(), // Ajouter
                anneeId: section.anneeId?.toString(), // Ajouter si disponible
              };
              break;
            }
          }
        }
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(element)) };
  } catch (error) {
    console.error("Error fetching element:", error);
    return { success: false, error: "Failed to fetch element" };
  }
}
```

## Prochaines Étapes

1. ✅ Modifier fetchElementById pour inclure promotionId et anneeId
2. ✅ Mettre à jour tous les composants avec les props manquantes
3. ✅ Corriger RessourcesManager (document → url, reference obligatoire)
4. ✅ Intégrer dans charge-horaire/[id]/page.tsx
5. ✅ Tester la création d'activités, ressources, et séances

## Note Importante

Si les champs `promotionId` et `anneeId` ne sont pas directement disponibles dans le schéma `Element`, vous devrez peut-être :

- Les déduire de la structure parente (Section → Programme)
- Les ajouter comme champs dans le schéma Element
- Utiliser l'approche Option B (récupération automatique dans les actions)
