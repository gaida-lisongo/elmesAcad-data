"use client";

import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { useState } from "react";

interface DetailElementProps {
  element: ElementType;
  onClose: () => void;
  onSave?: (updatedElement: ElementType) => void;
}

export const DetailElement = ({
  element,
  onClose,
  onSave,
}: DetailElementProps) => {
  const [editData, setEditData] = useState<ElementType>(element);

  const handleAddToArray = (fieldName: keyof ElementType, newValue: any) => {
    const currentArray = Array.isArray(editData[fieldName])
      ? [...(editData[fieldName] as any[])]
      : [];

    setEditData({
      ...editData,
      [fieldName]: [...currentArray, newValue],
    });
  };

  const handleRemoveFromArray = (
    fieldName: keyof ElementType,
    index: number,
  ) => {
    const currentArray = Array.isArray(editData[fieldName])
      ? [...(editData[fieldName] as any[])]
      : [];

    setEditData({
      ...editData,
      [fieldName]: currentArray.filter((_, i) => i !== index),
    });
  };

  const handleUpdateArrayItem = (
    fieldName: keyof ElementType,
    index: number,
    value: any,
  ) => {
    const currentArray = Array.isArray(editData[fieldName])
      ? [...(editData[fieldName] as any[])]
      : [];

    currentArray[index] = value;

    setEditData({
      ...editData,
      [fieldName]: currentArray,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-4xl w-full mx-4 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{editData.code}</h1>
            <p className="text-primary/90 mt-1">{editData.designation}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(100vh-220px)]">
          <div className="space-y-8">
            {/* Objectifs */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Objectifs
              </h2>
              <div className="space-y-3">
                {Array.isArray(editData.objectifs) &&
                  editData.objectifs.map((objectif, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={objectif}
                        onChange={(e) =>
                          handleUpdateArrayItem(
                            "objectifs",
                            idx,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                      />
                      <button
                        onClick={() => handleRemoveFromArray("objectifs", idx)}
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 h-fit"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => handleAddToArray("objectifs", "")}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                + Ajouter un objectif
              </button>
            </section>

            {/* Place EC */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Place EC
              </h2>
              <textarea
                value={editData.place_ec || ""}
                onChange={(e) =>
                  setEditData({ ...editData, place_ec: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                rows={4}
                placeholder="Décrivez la place de cet élément dans le cursus..."
              />
            </section>

            {/* Planning */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Planning
              </h2>
              <div className="space-y-4">
                {Array.isArray(editData.planning) &&
                  editData.planning.map((plan, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 dark:border-slate-600 rounded-md p-4 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Chapitre {idx + 1}
                        </h3>
                        <button
                          onClick={() => handleRemoveFromArray("planning", idx)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Chapitre
                          </label>
                          <input
                            type="text"
                            value={(plan as any).chapitre || ""}
                            onChange={(e) =>
                              handleUpdateArrayItem("planning", idx, {
                                ...plan,
                                chapitre: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                            placeholder="Titre du chapitre"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sections
                          </label>
                          <div className="space-y-2">
                            {Array.isArray((plan as any).sections) &&
                              (plan as any).sections.map(
                                (section: string, sIdx: number) => (
                                  <div key={sIdx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={section}
                                      onChange={(e) => {
                                        const sections = [
                                          ...((plan as any).sections || []),
                                        ];
                                        sections[sIdx] = e.target.value;
                                        handleUpdateArrayItem("planning", idx, {
                                          ...plan,
                                          sections,
                                        });
                                      }}
                                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                      placeholder="Section"
                                    />
                                    <button
                                      onClick={() => {
                                        const sections = [
                                          ...((plan as any).sections || []),
                                        ].filter((_, i) => i !== sIdx);
                                        handleUpdateArrayItem("planning", idx, {
                                          ...plan,
                                          sections,
                                        });
                                      }}
                                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ),
                              )}
                          </div>
                          <button
                            onClick={() => {
                              const sections = [
                                ...((plan as any).sections || []),
                                "",
                              ];
                              handleUpdateArrayItem("planning", idx, {
                                ...plan,
                                sections,
                              });
                            }}
                            className="mt-2 text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                          >
                            + Section
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() =>
                  handleAddToArray("planning", {
                    chapitre: "",
                    sections: [],
                  })
                }
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                + Ajouter un chapitre
              </button>
            </section>

            {/* Mode Evaluation */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Mode d'Évaluation
              </h2>
              <div className="space-y-3">
                {Array.isArray(editData.mode_evaluation) &&
                  editData.mode_evaluation.map((mode, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={mode}
                        onChange={(e) =>
                          handleUpdateArrayItem(
                            "mode_evaluation",
                            idx,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                        placeholder="Décrivez le mode d'évaluation..."
                      />
                      <button
                        onClick={() =>
                          handleRemoveFromArray("mode_evaluation", idx)
                        }
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 h-fit"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => handleAddToArray("mode_evaluation", "")}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                + Ajouter un mode d'évaluation
              </button>
            </section>

            {/* Mode Enseignement */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Mode d'Enseignement
              </h2>
              <div className="space-y-3">
                {Array.isArray(editData.mode_enseignement) &&
                  editData.mode_enseignement.map((mode, idx) => (
                    <div key={idx} className="flex gap-2">
                      <textarea
                        value={mode}
                        onChange={(e) =>
                          handleUpdateArrayItem(
                            "mode_enseignement",
                            idx,
                            e.target.value,
                          )
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                        rows={3}
                        placeholder="Décrivez le mode d'enseignement..."
                      />
                      <button
                        onClick={() =>
                          handleRemoveFromArray("mode_enseignement", idx)
                        }
                        className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 h-fit"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
              </div>
              <button
                onClick={() => handleAddToArray("mode_enseignement", "")}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                + Ajouter un mode d'enseignement
              </button>
            </section>

            {/* Pénalités */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Pénalités
              </h2>
              <div className="space-y-4">
                {Array.isArray(editData.penalites) &&
                  editData.penalites.map((penalite, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-300 dark:border-slate-600 rounded-md p-4 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Pénalité {idx + 1}
                        </h3>
                        <button
                          onClick={() =>
                            handleRemoveFromArray("penalites", idx)
                          }
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Faute
                          </label>
                          <textarea
                            value={(penalite as any).faute || ""}
                            onChange={(e) =>
                              handleUpdateArrayItem("penalites", idx, {
                                ...penalite,
                                faute: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                            rows={3}
                            placeholder="Décrivez la faute..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sanction
                          </label>
                          <textarea
                            value={(penalite as any).sanction || ""}
                            onChange={(e) =>
                              handleUpdateArrayItem("penalites", idx, {
                                ...penalite,
                                sanction: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none"
                            rows={3}
                            placeholder="Décrivez la sanction..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <button
                onClick={() =>
                  handleAddToArray("penalites", { faute: "", sanction: "" })
                }
                className="mt-3 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                + Ajouter une pénalité
              </button>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 dark:bg-slate-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-slate-600"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};
