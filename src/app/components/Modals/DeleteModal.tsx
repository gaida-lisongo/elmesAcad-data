"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { removePlanningFromHoraire } from "@/app/actions/horaire.actions";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  horaireId: string;
  planningId: string;
  planningDescription?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  horaireId,
  planningId,
  planningDescription,
}: DeleteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const result = await removePlanningFromHoraire(horaireId, planningId);

      if (!result.success) {
        alert(result.error || "Erreur lors de la suppression");
        return;
      }

      alert("Planning supprimé avec succès");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-red-600">
            Confirmer la suppression
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <Icon icon="material-symbols:close" width={24} height={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <Icon
              icon="material-symbols:warning"
              className="text-red-500 text-3xl flex-shrink-0"
            />
            <div>
              <p className="font-medium text-red-900">Attention</p>
              <p className="text-sm text-red-700">
                Cette action est irréversible
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer ce planning ?
          </p>
          {planningDescription && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{planningDescription}"
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Icon icon="eos-icons:loading" width={20} height={20} />
                Suppression...
              </span>
            ) : (
              "Supprimer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
