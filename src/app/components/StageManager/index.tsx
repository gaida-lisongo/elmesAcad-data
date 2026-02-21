"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import StageFormModal from "./StageFormModal";
import EntrepriseSelectionModal from "./EntrepriseSelectionModal";
import ProduitCard from "../ProduitCard";

interface StageDataTableProps {
  stages: any[];
  anneeId: string;
  promotionId: string;
  onRefresh: () => void;
}

export default function StageDataTable({
  stages = [],
  anneeId,
  promotionId,
  onRefresh,
}: StageDataTableProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEntrepriseModalOpen, setIsEntrepriseModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<any>(null);

  const handleEdit = (stage: any) => {
    setSelectedStage(stage);
    setIsFormModalOpen(true);
  };

  const handleManageEntreprises = (stage: any) => {
    setSelectedStage(stage);
    setIsEntrepriseModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedStage(null);
  };

  const handleCloseEntrepriseModal = () => {
    setIsEntrepriseModalOpen(false);
    setSelectedStage(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white">
          Stages disponibles
        </h3>
        <button
          onClick={() => {
            setSelectedStage(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Nouveau stage
        </button>
      </div>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4">
            <Icon
              icon="material-symbols:business"
              className="text-4xl text-bodydark"
            />
          </div>
          <p className="mb-2 text-lg font-medium text-black dark:text-white">
            Aucun stage
          </p>
          <p className="mb-6 text-sm text-bodydark">
            Créez votre premier stage pour cette promotion
          </p>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            Créer un stage
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((stage) => (
            <ProduitCard
              key={stage._id}
              designation={stage.designation}
              prix={stage.prix}
              isActive={stage.isActive}
              dateDebut={stage.date_debut}
              dateFin={stage.date_fin}
              description={stage.description}
              metadata={{
                icon: "material-symbols:business",
                label: `entreprise${(stage.entreprises?.length || 0) > 1 ? "s" : ""}`,
                value: stage.entreprises?.length || 0,
              }}
              imageUrl="/images/courses/webflow.webp"
              onEdit={() => handleEdit(stage)}
              onManage={() => handleManageEntreprises(stage)}
              manageLabel="Gérer les entreprises"
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <StageFormModal
        isOpen={isFormModalOpen}
        stage={selectedStage}
        anneeId={anneeId}
        promotionId={promotionId}
        onClose={handleCloseFormModal}
        onSuccess={onRefresh}
      />

      {/* Entreprise Selection Modal */}
      {selectedStage && (
        <EntrepriseSelectionModal
          isOpen={isEntrepriseModalOpen}
          stage={selectedStage}
          onClose={handleCloseEntrepriseModal}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
