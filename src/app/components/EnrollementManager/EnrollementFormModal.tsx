"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  createEnrollement,
  updateEnrollement,
} from "@/app/actions/enrollement.actions";

interface EnrollementFormModalProps {
  isOpen: boolean;
  enrollement?: any | null;
  anneeId: string;
  promotionId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollementFormModal({
  isOpen,
  enrollement,
  anneeId,
  promotionId,
  onClose,
  onSuccess,
}: EnrollementFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState<string[]>([""]);
  const [prix, setPrix] = useState(0);
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (enrollement) {
      setDesignation(enrollement.designation || "");
      setDescription(enrollement.description || [""]);
      setPrix(enrollement.prix || 0);
      setDebut(
        enrollement.debut
          ? new Date(enrollement.debut).toISOString().split("T")[0]
          : "",
      );
      setFin(
        enrollement.fin
          ? new Date(enrollement.fin).toISOString().split("T")[0]
          : "",
      );
      setIsActive(enrollement.isActive ?? true);
    } else {
      resetForm();
    }
  }, [enrollement]);

  const resetForm = () => {
    setDesignation("");
    setDescription([""]);
    setPrix(0);
    setDebut("");
    setFin("");
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

  const handleSubmit = async () => {
    if (!designation.trim() || !debut || !fin || prix <= 0) {
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
      if (enrollement) {
        result = await updateEnrollement(enrollement._id, {
          designation,
          description: validDescriptions,
          prix,
          debut: new Date(debut),
          fin: new Date(fin),
          isActive,
        });
      } else {
        result = await createEnrollement({
          designation,
          description: validDescriptions,
          prix,
          debut: new Date(debut),
          fin: new Date(fin),
          anneeId,
          promotionId,
        });
      }

      if (result.success) {
        toast.success(
          enrollement
            ? "Enrollement modifié avec succès"
            : "Enrollement créé avec succès",
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
              {enrollement ? "Modifier l'enrollement" : "Nouvel enrollement"}
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
              Désignation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              placeholder="Ex: Session d'examens 2024"
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
              placeholder="Ex: 100"
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
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
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
          {enrollement && (
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
                Enrollement actif
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
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
                {enrollement ? "Modifier" : "Créer"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
