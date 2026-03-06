# Architecture Matricule → ObjectId

## 📋 Vue d'ensemble

Votre système accepte un **matricule** (identifiant métier) au lieu d'un ObjectId MongoDB. Le système :

✅ **Détecte automatiquement** s'il s'agit d'un étudiant ou d'un enseignant  
✅ **Récupère l'ObjectId correspondant** de la base de données  
✅ **Stocke l'ObjectId** dans la base MongoDB

```
Vous           →  Matricule: "E2024001"  →  Système  →  Detects: Student
                  ou "P2024001"                              ou Teacher
                                                              ↓
                                                        ObjectId retrievé
                                                              ↓
                                                        Stocké en DB
```

---

## 🔧 Composants

### 1. **resolveUser.ts** - La clé du système

Fichier: `src/lib/utils/resolveUser.ts`

```typescript
// Interface retournée
interface ResolvedUser {
  userId: string; // ObjectId en string
  userType: "student" | "teacher"; // Type détecté
  data: {
    nomComplet: string;
    email: string;
    matricule: string;
    fonction?: string; // Seulement pour enseignants
  };
}

// Fonction principale
async function resolveMatriculeToUser(matricule: string): Promise<ResolvedUser>;
```

**Logique :**

1. Cherche d'abord dans la collection `User` (enseignants)
2. Si non trouvé, cherche dans `Etudiant` (étudiants)
3. Retourne ObjectId + type détecté
4. Lance une erreur si non trouvé nulle part

---

## 📝 Utilisation Pratique

### Cas d'usage 1 : Ajouter une signature par matricule

**Avant (ObjectId direct):**

```typescript
await Documment.findByIdAndUpdate(docId, {
  $push: {
    signatures: {
      userId: new ObjectId("507f1f77bcf86cd799439011"), // ❌ Hard-coded
      fonction: "Directeur",
    },
  },
});
```

**Après (matricule):**

```typescript
const resolved = await resolveMatriculeToUser("PROF001");

await Documment.findByIdAndUpdate(docId, {
  $push: {
    signatures: {
      userId: new ObjectId(resolved.userId), // ✅ Dynamic
      fonction: "Directeur",
    },
  },
});
```

---

### Cas d'usage 2 : Import batch depuis CSV

**CSV:**

```
matricule,fonction
PROF001,Directeur
PROF002,Vice-Directeur
E2024001,Étudiant
```

**Code:**

```typescript
async function importSignaturesFromCSV(docummentId: string, csv: string) {
  const lines = csv.trim().split("\n").slice(1);
  const signatures = [];

  for (const line of lines) {
    const [matricule, fonction] = line.split(",").map((x) => x.trim());

    // ✅ Résoudre automatiquement
    const resolved = await resolveMatriculeToUser(matricule);

    signatures.push({
      userId: new ObjectId(resolved.userId),
      fonction: fonction,
      resolvedName: resolved.data.nomComplet, // Pour audit
    });
  }

  await Documment.findByIdAndUpdate(docummentId, { signatures });
}
```

---

### Cas d'usage 3 : API acceptant matricule

**Route Handler:** `src/app/api/documents/signatures/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const { docummentId, matricule, fonction } = await req.json();

  try {
    const resolved = await resolveMatriculeToUser(matricule);

    const doc = await Documment.findByIdAndUpdate(docummentId, {
      $push: {
        signatures: {
          userId: new ObjectId(resolved.userId),
          fonction: fonction,
        },
      },
      new: true,
    });

    return NextResponse.json({
      success: true,
      addedBy: resolved.data.nomComplet,
      userType: resolved.userType,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

**Client:**

```typescript
await fetch("/api/documents/signatures", {
  method: "POST",
  body: JSON.stringify({
    docummentId: "...",
    matricule: "PROF001", // ✅ Matricule, pas ObjectId
    fonction: "Directeur",
  }),
});
```

---

## 🎯 Cas d'usage 4 : Afficher noms des signataires

**Problème:** Stockée l'ObjectId, mais afficher le nom en frontend

**Solution:**

```typescript
export async function getDocumentWithSignatureNames(docummentId: string) {
  const document = await Documment.findById(docummentId).lean();

  const signaturesWithNames = await Promise.all(
    document.signatures.map(async (sig) => {
      // Chercher le nom par ObjectId
      const user =
        (await User.findById(sig.userId).lean()) ||
        (await Etudiant.findById(sig.userId).lean());

      return {
        userId: sig.userId.toString(),
        fonction: sig.fonction,
        name: user?.nomComplet || "Unknown",
        userType: /* déterminer */ "teacher" | "student",
      };
    }),
  );

  return { ...document, signatures: signaturesWithNames };
}
```

---

## 🚀 Pattern Final pour votre système

Voici le pattern à utiliser **partout** où vous acceptez une signature :

```typescript
// 1. Dans DocumentManager composant (client)
const [formData, setFormData] = useState({
  // ...
  signatures: [{ matricule: "", fonction: "" }], // ✅ Matricule, pas userId
});

