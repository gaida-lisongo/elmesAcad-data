# Guide d'Intégration des Composants de Gestion de Cours

## Fichiers Créés

### Composants Principaux (src/app/components/ChargeHoraire/)

1. **FicheCotation.tsx** - Gestion des notes (CC, Examen, Rattrapage)
2. **ActivitesManager.tsx** - Liste et gestion des QCM/Questionnaires
3. **CreateActivityModal.tsx** - Formulaire de création d'activités
4. **RessourcesManager.tsx** - Gestion des ressources pédagogiques
5. **RecoursManager.tsx** - Gestion des demandes de recours
6. **SeancesManager.tsx** - Gestion des séances avec QR codes

### Pages de Détails

1. **qcm/[id]/page.tsx** - Liste des inscrits à un QCM
2. **questionnaire/[id]/page.tsx** - Liste des inscrits à un questionnaire
3. **ressource/[id]/page.tsx** - Liste des abonnés à une ressource
4. **seance/[id]/page.tsx** - Feuille de présence avec export Excel

### Actions Serveur

1. **cours.actions.ts** - Toutes les actions CRUD pour les 5 fonctionnalités

## Intégration dans charge-horaire/[id]/page.tsx

Remplacez le contenu de `src/app/(auth)/(titulaire)/charge-horaire/[id]/page.tsx` par :

\`\`\`tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FicheCotation } from "@/app/components/ChargeHoraire/FicheCotation";
import { ActivitesManager } from "@/app/components/ChargeHoraire/ActivitesManager";
import { CreateActivityModal } from "@/app/components/ChargeHoraire/CreateActivityModal";
import { RessourcesManager } from "@/app/components/ChargeHoraire/RessourcesManager";
import { RecoursManager } from "@/app/components/ChargeHoraire/RecoursManager";
import { SeancesManager } from "@/app/components/ChargeHoraire/SeancesManager";
import { fetchElementById } from "@/app/actions/unite-element.actions";

export default function CourseDetailPage() {
const params = useParams();
const elementId = params?.id as string;
const [activeTab, setActiveTab] = useState("notes");
const [element, setElement] = useState<any>(null);
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

return (
<div className="max-w-7xl mx-auto p-6">
{/_ Header with course info _/}
{element && (
<div className="mb-6">
<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
{element.designation}
</h1>
<p className="text-gray-600 dark:text-gray-400">
{element.code} • {element.credits} crédits • {element.volumeHoraire}h
</p>
</div>
)}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700 overflow-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={\`px-4 py-2 whitespace-nowrap transition \${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }\`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "notes" && element && (
          <FicheCotation
            elementId={elementId}
            promotionId={element.promotionId || ""}
            anneeId={element.anneeId || ""}
          />
        )}
        {activeTab === "activites" && (
          <ActivitesManager
            elementId={elementId}
            onCreateNew={handleCreateActivity}
          />
        )}
        {activeTab === "ressources" && (
          <RessourcesManager elementId={elementId} />
        )}
        {activeTab === "recours" && (
          <RecoursManager elementId={elementId} />
        )}
        {activeTab === "seances" && (
          <SeancesManager elementId={elementId} />
        )}
      </div>

      {/* Activity Creation Modal */}
      {showActivityModal && (
        <CreateActivityModal
          elementId={elementId}
          type={activityType}
          onClose={() => setShowActivityModal(false)}
          onSuccess={() => {
            setShowActivityModal(false);
          }}
        />
      )}
    </div>

);
}
\`\`\`

## Fonctionnalités Implémentées

### 1. Fiche de Cotation

- ✅ Affichage des étudiants inscrits avec notes
- ✅ Edition inline (CC/10, Examen/10, Rattrapage/20)
- ✅ Import CSV en masse: [matricule, cc, examen, rattrapage]
- ✅ Calcul automatique du total (rattrapage ou semestre)
- ✅ Recherche par nom/matricule
- ✅ Design en cartes horizontales (pas de tableau)

### 2. Activités (QCM & Questionnaires)

- ✅ Création de QCM avec questions à choix multiples
- ✅ Création de Questionnaires avec upload de fichiers
- ✅ Liste des activités avec filtres (QCM/Questionnaire)
- ✅ Pages de détails pour voir les inscrits
- ✅ Suppression d'activités
- ✅ Support prix + devise + points max

### 3. Ressources

- ✅ Création avec titre, descriptions, référence
- ✅ Upload de documents via uploadFichier()
- ✅ Liste des ressources avec liens de téléchargement
- ✅ Page de détails pour voir les abonnés
- ✅ Suppression de ressources

### 4. Recours

- ✅ Affichage des demandes avec motif, description, preuve
- ✅ Filtres: Tous / En attente / Approuvés / Rejetés
- ✅ Approbation/Rejet avec mise à jour du statut
- ✅ Visualisation des preuves uploadées

### 5. Séances

- ✅ Création avec titre, descriptions, coordonnées GPS
- ✅ Génération automatique de QR codes (API externe)
- ✅ Liste des séances avec aperçu QR
- ✅ Page de détails = Feuille de présence
- ✅ Export Excel (.csv) des présences
- ✅ Statistiques: Présents/Absents
- ✅ Suppression de séances

## Routes Créées

Les pages suivantes sont accessibles :

- `/charge-horaire/[elementId]` - Dashboard principal avec tabs
- `/qcm/[id]` - Détails d'un QCM (liste des inscrits)
- `/questionnaire/[id]` - Détails d'un questionnaire
- `/ressource/[id]` - Détails d'une ressource
- `/seance/[id]` - Feuille de présence

## Notes Techniques

### Génération QR Code

Utilise l'API gratuite: `https://api.qrserver.com/v1/create-qr-code/`
Pour utiliser pdfmake à la place, intégrez la bibliothèque et générez le QR en base64.

