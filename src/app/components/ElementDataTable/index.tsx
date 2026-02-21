"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteElement } from "@/app/actions/unite-element.actions";
import ElementFormModal from "./ElementFormModal";
import ElementDetailModal from "./ElementDetailModal";
import ElementCard from "@/app/components/ElementCard";

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
            <ElementCard
              key={element._id}
              element={element}
              onView={handleViewDetails}
              onDelete={handleDelete}
              deletingId={loading ? element._id : null}
            />
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
