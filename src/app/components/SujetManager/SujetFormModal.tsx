"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  createSujet,
  updateSujet,
  deleteSujet,
} from "@/app/actions/sujet.actions";

interface SujetFormModalProps {
  isOpen: boolean;
  sujet?: any | null;
  anneeId: string;
  promotionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SujetFormModal({
  isOpen,
  sujet,
  anneeId,
  promotionId,
  onClose,
  onSuccess,
}: SujetFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState<string[]>([""]);
  const [prix, setPrix] = useState(0);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (sujet) {
      setDesignation(sujet.designation || "");
      setDescription(sujet.description || [""]);
      setPrix(sujet.prix || 0);
      setDateDebut(
        sujet.date_debut
          ? new Date(sujet.date_debut).toISOString().split("T")[0]
          : "",
      );
      setDateFin(
        sujet.date_fin
          ? new Date(sujet.date_fin).toISOString().split("T")[0]
          : "",
      );
      setIsActive(sujet.isActive ?? true);
    } else {
      resetForm();
    }
  }, [sujet]);

  const resetForm = () => {
    setDesignation("");
    setDescription([""]);
    setPrix(0);
    setDateDebut("");
    setDateFin("");
    setIsActive(true);
  };

  const addDescription = () => {
    setDescription([...description, ""]);
  };

  const removeDescription = (index: number) => {
    setDescription(description.filter((_, i) => i !== index));
  };

  const updateDescription = (index: number, value: string) => {
    const newDescription = [...description];
    newDescription[index] = value;
    setDescription(newDescription);
  };

  const handleDelete = async () => {
    if (!sujet) return;

    if (
      !confirm(
        "Voulez-vous vraiment supprimer ce sujet ? Cette action est irréversible.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteSujet(sujet._id);

      if (result.success) {
        toast.success("Sujet supprimé avec succès");
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Échec de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!designation.trim() || !dateDebut || !dateFin || prix <= 0) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const validDescriptions = description.filter((d) => d.trim());
    if (validDescriptions.length === 0) {
      toast.error("Ajoutez au moins une description");
      return;
    }

    setLoading(true);
    try {
      let result;
      if (sujet) {
        result = await updateSujet(sujet._id, {
          designation,
          description: validDescriptions,
          prix,
          date_debut: new Date(dateDebut),
          date_fin: new Date(dateFin),
          isActive,
        });
      } else {
        result = await createSujet({
          designation,
          description: validDescriptions,
          prix,
          date_debut: new Date(dateDebut),
          date_fin: new Date(dateFin),
          anneeId,
          promotionId,
        });
      }

      if (result.success) {
        toast.success(
          sujet ? "Sujet modifié avec succès" : "Sujet créé avec succès",
        );
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-stroke pb-4 dark:border-strokedark">
          <div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              {sujet ? "Modifier le sujet" : "Nouveau sujet"}
            </h2>
            <p className="text-sm text-bodydark">
              Définissez les informations principales
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-meta-4"
          >
            <Icon icon="material-symbols:close" className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Designation */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Titre du sujet <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              placeholder="Ex: Sujets de recherche 2024"
            />
          </div>

          {/* Prix */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Prix (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={prix}
              onChange={(e) => setPrix(Number(e.target.value))}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              placeholder="Ex: 200"
              min="0"
            />
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Description <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {description.map((desc, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={desc}
                    onChange={(e) => updateDescription(index, e.target.value)}
                    className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-2 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                    placeholder={`Point ${index + 1}`}
                  />
                  {description.length > 1 && (
                    <button
                      onClick={() => removeDescription(index)}
                      className="rounded-lg border border-red-500 px-3 text-red-500 hover:bg-red-500/10"
                    >
                      <Icon icon="material-symbols:close" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDescription}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Icon icon="material-symbols:add" />
                Ajouter un point
              </button>
            </div>
          </div>

          {/* Status (only for edit) */}
          {sujet && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-black dark:text-white"
              >
                Sujet actif
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {/* Delete button (only in edit mode) */}
          {sujet && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-red-500 px-6 py-2 font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
            >
              <Icon icon="material-symbols:delete-outline" />
              Supprimer
            </button>
          )}

          {/* Right side actions */}
          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
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
                    className="animate-spin text-xl"
                  />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:save" />
                  {sujet ? "Modifier" : "Créer"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
