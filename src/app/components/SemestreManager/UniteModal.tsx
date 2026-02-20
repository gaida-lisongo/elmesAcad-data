"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { updateUnite } from "@/app/actions/unite.actions";
import Link from "next/link";

interface UniteType {
  _id?: string;
  code: string;
  designation: string;
  description: string[];
  competences: string[];
  credit: number;
}

interface UniteModalProps {
  promotionId: string;
  semestreIndex: number;
  uniteIndex: number;
  unite: UniteType;
  onClose: () => void;
  onUpdate: () => void;
}

export default function UniteModal({
  promotionId,
  semestreIndex,
  uniteIndex,
  unite,
  onClose,
  onUpdate,
}: UniteModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    code: unite.code,
    designation: unite.designation,
    description: unite.description.join("\n"),
    competences: unite.competences.join("\n"),
    credit: Number(unite.credit),
  });

  const handleUpdate = async () => {
    if (
      !editData.code ||
      !editData.designation ||
      !editData.description ||
      !editData.competences ||
      editData.credit <= 0
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await updateUnite(
        promotionId,
        semestreIndex,
        uniteIndex,
        editData,
      );

      if (result.success) {
        toast.success("Unité modifiée avec succès");
        setIsEditing(false);
        onUpdate();
      } else {
        toast.error(result.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating unite:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon
                icon="material-symbols:book"
                className="text-primary text-2xl"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-midnight_text">
                {unite.designation}
              </h3>
              <p className="text-sm text-gray-600">
                {unite.code} • {unite.credit} crédits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Modifier"
              >
                <Icon icon="material-symbols:edit" width={24} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Fermer"
            >
              <Icon icon="material-symbols:close" width={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editData.code}
                    onChange={(e) =>
                      setEditData({ ...editData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crédits <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={editData.credit}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        credit: parseInt(e.target.value) || 0,
                      })
                    }
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
                  value={editData.designation}
                  onChange={(e) =>
                    setEditData({ ...editData, designation: e.target.value })
                  }
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
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({ ...editData, description: e.target.value })
                  }
                  rows={5}
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
                  value={editData.competences}
                  onChange={(e) =>
                    setEditData({ ...editData, competences: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                      code: unite.code,
                      designation: unite.designation,
                      description: unite.description.join("\n"),
                      competences: unite.competences.join("\n"),
                      credit: Number(unite.credit),
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Description
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {unite.description.map((desc, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Icon
                          icon="material-symbols:check-circle"
                          className="text-primary text-xl flex-shrink-0 mt-0.5"
                        />
                        <span className="text-gray-700">{desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Compétences */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Compétences visées
                </h4>
                <div className="flex flex-wrap gap-2">
                  {unite.competences.map((comp, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Éléments (Cours) - Simplified */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Éléments constitutifs (Cours)
                  </h4>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Icon
                    icon="material-symbols:school-outline"
                    className="text-gray-300 text-5xl mx-auto mb-3"
                  />
                  <p className="text-gray-600 text-sm mb-4">
                    Gérez les cours de cette unité d'enseignement
                  </p>
                  <Link
                    href={`/cours/${unite._id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition"
                  >
                    <Icon icon="material-symbols:settings" width={20} />
                    Gérer les cours
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
