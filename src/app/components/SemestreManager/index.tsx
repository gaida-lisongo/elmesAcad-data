"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  addSemestre,
  updateSemestre,
  deleteSemestre,
} from "@/app/actions/semestre.actions";
import UniteDataTable from "./UniteDataTable";

interface SemestreType {
  designation: string;
  credit: number;
  unites: any[];
}

interface SemestreManagerProps {
  promotionId: string;
  initialSemestres: SemestreType[];
  onUpdate: () => void;
}

export default function SemestreManager({
  promotionId,
  initialSemestres,
  onUpdate,
}: SemestreManagerProps) {
  const [semestres, setSemestres] = useState<SemestreType[]>(initialSemestres);
  const [activeTab, setActiveTab] = useState(0);
  const [isAddingSemestre, setIsAddingSemestre] = useState(false);
  const [isEditingTab, setIsEditingTab] = useState(false);
  const [newSemestre, setNewSemestre] = useState({
    designation: "",
    credit: 0,
  });
  const [editSemestre, setEditSemestre] = useState({
    designation: "",
    credit: 0,
  });

  useEffect(() => {
    setSemestres(initialSemestres);
  }, [initialSemestres]);

  const handleAddSemestre = async () => {
    if (!newSemestre.designation || newSemestre.credit <= 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await addSemestre(promotionId, newSemestre);

      if (result.success) {
        toast.success("Semestre ajouté avec succès");
        setNewSemestre({ designation: "", credit: 0 });
        setIsAddingSemestre(false);
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de l'ajout du semestre");
      }
    } catch (error) {
      console.error("Error adding semestre:", error);
      toast.error("Erreur lors de l'ajout du semestre");
    }
  };

  const handleUpdateSemestre = async () => {
    if (!editSemestre.designation || editSemestre.credit <= 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await updateSemestre(promotionId, activeTab, editSemestre);

      if (result.success) {
        toast.success("Semestre modifié avec succès");
        setIsEditingTab(false);
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating semestre:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteSemestre = async () => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir supprimer ce semestre et toutes ses unités ?",
      )
    ) {
      return;
    }

    try {
      const result = await deleteSemestre(promotionId, activeTab);

      if (result.success) {
        toast.success("Semestre supprimé avec succès");
        setActiveTab(0);
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting semestre:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const startEditingTab = () => {
    if (semestres[activeTab]) {
      setEditSemestre({
        designation: semestres[activeTab].designation,
        credit: Number(semestres[activeTab].credit),
      });
      setIsEditingTab(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-midnight_text">
          Gestion des Semestres
        </h2>
        <button
          onClick={() => setIsAddingSemestre(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Icon icon="material-symbols:add" width={20} />
          Ajouter un semestre
        </button>
      </div>

      {/* Add Semestre Modal */}
      {isAddingSemestre && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-midnight_text mb-6">
              Nouveau Semestre
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation
                </label>
                <input
                  type="text"
                  value={newSemestre.designation}
                  onChange={(e) =>
                    setNewSemestre({
                      ...newSemestre,
                      designation: e.target.value,
                    })
                  }
                  placeholder="Ex: Semestre 1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crédits
                </label>
                <input
                  type="number"
                  value={newSemestre.credit}
                  onChange={(e) =>
                    setNewSemestre({
                      ...newSemestre,
                      credit: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Ex: 30"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setIsAddingSemestre(false);
                  setNewSemestre({ designation: "", credit: 0 });
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSemestre}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Semestre Modal */}
      {isEditingTab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-midnight_text mb-6">
              Modifier le Semestre
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Désignation
                </label>
                <input
                  type="text"
                  value={editSemestre.designation}
                  onChange={(e) =>
                    setEditSemestre({
                      ...editSemestre,
                      designation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crédits
                </label>
                <input
                  type="number"
                  value={editSemestre.credit}
                  onChange={(e) =>
                    setEditSemestre({
                      ...editSemestre,
                      credit: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditingTab(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateSemestre}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {semestres.length > 0 ? (
        <div>
          {/* Tab Headers */}
          <div className="border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
            {semestres.map((semestre, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === index
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {semestre.designation}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {semestres[activeTab] && (
              <div>
                {/* Semestre Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-midnight_text mb-2">
                        {semestres[activeTab].designation}
                      </h3>
                      <p className="text-gray-600">
                        {semestres[activeTab].credit} crédits
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={startEditingTab}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <Icon icon="material-symbols:edit" width={20} />
                      </button>
                      <button
                        onClick={handleDeleteSemestre}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Icon icon="material-symbols:delete" width={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unites DataTable */}
                <UniteDataTable
                  promotionId={promotionId}
                  semestreIndex={activeTab}
                  initialUnites={semestres[activeTab].unites || []}
                  onUpdate={onUpdate}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Icon
            icon="material-symbols:folder-open"
            className="text-gray-300 text-6xl mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucun semestre
          </h3>
          <p className="text-gray-500 mb-6">
            Commencez par ajouter un semestre à cette promotion
          </p>
          <button
            onClick={() => setIsAddingSemestre(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Icon icon="material-symbols:add" width={20} />
            Ajouter le premier semestre
          </button>
        </div>
      )}
    </div>
  );
}
