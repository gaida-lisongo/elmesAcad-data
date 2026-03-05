# ✅ Checklist de Vérification - Module Documents

## 🔍 Vérifications Initial

- [ ] Dépendances vérifiées (`mongoose`, `@iconify/react`)
- [ ] Base de données MongoDB connectée
- [ ] Variables d'environnement configurées
- [ ] Années académiques créées en DB
- [ ] Promotions créées en DB

## 📁 Structure de Fichiers

- [ ] `src/app/actions/documment.actions.ts` existe
- [ ] `src/app/(auth)/(docs)/layout.tsx` existe
- [ ] `src/app/components/DocumentManager/index.tsx` existe
- [ ] `src/app/components/CommandesViewer/index.tsx` existe
- [ ] `src/app/(auth)/(docs)/documents/enseignement/page.tsx` existe
- [ ] `src/app/(auth)/(docs)/documents/jury/page.tsx` existe
- [ ] `src/app/(auth)/(docs)/documents/recherche/page.tsx` existe
- [ ] `docs/DOCUMENTS_MANAGEMENT.md` existe
- [ ] `docs/IMPLEMENTATION_SUMMARY.md` existe

## 🧪 Tests Fonctionnels

### Test 1: Accès aux pages

- [ ] Navigate to `/documents/enseignement`
- [ ] Voir le sidebar avec années et promotions
- [ ] Sélectionner une promotion
- [ ] Voir les catégories (RELEVE, FICHE-VALIDATION, ACQUIS DE DROIT)

### Test 2: Créer un document

- [ ] Cliquer button "Ajouter"
- [ ] Remplir formulaire:
  - [ ] Designation: "Test Document"
  - [ ] Description: "Test description"
  - [ ] Prix: "100"
- [ ] Cliquer "Créer"
- [ ] Voir le message de succès
- [ ] Document apparaît dans la liste

### Test 3: Modifier un document

- [ ] Cliquer le button "Modifier" (edit icon) sur un document
- [ ] Formulaire se remplit avec les données
- [ ] Modifier le prix: "200"
- [ ] Cliquer "Modifier"
- [ ] Voir le message de succès
- [ ] Prix est mis à jour dans la liste

### Test 4: Voir les commandes

- [ ] Cliquer sur un document dans la liste
- [ ] Voir la page CommandesViewer
- [ ] Voir le button "← Retour aux documents"
- [ ] Voir le nombre de commandes (0 initialement)

### Test 5: Ajouter une commande manuelle

- [ ] Cliquer "Ajouter" sur CommandesViewer
- [ ] Remplir formulaire:
  - [ ] ID Étudiant: (ObjectId valide)
  - [ ] Numéro de téléphone: "+243975555555"
  - [ ] Statut: "pending"
- [ ] Cliquer "Ajouter commande"
- [ ] Voir le message de succès
- [ ] Commande apparaît dans la table

### Test 6: Import CSV

- [ ] Créer fichier `test.csv`:
  ```csv
  etudiantId,phoneNumber,status
  507f1f77bcf86cd799439001,+243975555555,pending
  507f1f77bcf86cd799439002,+243976666666,paid
  ```
- [ ] Cliquer "Choisir fichier" dans section Import
- [ ] Sélectionner le fichier CSV
- [ ] Cliquer "Importer"
- [ ] Voir le message de succès (2 commandes importées)
- [ ] Commandes apparaissent dans la table

### Test 7: Filtrer par statut (optionnel en future)

- [ ] Voir les différents statuts: pending, paid, ok, failed
- [ ] Colors différentes pour chaque statut

### Test 8: Supprimer une commande

- [ ] Cliquer le button "Supprimer" (trash icon) sur une commande
- [ ] Confirmer la suppression
- [ ] Commande disparaît de la table
- [ ] Voir message de succès

### Test 9: Supprimer un document

- [ ] Retour aux documents (button "← Retour")
- [ ] Cliquer button "Supprimer" sur un document
- [ ] Confirmer la suppression
- [ ] Document disparaît de la liste

### Test 10: Tester les autres catégories

- [ ] Jury - Catégorie BULLETIN
  - [ ] Créer un bulletin
  - [ ] Ajouter commandes
- [ ] Recherche - Catégories multiples
  - [ ] LETTRE-STAGE
  - [ ] DEPOT-SUJET
  - [ ] LETTRE RECHERCHE

## 🐛 Tests de Vérification des Erreurs

- [ ] Form validation (designation requise)
- [ ] Message d'erreur - ObjectId invalide
- [ ] Message d'erreur - Fichier CSV mal formaté
- [ ] Message d'erreur - Fichier CSV vide
- [ ] Commission de document non trouvé
- [ ] Annulation de form revient correctement

## 🔒 Tests de Sécurité

- [ ] Les authentifiés seulement peuvent accéder
- [ ] Les données appartiennent à la bonne promotion
- [ ] Les données appartiennent à la bonne année

## 📊 Tests de Performance

- [ ] Chargement initial (< 2s)
- [ ] Import CSV 100 commandes (< 5s)
- [ ] List scroll fluide avec beaucoup de documents

## 🌐 Tests Responsifs

- [ ] Design mobile - Phones
  - [ ] Sidebar responsive
  - [ ] Form readable
  - [ ] Table scrollable
- [ ] Design tablet
- [ ] Design desktop

## 🔗 Integration Tests

- [ ] Sidebar selection updating page content
- [ ] Database writes/reads working correctly
- [ ] No console errors
- [ ] Network requests showing in DevTools

## 🛠️ Troubleshooting

### Problème: "Documment not found" error

**Solution:**

```bash
# Vérifier que Recette.ts exports sont correctes
# Vérifier la connexion MongoDB
# Vérifier que les modèles sont initialisés
```

### Problème: CSV Import échoue

**Solution:**

- Vérifier format CSV: `etudiantId,phoneNumber,status`
- Vérifier ObjectIds sont valides
- Vérifier encodage du fichier (UTF-8)

### Problème: Sidebar ne se charge pas

**Solution:**

- Vérifier que AcademicProvider est initialisé
- Vérifier que années et promotions existent en DB
- Vérifier contexte académique

## 📝 Notes de Déploiement

1. **Avant production:**
   - [ ] Tester all CRUD operations
   - [ ] Vérifier permissions utilisateurs
   - [ ] Backup base de données
   - [ ] Tester imports CSV en masse

2. **Monitoring:**
   - [ ] Logs des opérations CRUD
   - [ ] Monitoring des uploads CSV
   - [ ] Alertes d'erreurs

3. **Performance:**
   - [ ] Indexer `category`, `promotionId`, `anneeId`
   - [ ] Pagination pour grandes listes (future)
   - [ ] Cache des résultats (future)

## ✨ Prochaines Améliorations

- [ ] Génération PDF des documents
- [ ] Templates personnalisés
- [ ] Notifications SMS/Email
- [ ] Export Excel des commandes
- [ ] Historique complet des modifications
- [ ] Signatures numériques
- [ ] Archivage automatique
