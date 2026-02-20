"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { createElement } from "@/app/actions/unite-element.actions";
import { fetchUsers } from "@/app/actions/user.actions";
import type { UserType } from "@/app/types/mentor";

interface ElementFormModalProps {
  isOpen: boolean;
  uniteId: string;
  anneeId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ElementFormModal({
  isOpen,
  uniteId,
  anneeId,
  onClose,
  onSuccess,
}: ElementFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [code, setCode] = useState("");
  const [designation, setDesignation] = useState("");
  const [credit, setCredit] = useState(0);
  const [objectifs, setObjectifs] = useState<string[]>([]);
  const [placeEC, setPlaceEC] = useState("");
  const [titulaireId, setTitulaireId] = useState("");

  // Users state
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      const result = await fetchUsers();
      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      }
    };
    loadUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.nomComplet.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.matricule?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const resetForm = () => {
    setCurrentStep(1);
    setCode("");
    setDesignation("");
    setCredit(0);
    setObjectifs([]);
    setPlaceEC("");
    setTitulaireId("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!code || !designation || credit <= 0) {
        toast.error("Veuillez remplir tous les champs obligatoires");
        return;
      }
    } else if (currentStep === 2) {
      if (objectifs.length === 0 || !placeEC) {
        toast.error(
          "Veuillez ajouter au moins un objectif et la place de l'EC",
        );
        return;
      }
    } else if (currentStep === 3) {
      if (!titulaireId) {
        toast.error("Veuillez sélectionner un enseignant");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleAddObjectif = (objectif: string) => {
    if (objectif.trim()) {
      setObjectifs([...objectifs, objectif.trim()]);
    }
  };

  const handleRemoveObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await createElement(uniteId, anneeId, {
        code,
        designation,
        credit,
        objectifs,
        place_ec: placeEC,
        titulaireId,
      });

      if (result.success) {
        toast.success("Élément créé avec succès");
        handleClose();
        onSuccess();
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedUser = users.find((u) => u._id === titulaireId);

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white dark:bg-boxdark">
        {/* Header */}
        <div className="border-b border-stroke p-6 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-black dark:text-white">
                Créer un Élément Constitutif
              </h3>
              <p className="mt-1 text-sm text-bodydark">
                Étape {currentStep} sur 4
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-bodydark hover:text-black dark:hover:text-white"
            >
              <Icon icon="material-symbols:close" className="text-2xl" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep
                    ? "bg-primary"
                    : "bg-stroke dark:bg-strokedark"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Étape 1: Description */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Icon
                  icon="material-symbols:description-outline"
                  className="mx-auto mb-4 text-6xl text-primary"
                />
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  Description de l'Élément Constitutif
                </h4>
                <p className="mt-2 text-sm text-bodydark">
                  Renseignez les informations de base
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: EC1.1"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Désignation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: Algorithmique et structures de données"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Crédits <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={credit}
                  onChange={(e) => setCredit(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: 2.5"
                />
              </div>
            </div>
          )}

          {/* Étape 2: Objectifs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Icon
                  icon="material-symbols:target"
                  className="mx-auto mb-4 text-6xl text-primary"
                />
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  Objectifs de l'Élément Constitutif
                </h4>
                <p className="mt-2 text-sm text-bodydark">
                  Définissez les objectifs pédagogiques
                </p>
              </div>

              <ObjectifsList
                objectifs={objectifs}
                onAdd={handleAddObjectif}
                onRemove={handleRemoveObjectif}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Place de l'EC dans l'UE{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={placeEC}
                  onChange={(e) => setPlaceEC(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex:&#10;Cours magistral&#10;Travaux dirigés&#10;Travaux pratiques"
                />
              </div>
            </div>
          )}

          {/* Étape 3: Choix animateur */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Icon
                  icon="material-symbols:person-search"
                  className="mx-auto mb-4 text-6xl text-primary"
                />
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  Choix de l'Enseignant Titulaire
                </h4>
                <p className="mt-2 text-sm text-bodydark">
                  Sélectionnez l'enseignant qui dispensera ce cours
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Icon
                  icon="material-symbols:search"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-bodydark"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Rechercher par nom, email ou matricule..."
                />
              </div>

              {/* Users list */}
              <div className="space-y-2">
                {currentUsers.length === 0 ? (
                  <div className="py-8 text-center text-bodydark">
                    Aucun enseignant trouvé
                  </div>
                ) : (
                  currentUsers.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => setTitulaireId(user._id)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        titulaireId === user._id
                          ? "border-primary bg-primary/5"
                          : "border-stroke hover:border-primary/50 dark:border-strokedark"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            titulaireId === user._id
                              ? "bg-primary text-white"
                              : "bg-gray-2 text-bodydark dark:bg-meta-4"
                          }`}
                        >
                          <Icon
                            icon="material-symbols:person"
                            className="text-2xl"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-black dark:text-white">
                            {user.nomComplet}
                          </p>
                          <p className="text-sm text-bodydark">{user.email}</p>
                          <div className="mt-1 flex gap-2 text-xs">
                            <span className="rounded bg-stroke px-2 py-1 dark:bg-strokedark">
                              {user.grade}
                            </span>
                            {user.matricule && (
                              <span className="rounded bg-stroke px-2 py-1 dark:bg-strokedark">
                                {user.matricule}
                              </span>
                            )}
                          </div>
                        </div>
                        {titulaireId === user._id && (
                          <Icon
                            icon="material-symbols:check-circle"
                            className="text-2xl text-primary"
                          />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark"
                  >
                    Précédent
                  </button>
                  <span className="text-sm text-bodydark">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Étape 4: Résumé */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Icon
                  icon="material-symbols:book-check-outline"
                  className="mx-auto mb-4 text-6xl text-primary"
                />
                <h4 className="text-xl font-semibold text-black dark:text-white">
                  Récapitulatif
                </h4>
                <p className="mt-2 text-sm text-bodydark">
                  Vérifiez les informations avant de créer l'élément
                </p>
              </div>

              <div className="space-y-4 rounded-lg bg-gray-2 p-6 dark:bg-meta-4">
                <div>
                  <h5 className="mb-2 text-sm font-semibold text-bodydark">
                    Description
                  </h5>
                  <div className="space-y-1">
                    <p className="text-black dark:text-white">
                      <span className="font-semibold">Code:</span> {code}
                    </p>
                    <p className="text-black dark:text-white">
                      <span className="font-semibold">Désignation:</span>{" "}
                      {designation}
                    </p>
                    <p className="text-black dark:text-white">
                      <span className="font-semibold">Crédits:</span> {credit}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-semibold text-bodydark">
                    Objectifs ({objectifs.length})
                  </h5>
                  <ul className="list-inside list-disc space-y-1 text-black dark:text-white">
                    {objectifs.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-semibold text-bodydark">
                    Place de l'EC
                  </h5>
                  <div className="whitespace-pre-wrap text-black dark:text-white">
                    {placeEC}
                  </div>
                </div>

                <div>
                  <h5 className="mb-2 text-sm font-semibold text-bodydark">
                    Enseignant Titulaire
                  </h5>
                  {selectedUser && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon
                          icon="material-symbols:person"
                          className="text-xl text-primary"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-black dark:text-white">
                          {selectedUser.nomComplet}
                        </p>
                        <p className="text-sm text-bodydark">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stroke p-6 dark:border-strokedark">
          <div className="flex justify-between">
            <button
              onClick={currentStep === 1 ? handleClose : handlePrevious}
              className="rounded-lg border border-stroke px-6 py-2 text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            >
              {currentStep === 1 ? "Annuler" : "Précédent"}
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90"
              >
                Suivant
                <Icon icon="material-symbols:arrow-forward" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer l'élément"}
                <Icon icon="material-symbols:check" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant pour gérer les objectifs
function ObjectifsList({
  objectifs,
  onAdd,
  onRemove,
}: {
  objectifs: string[];
  onAdd: (objectif: string) => void;
  onRemove: (index: number) => void;
}) {
  const [newObjectif, setNewObjectif] = useState("");

  const handleAdd = () => {
    if (newObjectif.trim()) {
      onAdd(newObjectif);
      setNewObjectif("");
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-black dark:text-white">
        Objectifs pédagogiques <span className="text-red-500">*</span>
      </label>

      {/* List of objectifs */}
      <div className="mb-4 space-y-2">
        {objectifs.map((obj, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-lg border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-meta-4"
          >
            <Icon
              icon="material-symbols:check-circle"
              className="mt-0.5 text-xl text-primary"
            />
            <p className="flex-1 text-black dark:text-white">{obj}</p>
            <button
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-600"
            >
              <Icon icon="material-symbols:close" className="text-xl" />
            </button>
          </div>
        ))}
        {objectifs.length === 0 && (
          <div className="rounded-lg border border-dashed border-stroke p-6 text-center text-bodydark dark:border-strokedark">
            Aucun objectif ajouté. Commencez par en ajouter un ci-dessous.
          </div>
        )}
      </div>

      {/* Add new objectif */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newObjectif}
          onChange={(e) => setNewObjectif(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
          placeholder="Saisir un objectif..."
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-white hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Ajouter
        </button>
      </div>
    </div>
  );
}
