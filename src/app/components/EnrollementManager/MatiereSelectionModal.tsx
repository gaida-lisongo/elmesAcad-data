"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  fetchElementsForEnrollement,
  addMatiereToEnrollement,
  removeMatiereFromEnrollement,
  updateMatiereDate,
} from "@/app/actions/enrollement.actions";

interface MatiereSelectionModalProps {
  isOpen: boolean;
  enrollement: any;
  anneeId: string;
  promotionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MatiereSelectionModal({
  isOpen,
  enrollement,
  anneeId,
  promotionId,
  onClose,
  onSuccess,
}: MatiereSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const [allMatieres, setAllMatieres] = useState<any[]>([]);
  const [selectedMatieres, setSelectedMatieres] = useState<
    { matiereId: string; date_epreuve: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMatieres, setFilteredMatieres] = useState<any[]>([]);

  // Load all matieres on mount
  useEffect(() => {
    if (isOpen && anneeId && promotionId) {
      loadMatieres();
    }
  }, [isOpen, anneeId, promotionId]);

  // Load enrollement matieres
  useEffect(() => {
    if (enrollement && enrollement.matieres) {
      setSelectedMatieres(
        enrollement.matieres.map((m: any) => ({
          matiereId: String(m.matiereId),
          date_epreuve: new Date(m.date_epreuve).toISOString().split("T")[0],
        })),
      );
    }
  }, [enrollement]);

  // Filter matieres based on search
  useEffect(() => {
    const filtered = allMatieres.filter(
      (matiere) =>
        matiere.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matiere.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredMatieres(filtered);
  }, [searchQuery, allMatieres]);

  const loadMatieres = async () => {
    setLoading(true);
    try {
      const result = await fetchElementsForEnrollement(anneeId, promotionId);
      if (result.success && result.data) {
        setAllMatieres(result.data);
        setFilteredMatieres(result.data);
      } else {
        toast.error(result.error || "Erreur lors du chargement des matières");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatiere = async (matiereId: string, dateEpreuve: string) => {
    if (!dateEpreuve) {
      toast.error("Veuillez sélectionner une date d'épreuve");
      return;
    }

    setLoading(true);
    try {
      const result = await addMatiereToEnrollement(
        enrollement._id,
        matiereId,
        new Date(dateEpreuve),
      );

      if (result.success) {
        toast.success("Matière ajoutée avec succès");
        setSelectedMatieres([
          ...selectedMatieres,
          { matiereId, date_epreuve: dateEpreuve },
        ]);
        onSuccess();
      } else {
        toast.error(result.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMatiere = async (matiereId: string) => {
    if (!confirm("Voulez-vous vraiment retirer cette matière ?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeMatiereFromEnrollement(
        enrollement._id,
        matiereId,
      );

      if (result.success) {
        toast.success("Matière retirée avec succès");
        setSelectedMatieres(
          selectedMatieres.filter((m) => m.matiereId !== matiereId),
        );
        onSuccess();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async (matiereId: string, newDate: string) => {
    if (!newDate) return;

    setLoading(true);
    try {
      const result = await updateMatiereDate(
        enrollement._id,
        matiereId,
        new Date(newDate),
      );

      if (result.success) {
        toast.success("Date mise à jour avec succès");
        setSelectedMatieres(
          selectedMatieres.map((m) =>
            m.matiereId === matiereId ? { ...m, date_epreuve: newDate } : m,
          ),
        );
        onSuccess();
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const isMatiereSelected = (matiereId: string) => {
    return selectedMatieres.some((m) => m.matiereId === matiereId);
  };

  const getMatiereDate = (matiereId: string) => {
    return selectedMatieres.find((m) => m.matiereId === matiereId)
      ?.date_epreuve;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke p-6 dark:border-strokedark">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Gérer les matières
            </h2>
            <p className="text-sm text-bodydark">
              {enrollement?.designation} • {selectedMatieres.length} matière
              {selectedMatieres.length > 1 ? "s" : ""} sélectionnée
              {selectedMatieres.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            <Icon icon="material-symbols:close" className="text-2xl" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-stroke p-4 dark:border-strokedark">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une matière..."
              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-12 pr-4 outline-none focus:border-primary dark:border-strokedark"
            />
            <Icon
              icon="material-symbols:search"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-bodydark"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading && allMatieres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon
                icon="eos-icons:loading"
                className="mb-4 animate-spin text-5xl text-primary"
              />
              <p className="text-bodydark">Chargement des matières...</p>
            </div>
          ) : filteredMatieres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Icon
                icon="material-symbols:search-off"
                className="mb-4 text-5xl text-gray-300"
              />
              <p className="text-bodydark">Aucune matière trouvée</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredMatieres.map((matiere) => {
                const isSelected = isMatiereSelected(matiere._id);
                const dateEpreuve = getMatiereDate(matiere._id);

                return (
                  <div
                    key={matiere._id}
                    className={`rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-stroke hover:border-primary/50 dark:border-strokedark"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-black dark:text-white">
                          {matiere.designation}
                        </h4>
                        <p className="text-sm text-bodydark">
                          {matiere.code} • {matiere.credit} crédits
                        </p>
                      </div>
                      {isSelected && (
                        <Icon
                          icon="material-symbols:check-circle"
                          className="text-2xl text-primary"
                        />
                      )}
                    </div>

                    {isSelected ? (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-bodydark">
                          Date d'épreuve
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={dateEpreuve || ""}
                            onChange={(e) =>
                              handleUpdateDate(matiere._id, e.target.value)
                            }
                            className="flex-1 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark"
                            disabled={loading}
                          />
                          <button
                            onClick={() => handleRemoveMatiere(matiere._id)}
                            className="rounded-lg bg-red-500 px-3 text-white transition-colors hover:bg-red-600"
                            disabled={loading}
                            title="Retirer"
                          >
                            <Icon icon="material-symbols:close" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-bodydark">
                          Date d'épreuve
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="date"
                            id={`date-${matiere._id}`}
                            className="flex-1 rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark"
                            disabled={loading}
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(
                                `date-${matiere._id}`,
                              ) as HTMLInputElement;
                              if (input && input.value) {
                                handleAddMatiere(matiere._id, input.value);
                              } else {
                                toast.error(
                                  "Veuillez sélectionner une date d'épreuve",
                                );
                              }
                            }}
                            className="rounded-lg bg-primary px-4 text-white transition-colors hover:bg-primary/90"
                            disabled={loading}
                          >
                            <Icon icon="material-symbols:add" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stroke p-6 dark:border-strokedark">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
