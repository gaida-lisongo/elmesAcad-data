"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  addCritereToSujet,
  removeCritereFromSujet,
  updateCritere,
} from "@/app/actions/sujet.actions";

interface CritereModalProps {
  isOpen: boolean;
  sujet: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CritereModal({
  isOpen,
  sujet,
  onClose,
  onSuccess,
}: CritereModalProps) {
  const [criteres, setCriteres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (sujet) {
      setCriteres(sujet.criteres || []);
    }
  }, [sujet]);

  const resetForm = () => {
    setTitre("");
    setDescription("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!titre.trim() || !description.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const result = await addCritereToSujet(sujet._id, {
        critere: titre.trim(),
        description: description.trim(),
      });

      if (result.success) {
        toast.success("Critère ajouté avec succès");
        setCriteres(result.data.criteres);
        resetForm();
        onSuccess();
      } else {
        toast.error(result.error || "Échec de l'ajout");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!titre.trim() || !description.trim() || !editingId) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    try {
      const result = await updateCritere(sujet._id, editingId, {
        critere: titre.trim(),
        description: description.trim(),
      });

      if (result.success) {
        toast.success("Critère modifié avec succès");
        setCriteres(result.data.criteres);
        resetForm();
        onSuccess();
      } else {
        toast.error(result.error || "Échec de la modification");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (critereId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce critère ?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeCritereFromSujet(sujet._id, critereId);

      if (result.success) {
        toast.success("Critère supprimé");
        setCriteres(result.data.criteres);
        onSuccess();
      } else {
        toast.error(result.error || "Échec de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (critere: any) => {
    setTitre(critere.critere);
    setDescription(critere.description);
    setEditingId(critere._id);
    setIsAdding(true);
  };

  // Render description with line breaks
  const renderDescription = (text: string) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Gestion des critères
            </h2>
            <p className="text-sm text-bodydark">
              {sujet.designation} - {criteres.length} critère
              {criteres.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            <Icon icon="material-symbols:close" className="text-2xl" />
          </button>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <div className="mb-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
            <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
              {editingId ? "Modifier le critère" : "Ajouter un critère"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Titre du critère <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  placeholder="Ex: Originalité et innovation"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Description <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs text-bodydark">
                    (Utilisez Entrée pour les retours à la ligne)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  placeholder="Ex: Le sujet doit démontrer une approche nouvelle et créative.&#10;Il doit apporter une contribution significative au domaine.&#10;Les méthodologies proposées doivent être innovantes."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-stroke px-4 py-2 font-medium text-black transition-colors hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Icon
                        icon="eos-icons:loading"
                        className="animate-spin text-xl"
                      />
                      {editingId ? "Modification..." : "Ajout..."}
                    </>
                  ) : (
                    <>
                      <Icon
                        icon={
                          editingId
                            ? "material-symbols:save"
                            : "material-symbols:add"
                        }
                      />
                      {editingId ? "Modifier" : "Ajouter"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 py-4 font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            Ajouter un critère
          </button>
        )}

        {/* Criteres List */}
        {criteres.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stroke py-12 dark:border-strokedark">
            <Icon
              icon="material-symbols:checklist"
              className="mb-3 text-5xl text-bodydark"
            />
            <p className="text-bodydark">Aucun critère ajouté</p>
          </div>
        ) : (
          <div className="space-y-4">
            {criteres.map((critere, index) => (
              <div
                key={critere._id}
                className="rounded-xl border border-stroke bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-black dark:text-white">
                        {critere.critere}
                      </h4>
                      <p className="text-sm leading-relaxed text-bodydark">
                        {renderDescription(critere.description)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-stroke pt-4 dark:border-strokedark">
                  <button
                    onClick={() => handleEdit(critere)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    disabled={loading}
                  >
                    <Icon icon="material-symbols:edit" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleRemove(critere._id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-500 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                    disabled={loading}
                  >
                    <Icon icon="material-symbols:delete-outline" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-stroke pt-4 dark:border-strokedark">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
