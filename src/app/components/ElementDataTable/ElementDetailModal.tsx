"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { updateElement } from "@/app/actions/unite-element.actions";
import { fetchUsers } from "@/app/actions/user.actions";
import type { UserType } from "@/app/types/mentor";

interface Element {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  objectifs: string[];
  place_ec: string;
  uniteId: string;
  anneeId: string;
  titulaireId?: string;
}

interface ElementDetailModalProps {
  isOpen: boolean;
  element: Element | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ElementDetailModal({
  isOpen,
  element,
  onClose,
  onSuccess,
}: ElementDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
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

  // Load element data when modal opens
  useEffect(() => {
    if (element) {
      setCode(element.code);
      setDesignation(element.designation);
      setCredit(element.credit);
      setObjectifs(element.objectifs || []);
      setPlaceEC(element.place_ec);
      setTitulaireId(element.titulaireId || "");
    }
  }, [element]);

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

  const handleSubmit = async () => {
    if (!element) return;

    if (!code.trim() || !designation.trim() || credit <= 0) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    setLoading(true);
    try {
      const result = await updateElement(element._id, {
        code,
        designation,
        credit,
        objectifs,
        place_ec: placeEC,
        titulaireId: titulaireId || undefined,
      });

      if (result.success) {
        toast.success("Élément mis à jour avec succès");
        setIsEditing(false);
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Échec de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const addObjectif = () => {
    setObjectifs([...objectifs, ""]);
  };

  const removeObjectif = (index: number) => {
    setObjectifs(objectifs.filter((_, i) => i !== index));
  };

  const updateObjectif = (index: number, value: string) => {
    const newObjectifs = [...objectifs];
    newObjectifs[index] = value;
    setObjectifs(newObjectifs);
  };

  const getTitulaireName = () => {
    const titulaire = users.find((u) => u._id === titulaireId);
    return titulaire?.nomComplet || "Non défini";
  };

  if (!isOpen || !element) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              {isEditing ? "Modifier l'élément" : "Détails de l'élément"}
            </h2>
            <p className="text-sm text-bodydark">{element.code}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            <Icon icon="material-symbols:close" className="text-2xl" />
          </button>
        </div>

        {!isEditing ? (
          // View Mode
          <div className="space-y-6">
            {/* Code & Designation */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-bodydark">
                  Code
                </label>
                <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-meta-4">
                  {element.code}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-bodydark">
                  Crédits
                </label>
                <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-meta-4">
                  <span className="inline-flex items-center gap-2">
                    <Icon
                      icon="material-symbols:credit-card"
                      className="text-primary"
                    />
                    {element.credit}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-bodydark">
                Désignation
              </label>
              <div className="rounded-lg bg-gray-100 px-4 py-3 dark:bg-meta-4">
                {element.designation}
              </div>
            </div>

            {/* Objectifs */}
            <div>
              <label className="mb-2 block text-sm font-medium text-bodydark">
                Objectifs
              </label>
              <div className="space-y-2 rounded-lg bg-gray-100 p-4 dark:bg-meta-4">
                {element.objectifs && element.objectifs.length > 0 ? (
                  <ul className="list-inside list-disc space-y-1">
                    {element.objectifs.map((obj, idx) => (
                      <li key={idx}>{obj}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-bodydark">Aucun objectif défini</p>
                )}
              </div>
            </div>

            {/* Place EC */}
            <div>
              <label className="mb-2 block text-sm font-medium text-bodydark">
                Place de l'EC
              </label>
              <div className="whitespace-pre-wrap rounded-lg bg-gray-100 px-4 py-3 dark:bg-meta-4">
                {element.place_ec || "Non défini"}
              </div>
            </div>

            {/* Titulaire */}
            <div>
              <label className="mb-2 block text-sm font-medium text-bodydark">
                Enseignant titulaire
              </label>
              <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-3 dark:bg-meta-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon
                    icon="material-symbols:person"
                    className="text-xl text-primary"
                  />
                </div>
                <span>{getTitulaireName()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg border border-stroke px-6 py-2 font-medium text-black transition-colors hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Fermer
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90"
              >
                <Icon icon="material-symbols:edit" />
                Modifier
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-6">
            {/* Code & Credit */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: EC-001"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Crédits <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={credit}
                  onChange={(e) => setCredit(Number(e.target.value))}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: 4"
                  min="0"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Désignation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                placeholder="Ex: Programmation Orientée Objet"
              />
            </div>

            {/* Objectifs */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Objectifs
              </label>
              <div className="space-y-2">
                {objectifs.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => updateObjectif(index, e.target.value)}
                      className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                      placeholder={`Objectif ${index + 1}`}
                    />
                    <button
                      onClick={() => removeObjectif(index)}
                      className="rounded-lg border border-red-500 px-3 text-red-500 hover:bg-red-500/10"
                    >
                      <Icon icon="material-symbols:close" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addObjectif}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Icon icon="material-symbols:add" />
                  Ajouter un objectif
                </button>
              </div>
            </div>

            {/* Place EC */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Place de l'EC
              </label>
              <textarea
                value={placeEC}
                onChange={(e) => setPlaceEC(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                placeholder="Décrivez la place de cet élément dans le programme..."
              />
            </div>

            {/* Titulaire Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Enseignant titulaire
              </label>
              <div className="rounded-lg border border-stroke dark:border-strokedark">
                {/* Search */}
                <div className="border-b border-stroke p-3 dark:border-strokedark">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un enseignant..."
                      className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary dark:border-strokedark"
                    />
                    <Icon
                      icon="material-symbols:search"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-bodydark"
                    />
                  </div>
                </div>

                {/* User List */}
                <div className="max-h-60 overflow-y-auto">
                  {currentUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => setTitulaireId(user._id)}
                      className={`cursor-pointer border-b border-stroke p-3 transition-colors hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 ${
                        titulaireId === user._id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            titulaireId === user._id
                              ? "bg-primary text-white"
                              : "bg-gray-200 dark:bg-meta-4"
                          }`}
                        >
                          <Icon icon="material-symbols:person" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-black dark:text-white">
                            {user.nomComplet}
                          </p>
                          <p className="text-sm text-bodydark">{user.email}</p>
                        </div>
                        {titulaireId === user._id && (
                          <Icon
                            icon="material-symbols:check-circle"
                            className="text-2xl text-primary"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-stroke p-3 dark:border-strokedark">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-stroke px-3 py-1 disabled:opacity-50 dark:border-strokedark"
                    >
                      <Icon icon="material-symbols:chevron-left" />
                    </button>
                    <span className="text-sm text-bodydark">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-stroke px-3 py-1 disabled:opacity-50 dark:border-strokedark"
                    >
                      <Icon icon="material-symbols:chevron-right" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-stroke px-6 py-2 font-medium text-black transition-colors hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Icon
                      icon="eos-icons:loading"
                      className="text-xl animate-spin"
                    />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Icon icon="material-symbols:save" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
