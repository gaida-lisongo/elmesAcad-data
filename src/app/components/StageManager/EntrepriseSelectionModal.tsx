"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  addEntrepriseToStage,
  removeEntrepriseFromStage,
  updateEntreprise,
} from "@/app/actions/stage.actions";

interface EntrepriseSelectionModalProps {
  isOpen: boolean;
  stage: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EntrepriseSelectionModal({
  isOpen,
  stage,
  onClose,
  onSuccess,
}: EntrepriseSelectionModalProps) {
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (stage) {
      setEntreprises(stage.entreprises || []);
    }
  }, [stage]);

  const resetForm = () => {
    setNom("");
    setAdresse("");
    setContact("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!nom.trim() || !contact.trim()) {
      toast.error("Veuillez remplir les champs requis (nom et contact)");
      return;
    }

    setLoading(true);
    try {
      const result = await addEntrepriseToStage(stage._id, {
        nom: nom.trim(),
        adresse: adresse.trim() || undefined,
        contact: contact.trim(),
      });

      if (result.success) {
        toast.success("Entreprise ajoutée avec succès");
        setEntreprises(result.data.entreprises);
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
    if (!nom.trim() || !contact.trim() || !editingId) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    setLoading(true);
    try {
      const result = await updateEntreprise(stage._id, editingId, {
        nom: nom.trim(),
        adresse: adresse.trim() || undefined,
        contact: contact.trim(),
      });

      if (result.success) {
        toast.success("Entreprise modifiée avec succès");
        setEntreprises(result.data.entreprises);
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

  const handleRemove = async (entrepriseId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette entreprise ?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeEntrepriseFromStage(stage._id, entrepriseId);

      if (result.success) {
        toast.success("Entreprise supprimée");
        setEntreprises(result.data.entreprises);
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

  const handleEdit = (entreprise: any) => {
    setNom(entreprise.nom);
    setAdresse(entreprise.adresse || "");
    setContact(entreprise.contact);
    setEditingId(entreprise._id);
    setIsAdding(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Gestion des entreprises
            </h2>
            <p className="text-sm text-bodydark">
              {stage.designation} - {entreprises.length} entreprise
              {entreprises.length > 1 ? "s" : ""}
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
              {editingId ? "Modifier l'entreprise" : "Ajouter une entreprise"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  placeholder="Ex: TechCorp SARL"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Adresse (optionnel)
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  placeholder="Ex: 123 Av. du Commerce, Kinshasa"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
                  placeholder="Ex: +243 123 456 789 ou email@entreprise.com"
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
            Ajouter une entreprise
          </button>
        )}

        {/* Entreprises List */}
        {entreprises.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stroke py-12 dark:border-strokedark">
            <Icon
              icon="material-symbols:business"
              className="mb-3 text-5xl text-bodydark"
            />
            <p className="text-bodydark">Aucune entreprise ajoutée</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {entreprises.map((entreprise) => (
              <div
                key={entreprise._id}
                className="rounded-xl border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon
                      icon="material-symbols:business"
                      className="text-2xl text-primary"
                    />
                    <h4 className="font-bold text-black dark:text-white">
                      {entreprise.nom}
                    </h4>
                  </div>
                </div>

                {entreprise.adresse && (
                  <div className="mb-2 flex items-start gap-2 text-sm text-bodydark">
                    <Icon
                      icon="material-symbols:location-on"
                      className="mt-0.5 text-lg"
                    />
                    <span>{entreprise.adresse}</span>
                  </div>
                )}

                <div className="mb-4 flex items-center gap-2 text-sm text-bodydark">
                  <Icon icon="material-symbols:phone" className="text-lg" />
                  <span>{entreprise.contact}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(entreprise)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    disabled={loading}
                  >
                    <Icon icon="material-symbols:edit" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleRemove(entreprise._id)}
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
