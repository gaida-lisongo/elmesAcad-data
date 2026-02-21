"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { addPlanningToHoraire } from "@/app/actions/horaire.actions";

interface PlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  horaireId: string;
  semestreDesignation?: string;
  semestreCredit?: number;
  anneeDesignation?: string;
  unites: any[];
}

export default function PlanningModal({
  isOpen,
  onClose,
  horaireId,
  semestreDesignation,
  semestreCredit,
  anneeDesignation,
  unites,
}: PlanningModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    debut: "",
    fin: "",
    description: "",
    elementId: "",
    isActive: true,
  });

  const handleSubmit = async () => {
    if (!formData.debut || !formData.fin || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      const planningData: any = {
        debut: new Date(formData.debut),
        fin: new Date(formData.fin),
        description: formData.description,
        isActive: formData.isActive,
      };

      if (formData.elementId) {
        planningData.elementId = formData.elementId;
      }

      const result = await addPlanningToHoraire(horaireId, planningData);

      if (!result.success) {
        alert(result.error || "Erreur lors de l'ajout du planning");
        return;
      }

      alert("Planning ajouté avec succès");
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        debut: "",
        fin: "",
        description: "",
        elementId: "",
        isActive: true,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-midnight_text">
            Ajouter un planning
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <Icon icon="material-symbols:close" width={24} height={24} />
          </button>
        </div>

        {/* Info Section */}
        <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">
            {semestreDesignation || "Semestre"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Année: {anneeDesignation || "Non définie"}
          </p>
          {semestreCredit && (
            <p className="text-xs text-gray-600 mt-0.5">
              {semestreCredit} crédits
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {/* Date début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début *
            </label>
            <input
              type="datetime-local"
              value={formData.debut}
              onChange={(e) =>
                setFormData({ ...formData, debut: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              disabled={isSubmitting}
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin *
            </label>
            <input
              type="datetime-local"
              value={formData.fin}
              onChange={(e) =>
                setFormData({ ...formData, fin: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              placeholder="Description du planning..."
              disabled={isSubmitting}
            />
          </div>

          {/* Unité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unité d'enseignement (optionnel)
            </label>
            <select
              value={formData.elementId}
              onChange={(e) =>
                setFormData({ ...formData, elementId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              disabled={isSubmitting}
            >
              <option value="">-- Sélectionner une unité --</option>
              {unites.map((unite: any) => (
                <option key={unite._id} value={unite._id}>
                  {unite.code} - {unite.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Actif */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4 text-primary"
              disabled={isSubmitting}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Actif
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="eos-icons:loading" width={20} height={20} />
                Ajout...
              </span>
            ) : (
              "Ajouter"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
