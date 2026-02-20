"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { addUnite, deleteUnite } from "@/app/actions/unite.actions";
import UniteModal from "./UniteModal";

interface UniteType {
  _id?: string;
  code: string;
  designation: string;
  description: string[];
  competences: string[];
  credit: number;
  elements?: any[];
}

interface UniteDataTableProps {
  promotionId: string;
  semestreIndex: number;
  initialUnites: UniteType[];
  onUpdate: () => void;
}

export default function UniteDataTable({
  promotionId,
  semestreIndex,
  initialUnites,
  onUpdate,
}: UniteDataTableProps) {
  const [unites, setUnites] = useState<UniteType[]>(initialUnites);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedUnite, setSelectedUnite] = useState<{
    unite: UniteType;
    index: number;
  } | null>(null);
  const [newUnite, setNewUnite] = useState({
    code: "",
    designation: "",
    description: "",
    competences: "",
    credit: 0,
  });

  const handleAddUnite = async () => {
    if (
      !newUnite.code ||
      !newUnite.designation ||
      !newUnite.description ||
      !newUnite.competences ||
      newUnite.credit <= 0
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await addUnite(promotionId, semestreIndex, newUnite);

      if (result.success) {
        toast.success("Unité ajoutée avec succès");
        setNewUnite({
          code: "",
          designation: "",
          description: "",
          competences: "",
          credit: 0,
        });
        setIsAdding(false);
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de l'ajout de l'unité");
      }
    } catch (error) {
      console.error("Error adding unite:", error);
      toast.error("Erreur lors de l'ajout de l'unité");
    }
  };

  const handleDeleteUnite = async (index: number) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer cette unité d'enseignement ?",
      )
    ) {
      return;
    }

    try {
      const result = await deleteUnite(promotionId, semestreIndex, index);

      if (result.success) {
        toast.success("Unité supprimée avec succès");
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting unite:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Unités d'Enseignement
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Icon icon="material-symbols:add" width={20} />
          Ajouter une unité
        </button>
      </div>

      {/* Add Unite Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-midnight_text mb-6">
              Nouvelle Unité d'Enseignement
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUnite.code}
                    onChange={(e) =>
                      setNewUnite({ ...newUnite, code: e.target.value })
                    }
                    placeholder="Ex: UE101"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crédits <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newUnite.credit}
                    onChange={(e) =>
                      setNewUnite({
                        ...newUnite,
                        credit: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Ex: 6"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUnite.designation}
                  onChange={(e) =>
                    setNewUnite({ ...newUnite, designation: e.target.value })
                  }
                  placeholder="Ex: Mathématiques Appliquées"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (une ligne par point)
                  </span>
                </label>
                <textarea
                  value={newUnite.description}
                  onChange={(e) =>
                    setNewUnite({ ...newUnite, description: e.target.value })
                  }
                  placeholder="Introduction aux concepts fondamentaux&#10;Analyse et résolution de problèmes&#10;Applications pratiques"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compétences <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">
                    (une ligne par compétence)
                  </span>
                </label>
                <textarea
                  value={newUnite.competences}
                  onChange={(e) =>
                    setNewUnite({ ...newUnite, competences: e.target.value })
                  }
                  placeholder="Maîtrise des concepts fondamentaux&#10;Capacité d'analyse et de synthèse&#10;Résolution de problèmes complexes"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewUnite({
                    code: "",
                    designation: "",
                    description: "",
                    competences: "",
                    credit: 0,
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAddUnite}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unite Modal */}
      {selectedUnite && (
        <UniteModal
          promotionId={promotionId}
          semestreIndex={semestreIndex}
          uniteIndex={selectedUnite.index}
          unite={selectedUnite.unite}
          onClose={() => setSelectedUnite(null)}
          onUpdate={onUpdate}
        />
      )}

      {/* Table */}
      {unites.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Désignation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Crédits
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Éléments
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {unites.map((unite, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => setSelectedUnite({ unite, index })}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {unite.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {unite.designation}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {unite.credit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {unite.elements && unite.elements.length > 0 ? (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-medium">
                          {unite.elements.length} cours
                        </span>
                      ) : (
                        <span className="text-gray-400">Aucun cours</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteUnite(index);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Icon icon="material-symbols:delete" width={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Icon
            icon="material-symbols:school-outline"
            className="text-gray-300 text-6xl mx-auto mb-4"
          />
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Aucune unité d'enseignement
          </h4>
          <p className="text-gray-500 mb-6">
            Ajoutez des unités d'enseignement à ce semestre
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Icon icon="material-symbols:add" width={20} />
            Ajouter la première unité
          </button>
        </div>
      )}
    </div>
  );
}
