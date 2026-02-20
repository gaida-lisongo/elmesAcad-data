"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteElement } from "@/app/actions/unite-element.actions";
import ElementFormModal from "./ElementFormModal";
import ElementDetailModal from "./ElementDetailModal";

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [loading, setLoading] = useState(false);

  const handleViewDetails = (element: Element) => {
    setSelectedElement(element);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();

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
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white">
          Éléments Constitutifs
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Nouveau cours
        </button>
      </div>

      {elements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4">
            <Icon
              icon="material-symbols:book-outline"
              className="text-4xl text-bodydark"
            />
          </div>
          <p className="mb-2 text-lg font-medium text-black dark:text-white">
            Aucun élément constitutif
          </p>
          <p className="mb-6 text-sm text-bodydark">
            Commencez par créer votre premier élément de cours
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            Créer un élément
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elements.map((element) => (
            <div
              key={element._id}
              onClick={() => handleViewDetails(element)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:shadow-xl dark:border-strokedark dark:bg-boxdark"
            >
              {/* Card Header with Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src="/images/courses/webflow.webp"
                  alt={element.designation}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                {/* Credit Badge */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                    <Icon icon="material-symbols:credit-card" />
                    {element.credit} crédits
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Code */}
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-mono font-medium text-bodydark dark:bg-meta-4">
                    {element.code}
                  </span>
                </div>

                {/* Designation */}
                <h4 className="mb-3 line-clamp-2 text-lg font-bold text-black dark:text-white">
                  {element.designation}
                </h4>

                {/* Objectifs Preview */}
                {element.objectifs && element.objectifs.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-1 text-xs font-medium text-bodydark">
                      Objectifs ({element.objectifs.length})
                    </p>
                    <div className="line-clamp-2 text-sm text-bodydark">
                      {element.objectifs[0]}
                      {element.objectifs.length > 1 && "..."}
                    </div>
                  </div>
                )}

                {/* Place EC Preview */}
                {element.place_ec && (
                  <div className="mb-4 line-clamp-2 text-sm text-bodydark">
                    {element.place_ec}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-stroke pt-4 dark:border-strokedark">
                  <button
                    onClick={() => handleViewDetails(element)}
                    className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Voir détails
                    <Icon icon="material-symbols:arrow-forward" />
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(element._id, e)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                      title="Supprimer"
                      disabled={loading}
                    >
                      <Icon
                        icon="material-symbols:delete-outline"
                        className="text-xl"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 border-2 border-primary opacity-0 transition-opacity group-hover:opacity-100 rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* Multi-step Form Modal for Creating */}
      <ElementFormModal
        isOpen={isModalOpen}
        uniteId={uniteId}
        anneeId={anneeId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Detail/Edit Modal */}
      <ElementDetailModal
        isOpen={isDetailModalOpen}
        element={selectedElement}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedElement(null);
        }}
        onSuccess={onRefresh}
      />
    </div>
  );
}
