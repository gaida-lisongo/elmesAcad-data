"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  createElement,
  updateElement,
  deleteElement,
} from "@/app/actions/unite-element.actions";

interface Element {
  _id: string;
  code: string;
  designation: string;
  objectifs: string[];
  place_ec: string;
  uniteId: string;
}

interface ElementDataTableProps {
  elements: Element[];
  uniteId: string;
  onRefresh: () => void;
}

export default function ElementDataTable({
  elements,
  uniteId,
  onRefresh,
}: ElementDataTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    designation: "",
    objectifs: "",
    place_ec: "",
  });

  const openModal = (element?: Element) => {
    if (element) {
      setEditingElement(element);
      setFormData({
        code: element.code,
        designation: element.designation,
        objectifs: element.objectifs.join("\n"),
        place_ec: element.place_ec,
      });
    } else {
      setEditingElement(null);
      setFormData({
        code: "",
        designation: "",
        objectifs: "",
        place_ec: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingElement(null);
    setFormData({
      code: "",
      designation: "",
      objectifs: "",
      place_ec: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = editingElement
        ? await updateElement(editingElement._id, formData)
        : await createElement(uniteId, formData);

      if (result.success) {
        toast.success(
          editingElement
            ? "Élément modifié avec succès"
            : "Élément créé avec succès",
        );
        closeModal();
        onRefresh();
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (elementId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet élément ?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteElement(elementId);

      if (result.success) {
        toast.success("Élément supprimé avec succès");
        onRefresh();
      } else {
        toast.error(result.error || "Échec de la suppression");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white">
          Éléments Constitutifs
        </h3>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Ajouter un élément
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-stroke bg-gray-2 text-left dark:border-strokedark dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Code
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Désignation
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Objectifs
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Place EC
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {elements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-bodydark">
                  Aucun élément trouvé. Cliquez sur "Ajouter un élément" pour
                  commencer.
                </td>
              </tr>
            ) : (
              elements.map((element, index) => (
                <tr
                  key={element._id}
                  className={`border-b border-stroke dark:border-strokedark ${
                    index % 2 === 0
                      ? "bg-white dark:bg-boxdark"
                      : "bg-gray-2 dark:bg-meta-4"
                  }`}
                >
                  <td className="px-4 py-3 text-black dark:text-white">
                    {element.code}
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {element.designation}
                  </td>
                  <td className="px-4 py-3 text-sm text-bodydark">
                    <ul className="list-inside list-disc">
                      {element.objectifs.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-black dark:text-white">
                    {element.place_ec}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(element)}
                        className="rounded p-1 text-primary hover:bg-primary/10"
                        title="Modifier"
                      >
                        <Icon
                          icon="material-symbols:edit-outline"
                          className="text-xl"
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(element._id)}
                        className="rounded p-1 text-red-500 hover:bg-red-500/10"
                        title="Supprimer"
                        disabled={loading}
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          className="text-xl"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold dark:text-white">
                {editingElement ? "Modifier" : "Ajouter"} un élément
              </h3>
              <button
                onClick={closeModal}
                className="text-bodydark hover:text-black dark:hover:text-white"
              >
                <Icon icon="material-symbols:close" className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: EC1.1"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Désignation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: Algorithmique et structures de données"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Objectifs (un par ligne){" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.objectifs}
                  onChange={(e) =>
                    setFormData({ ...formData, objectifs: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex:&#10;Maîtriser les structures de données fondamentales&#10;Analyser la complexité des algorithmes&#10;Implémenter des solutions efficaces"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Place EC <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.place_ec}
                  onChange={(e) =>
                    setFormData({ ...formData, place_ec: e.target.value })
                  }
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                  placeholder="Ex: Cours magistral et TD"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-stroke px-6 py-2 text-black hover:bg-gray-2 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading
                    ? "En cours..."
                    : editingElement
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
