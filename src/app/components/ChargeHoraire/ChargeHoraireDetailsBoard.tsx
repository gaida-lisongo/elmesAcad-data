"use client";

import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { updateElement } from "@/app/actions/unite-element.actions";
import { useState, useMemo } from "react";
import { DetailElement } from "./DetailElement";

interface ChargeHoraireDetailsBoardProps {
  elements: ElementType[];
  onElementUpdate?: (element: ElementType) => void;
}

interface MetricCard {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}

export const ChargeHoraireDetailsBoard = ({
  elements,
  onElementUpdate,
}: ChargeHoraireDetailsBoardProps) => {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSort, setFilterSort] = useState<
    "code" | "credit" | "designation"
  >("code");
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Calculate metrics
  const metrics: MetricCard[] = useMemo(() => {
    const totalElements = elements.length;
    const totalCredits = elements.reduce(
      (sum, el) => sum + (el.credit || 0),
      0,
    );
    const avgCredit =
      totalElements > 0 ? (totalCredits / totalElements).toFixed(1) : 0;

    return [
      {
        label: "Éléments Constitutifs",
        value: totalElements,
        color: "bg-blue-500",
        icon: "📚",
      },
      {
        label: "Crédits Totaux",
        value: totalCredits,
        color: "bg-green-500",
        icon: "⭐",
      },
      {
        label: "Crédits Moyens",
        value: avgCredit,
        color: "bg-purple-500",
        icon: "📊",
      },
      {
        label: "Éléments avec objectifs",
        value: elements.filter((el) => el.objectifs && el.objectifs.length > 0)
          .length,
        color: "bg-orange-500",
        icon: "🎯",
      },
    ];
  }, [elements]);

  // Filter and sort elements
  const filteredElements = useMemo(() => {
    let filtered = elements.filter((el) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        el.code.toLowerCase().includes(searchLower) ||
        el.designation.toLowerCase().includes(searchLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      if (filterSort === "code") {
        return a.code.localeCompare(b.code);
      } else if (filterSort === "credit") {
        return (b.credit || 0) - (a.credit || 0);
      } else {
        return a.designation.localeCompare(b.designation);
      }
    });

    return filtered;
  }, [elements, searchTerm, filterSort]);

  const handleSaveElement = async (updatedElement: ElementType) => {
    try {
      setIsSaving(true);
      setSaveStatus({ type: null, message: "" });

      const result = await updateElement(updatedElement._id, {
        code: updatedElement.code,
        designation: updatedElement.designation,
        credit: updatedElement.credit || 0,
        objectifs: updatedElement.objectifs || [],
        place_ec: updatedElement.place_ec || "",
        planning: updatedElement.planning,
        mode_evaluation: updatedElement.mode_evaluation,
        mode_enseignement: updatedElement.mode_enseignement,
        penalites: updatedElement.penalites,
      });

      if (result.success) {
        setSaveStatus({
          type: "success",
          message: "Élément mis à jour avec succès!",
        });
        if (onElementUpdate) {
          onElementUpdate(updatedElement);
        }
        setSelectedElement(null);
        // Clear success message after 3 seconds
        setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
      } else {
        setSaveStatus({
          type: "error",
          message: result.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: "Erreur lors de la mise à jour de l'élément",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Status Messages */}
      {saveStatus.type && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveStatus.type === "success"
              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
              : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
          }`}
        >
          <span className="text-xl">
            {saveStatus.type === "success" ? "✓" : "✕"}
          </span>
          <span>{saveStatus.message}</span>
        </div>
      )}

      <div className="w-full space-y-6">
        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-md overflow-hidden"
            >
              <div className={`${metric.color} h-1`} />
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {metric.value}
                    </p>
                  </div>
                  <span className="text-4xl opacity-30">{metric.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Elements List Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Par code ou désignation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trier par
                </label>
                <select
                  value={filterSort}
                  onChange={(e) =>
                    setFilterSort(
                      e.target.value as "code" | "credit" | "designation",
                    )
                  }
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="code">Code</option>
                  <option value="credit">Crédits</option>
                  <option value="designation">Désignation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Elements Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Désignation
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Crédits
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Objectifs
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Planning
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredElements.length > 0 ? (
                  filteredElements.map((element) => (
                    <tr
                      key={element._id}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {element.code}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-700 dark:text-gray-300">
                          {element.designation}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-semibold">
                          {element.credit}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            element.objectifs && element.objectifs.length > 0
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {element.objectifs ? element.objectifs.length : 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            element.planning && element.planning.length > 0
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-400"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {element.planning ? element.planning.length : 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setSelectedElement(element)}
                          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                          ✎ Configurer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      Aucun élément trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Results summary */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Affichage de {filteredElements.length} sur {elements.length}{" "}
            éléments
          </div>
        </div>
      </div>

      {/* Detail Element Modal */}
      {selectedElement && (
        <DetailElement
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
          onSave={handleSaveElement}
          isSaving={isSaving}
        />
      )}
    </>
  );
};