// 2. Lors du submit (server action)
export async function addSignaturesToDocument(
  docummentId: string,
  signatures: { matricule: string; fonction: string }[],
) {
  const resolvedSignatures = await Promise.all(
    signatures.map(async (sig) => {
      const resolved = await resolveMatriculeToUser(sig.matricule);
      return {
        userId: new ObjectId(resolved.userId),
        fonction: sig.fonction,
      };
    }),
  );

  return Documment.findByIdAndUpdate(docummentId, {
    signatures: resolvedSignatures,
  });
}

// 3. Lors de la lecture (fetch document)
export async function getDocument(docummentId: string) {
  const doc = await Documment.findById(docummentId);

  // Résoudre ObjectIds → noms pour affichage
  const signaturesWithNames = await Promise.all(
    doc.signatures.map(async (sig) => ({
      ...sig,
      name: await getUserName(sig.userId),
    })),
  );

  return { ...doc, signatures: signaturesWithNames };
}
```

---

## 📊 Stockage en DB

**Ce qui est stocké:**

```javascript
{
  _id: ObjectId("..."),
  designation: "Diplôme",
  signatures: [
    {
      userId: ObjectId("507f191e810c19729de860ea"),  // ✅ ObjectId
      fonction: "Directeur"
    },
    {
      userId: ObjectId("507f1f77bcf86cd799439012"),
      fonction: "Vice-Directeur"
    }
  ]
}
```

**Relation:**

- `userId: ObjectId("507f191e810c19729de860ea")` → chercher dans `User` ou `Etudiant`
- Lier sur `_id` pour récupérer les détails (nom, email, etc.)

---

## 🎨 Améliorations possibles

### 1. Cache matricule → ObjectId

```typescript
// Dans les server actions globales
const matriculeCache = new Map<string, string>();

async function getCachedUserId(matricule: string) {
  if (matriculeCache.has(matricule)) {
    return matriculeCache.get(matricule);
  }
  const resolved = await resolveMatriculeToUser(matricule);
  matriculeCache.set(matricule, resolved.userId);
  return resolved.userId;
}
```

### 2. Recherche par matricule ou ObjectId

```typescript
async function flexibleResolveUser(identifier: string) {
  // Essayer d'abord comme ObjectId
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const user =
      (await User.findById(identifier).lean()) ||
      (await Etudiant.findById(identifier).lean());
    if (user) return { userId: identifier, found: true };
  }

  // Sinon, résoudre comme matricule
  return resolveMatriculeToUser(identifier);
}
```

### 3. Indexer matricule pour performance

```typescript
// Dans User.ts et Etudiant schemas, c'est déjà fait:
matricule: {
  type: String,
  unique: true,
  sparse: true,
  trim: true,
  index: true  // ✅ Index pour recherches rapides
}
```

---

## ✅ Checklist d'intégration

- [ ] Importer `resolveMatriculeToUser` dans vos server actions
- [ ] Remplacer ObjectIds hard-coded par matricules pour les signatures
- [ ] Tester CSV import avec matricules
- [ ] Ajouter endpoints API acceptant matricules
- [ ] Afficher noms des signataires en frontend
- [ ] Documenter pour toute l'équipe
- [ ] Ajouter validation "matricule existe?" côté client
