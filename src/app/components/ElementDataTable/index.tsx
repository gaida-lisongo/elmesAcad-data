"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteElement } from "@/app/actions/unite-element.actions";
import ElementFormModal from "./ElementFormModal";

interface Element {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  objectifs: string[];
  place_ec: string;
  uniteId: string;
  anneeId: string;
  titulaireId?: string;
}

interface ElementDataTableProps {
  elements: Element[];
  uniteId: string;
  anneeId: string;
  onRefresh: () => void;
}

export default function ElementDataTable({
  elements,
  uniteId,
  anneeId,
  onRefresh,
}: ElementDataTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
          onClick={() => setIsModalOpen(true)}
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
                Crédits
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
                <td colSpan={6} className="px-4 py-8 text-center text-bodydark">
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
                  <td className="px-4 py-3 text-center text-black dark:text-white">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {element.credit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-bodydark">
                    <ul className="list-inside list-disc">
                      {element.objectifs.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-sm text-bodydark">
                    {element.place_ec.split("\n").map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
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

      {/* Multi-step Form Modal */}
      <ElementFormModal
        isOpen={isModalOpen}
        uniteId={uniteId}
        anneeId={anneeId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
}
