# Documentation - Gestion des Documents

## Vue d'ensemble

Ce module permet de gérer les documents à livrer aux étudiants (certificats, relevés, bulletins, etc.) et les commandes asociées.

## Architecture

### 1. Actions Serveur (`documment.actions.ts`)

**Localisation:** `src/app/actions/documment.actions.ts`

Contient toutes les opérations CRUD:

- `createDocument()` - Créer un nouveau document
- `getDocumentsByCategory()` - Récupérer les documents par catégorie
- `updateDocument()` - Modifier un document
- `deleteDocument()` - Supprimer un document
- `getCommandesByDocument()` - Récupérer toutes les commandes d'un document
- `createOrUpdateCommande()` - Créer ou modifier une commande
- `deleteCommande()` - Supprimer une commande
- `importCommandesFromCSV()` - Importer des commandes depuis un fichier CSV
- `getDocumentsWithComandesCount()` - Récupérer les documents avec le nombre de commandes

### 2. Layout (`(docs)/layout.tsx`)

**Localisation:** `src/app/(auth)/(docs)/layout.tsx`

- Utilise `AcademicProvider` pour gérer le contexte académique
- Met à disposition les années académiques et promotions
- Affiche `AcademicSidebar` pour la navigation
- Pattern similaire aux autres sections (enseignement, jury, etc.)

### 3. Composants

#### DocumentManager

**Localisation:** `src/app/components/DocumentManager/index.tsx`

Composant réutilisable pour la gestion CRUD des documents:

- Liste les documents
- Formulaire pour créer/modifier des documents
- Actions (modifier, supprimer)
- Affiche le nombre de commandes par document

**Props:**

```typescript
{
  documents: Document[]           // Liste des documents
  category: string                // Catégorie actuellement affichée
  categoryOptions: string[]        // Options de catégories
  promotionId: string             // ID de la promotion
  anneeId: string                 // ID de l'année académique
  onDocumentClick?: (doc) => void // Callback quand on clique sur un document
  onRefresh?: () => void          // Callback pour rafraîchir
}
```

#### CommandesViewer

**Localisation:** `src/app/components/CommandesViewer/index.tsx`

Composant réutilisable pour la gestion des commandes d'un document:

- Affiche toutes les commandes du document
- Formulaire pour ajouter une commande
- Import en masse depuis CSV
- Actions (supprimer)
- Table avec filtrage par statut

**Props:**

```typescript
{
  document: Document; // Document sélectionné
  docummentId: string; // ID du document
}
```

### 4. Pages

#### `/documents/enseignement/page.tsx`

Gestion des documents de la catégorie enseignement:

- `RELEVE`
- `FICHE-VALIDATION`
- `ACQUIS DE DROIT`

#### `/documents/jury/page.tsx`

Gestion des documents de la catégorie jury:

- `BULLETIN`

#### `/documents/recherche/page.tsx`

Gestion des documents de la catégorie recherche:

- `LETTRE-STAGE`
- `DEPOT-SUJET`
- `LETTRE RECHERCHE`

## Workflow d'utilisation

### 1. Créer un document

1. Aller sur la page correspondante (/documents/enseignement, jury, recherche)
2. Sélectionner la catégorie (s'il y a plusieurs)
3. Cliquer sur "Ajouter"
4. Remplir le formulaire:
   - Désignation du document
   - Description (optionnelle)
   - Prix
5. Cliquer sur "Créer"

### 2. Gérer les commandes d'un document

1. Depuis la page des documents, cliquer sur un document
2. Voir toutes les commandes existantes
3. Ajouter une commande manuellement:
   - ID étudiant
   - Numéro de téléphone
   - Statut (pending, paid, ok, failed)
4. OU importer depuis un fichier CSV:
   - Format CSV attendu: `etudiantId,phoneNumber,[status]`
   - Exemple:
     ```csv
     etudiantId,phoneNumber,status
     507f1f77bcf86cd799439011,+243975555555,pending
     507f1f77bcf86cd799439012,+243976666666,paid
     ```

### 3. Statuts des commandes

- **pending**: En attente (par défaut)
- **paid**: Payée par l'étudiant
- **ok**: Validée et livrée
- **failed**: Échouée ou rejetée

## Format de fichier CSV pour import

```csv
etudiantId,phoneNumber,status
<ObjectId>,<téléphone>,pending|paid|ok|failed
```

Colonnes minimales requises:

- `etudiantId`: ID MongoDB de l'étudiant
- `phoneNumber`: Numéro de téléphone

Colonnes optionnelles:

- `status`: Statut de la commande (par défaut: pending)

## Modèles de données

### Document (IDocumment)

```typescript
{
  _id: ObjectId
  designation: string
  category: string
  description: string[]
  prix: number
  anneeId: ObjectId
  promotionId: ObjectId
  isActive: boolean
  signatures: {
    userId: ObjectId
    fonction: string
  }[]
  slug: string
  createdAt: Date
  updatedAt: Date
}
```

### Commande (IDocumentCommande)

```typescript
{
  _id: ObjectId;
  etudiantId: ObjectId;
  docummentId: ObjectId;
  phoneNumber: string;
  orderNumber: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "ok";
  createdAt: Date;
  updatedAt: Date;
}
```

## Cas d'usage

### 1. Administrateur gère les documents

- Crée les types de documents disponibles
- Définit les prix
- Gère les catégories

### 2. Opérateur gère les commandes

- Ajoute les commandes des étudiants
- Importe les commandes depuis CSV
- Marque les paiements comme effectués
- Change le statut à "ok" une fois livré

### 3. Génération de documents

À faire dans une prochaine itération : composants pour générer automatiquement les documents PDF

## Prochaines étapes

1. **Génération de documents PDF** - Créer les modèles de documents et intégrer une librairie de génération PDF
2. **Notifications** - Notifier les étudiants quand leurs documents sont prêts
3. **Historique** - Ajouter un historique des modifications
4. **Export** - Exporter la liste des commandes en PDF/Excel