### Export Excel

Actuellement en CSV simple. Pour un vrai .xlsx:
\`\`\`bash
npm install xlsx
\`\`\`

Puis dans SeancesManager.tsx:
\`\`\`ts
import \* as XLSX from 'xlsx';

const exportToExcel = async (seanceId: string, designation: string) => {
const result = await fetchPresencesBySeance(seanceId);
const data = result.data.map((p: any, idx: number) => ({
'N°': idx + 1,
'Nom': p.userId.nom,
'Prénom': p.userId.prenom,
'Matricule': p.userId.matricule,
'Présent': p.isPresent ? 'Oui' : 'Non',
'Date': new Date(p.markedAt).toLocaleString('fr-FR')
}));

const ws = XLSX.utils.json*to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Présences");
XLSX.writeFile(wb, \`presence*\${designation}.xlsx\`);
};
\`\`\`

### Import CSV Notes

Format attendu (sans en-tête):
\`\`\`
matricule1,8,12,15
matricule2,7,10,14
\`\`\`

L'import crée ou met à jour automatiquement les notes via `importNotesByCSV`.

### Réutilisabilité

Le composant FicheCotation accepte des props:

- `elementId`: ID de l'élément constitutif
- `promotionId`: ID de la promotion (pour future implémentation jury)
- `anneeId`: ID de l'année académique

Peut être réutilisé dans d'autres contextes (jury, délibération).

## Prochaines Étapes Suggérées

1. **Ajouter fetchElementById** si manquant dans unite-element.actions.ts
2. **Intégrer les composants** dans la page principale
3. **Tester les imports CSV** des notes
4. **Configurer les modèles MongoDB** (Cours.ts doit être importé)
5. **Ajouter la génération PDF** avec pdfmake pour les QR codes
6. **Améliorer l'export Excel** avec la bibliothèque xlsx
7. **Implémenter le retrait d'activités** (demande de désabonnement)

## Structure de Dossiers

\`\`\`
src/
├── app/
│ ├── (auth)/
│ │ ├── (titulaire)/
│ │ │ └── charge-horaire/
│ │ │ └── [id]/
│ │ │ └── page.tsx (À METTRE À JOUR)
│ │ └── (enseignement)/
│ │ ├── qcm/[id]/page.tsx ✅
│ │ ├── questionnaire/[id]/page.tsx ✅
│ │ ├── ressource/[id]/page.tsx ✅
│ │ └── seance/[id]/page.tsx ✅
│ ├── actions/
│ │ └── cours.actions.ts ✅
│ └── components/
│ └── ChargeHoraire/
│ ├── FicheCotation.tsx ✅
│ ├── ActivitesManager.tsx ✅
│ ├── CreateActivityModal.tsx ✅
│ ├── RessourcesManager.tsx ✅
│ ├── RecoursManager.tsx ✅
│ └── SeancesManager.tsx ✅
└── lib/
└── models/
└── Cours.ts (Doit exister)
\`\`\`

## Dépendances des Modèles

Assurez-vous que ces modèles sont bien définis dans `src/lib/models/Cours.ts`:

- Note
- QCMActivity
- QuestionnaireActivity
- RessourceActivity
- Recours
- Seance
- Presence
- SubscribeCharge

## Contact / Support

Tous les composants suivent les patterns:

- Design moderne en cartes (pas de tableaux sauf feuille de présence)
- Dark mode supporté
- Responsive
- Recherche intégrée
- Loading states
- Messages d'erreur

Pour toute question ou amélioration, référez-vous aux fichiers créés.
