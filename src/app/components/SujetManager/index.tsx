"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import SujetFormModal from "./SujetFormModal";
import CritereModal from "./CritereModal";
import ProduitCard from "../ProduitCard";

interface SujetDataTableProps {
  sujets: any[];
  anneeId: string;
  promotionId: string;
  onRefresh: () => void;
}

export default function SujetDataTable({
  sujets,
  anneeId,
  promotionId,
  onRefresh,
}: SujetDataTableProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCritereModalOpen, setIsCritereModalOpen] = useState(false);
  const [selectedSujet, setSelectedSujet] = useState<any>(null);

  const handleEdit = (sujet: any) => {
    setSelectedSujet(sujet);
    setIsFormModalOpen(true);
  };

  const handleManageCriteres = (sujet: any) => {
    setSelectedSujet(sujet);
    setIsCritereModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedSujet(null);
  };

  const handleCloseCritereModal = () => {
    setIsCritereModalOpen(false);
    setSelectedSujet(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white">
          Sujets de recherche disponibles
        </h3>
        <button
          onClick={() => {
            setSelectedSujet(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Nouveau sujet
        </button>
      </div>

      {sujets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4">
            <Icon
              icon="material-symbols:lightbulb"
              className="text-4xl text-bodydark"
            />
          </div>
          <p className="mb-2 text-lg font-medium text-black dark:text-white">
            Aucun sujet de recherche
          </p>
          <p className="mb-6 text-sm text-bodydark">
            Créez votre premier sujet pour cette promotion
          </p>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            Créer un sujet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sujets.map((sujet) => (
            <ProduitCard
              key={sujet._id}
              designation={sujet.designation}
              prix={sujet.prix}
              isActive={sujet.isActive}
              dateDebut={sujet.date_debut}
              dateFin={sujet.date_fin}
              description={sujet.description}
              metadata={{
                icon: "material-symbols:checklist",
                label: `critère${(sujet.criteres?.length || 0) > 1 ? "s" : ""}`,
                value: sujet.criteres?.length || 0,
              }}
              imageUrl="/images/courses/react.webp"
              onEdit={() => handleEdit(sujet)}
              onManage={() => handleManageCriteres(sujet)}
              manageLabel="Gérer les critères"
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <SujetFormModal
        isOpen={isFormModalOpen}
        sujet={selectedSujet}
        anneeId={anneeId}
        promotionId={promotionId}
        onClose={handleCloseFormModal}
        onSuccess={onRefresh}
      />

      {/* Critere Modal */}
      {selectedSujet && (
        <CritereModal
          isOpen={isCritereModalOpen}
          sujet={selectedSujet}
          onClose={handleCloseCritereModal}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
