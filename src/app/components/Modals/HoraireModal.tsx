"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { createHoraire } from "@/app/actions/horaire.actions";

interface Planning {
  debut: string;
  fin: string;
  description: string;
  elementId: string;
  isActive: boolean;
}

interface HoraireModalProps {
  isOpen: boolean;
  onClose: () => void;
  anneeId: string;
  promotionId: string;
  semestreId: string;
  semestreDesignation?: string;
  semestreCredit?: number;
  anneeDesignation?: string;
  unites: any[];
}

export default function HoraireModal({
  isOpen,
  onClose,
  anneeId,
  promotionId,
  semestreId,
  semestreDesignation,
  semestreCredit,
  anneeDesignation,
  unites,
}: HoraireModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plannings, setPlannings] = useState<Planning[]>([
    {
      debut: "",
      fin: "",
      description: "",
      elementId: "",
      isActive: true,
    },
  ]);

  const addPlanning = () => {
    setPlannings([
      ...plannings,
      {
        debut: "",
        fin: "",
        description: "",
        elementId: "",
        isActive: true,
      },
    ]);
  };

  const removePlanning = (index: number) => {
    if (plannings.length > 1) {
      setPlannings(plannings.filter((_, i) => i !== index));
    }
  };

  const updatePlanning = (index: number, field: keyof Planning, value: any) => {
    const updated = [...plannings];
    updated[index] = { ...updated[index], [field]: value };
    setPlannings(updated);
  };

  const handleSubmit = async () => {
    // Validation
    const hasValidPlannings = plannings.every(
      (p) => p.debut && p.fin && p.description,
    );

    if (!hasValidPlannings) {
      alert(
        "Veuillez remplir tous les champs obligatoires (début, fin, description) pour chaque planning",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert string dates to Date objects
      const planningsData = plannings.map((p) => ({
        debut: new Date(p.debut),
        fin: new Date(p.fin),
        description: p.description,
        elementId: p.elementId || undefined,
        isActive: p.isActive,
      }));

      const result = await createHoraire({
        anneeId,
        promotionId,
        semestreId: String(semestreId),
        plannings: planningsData,
      });

      if (!result.success) {
        alert(result.error || "Erreur lors de la création de l'horaire");
        return;
      }

      alert("Horaire créé avec succès");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error creating horaire:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPlannings([
        {
          debut: "",
          fin: "",
          description: "",
          elementId: "",
          isActive: true,
        },
      ]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-midnight_text">
            Créer un horaire
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
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            {semestreDesignation || `Semestre ${semestreId}`}
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Année: {anneeDesignation || "Non définie"}
          </p>
          {semestreCredit && (
            <p className="text-xs text-blue-700 mt-0.5">
              {semestreCredit} crédits
            </p>
          )}
        </div>

        {/* Plannings Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-midnight_text">
              Plannings
            </h4>
            <button
              onClick={addPlanning}
              disabled={isSubmitting}
              className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
            >
              <Icon icon="material-symbols:add" width={18} />
              Ajouter un planning
            </button>
          </div>

          <div className="space-y-4">
            {plannings.map((planning, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    Planning {index + 1}
                  </h5>
                  {plannings.length > 1 && (
                    <button
                      onClick={() => removePlanning(index)}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-600 text-xs"
                    >
                      <Icon icon="material-symbols:delete" width={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Date début */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date de début *
                    </label>
                    <input
                      type="datetime-local"
                      value={planning.debut}
                      onChange={(e) =>
                        updatePlanning(index, "debut", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Date fin */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date de fin *
                    </label>
                    <input
                      type="datetime-local"
                      value={planning.fin}
                      onChange={(e) =>
                        updatePlanning(index, "fin", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={planning.description}
                    onChange={(e) =>
                      updatePlanning(index, "description", e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Description du planning..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Unité */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unité d'enseignement (optionnel)
                  </label>
                  <select
                    value={planning.elementId}
                    onChange={(e) =>
                      updatePlanning(index, "elementId", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
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
                    id={`isActive-${index}`}
                    checked={planning.isActive}
                    onChange={(e) =>
                      updatePlanning(index, "isActive", e.target.checked)
                    }
                    className="w-4 h-4 text-primary"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor={`isActive-${index}`}
                    className="text-xs text-gray-700"
                  >
                    Actif
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
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
                Création...
              </span>
            ) : (
              "Créer l'horaire"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
