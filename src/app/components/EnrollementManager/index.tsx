"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import EnrollementFormModal from "./EnrollementFormModal";
import MatiereSelectionModal from "./MatiereSelectionModal";
import ProduitCard from "../ProduitCard";

interface EnrollementDataTableProps {
  enrollements: any[];
  anneeId: string;
  promotionId: string;
  onRefresh: () => void;
}

export default function EnrollementDataTable({
  enrollements = [],
  anneeId,
  promotionId,
  onRefresh,
}: EnrollementDataTableProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMatiereModalOpen, setIsMatiereModalOpen] = useState(false);
  const [selectedEnrollement, setSelectedEnrollement] = useState<any>(null);

  const handleEdit = (enrollement: any) => {
    setSelectedEnrollement(enrollement);
    setIsFormModalOpen(true);
  };

  const handleManageMatieres = (enrollement: any) => {
    setSelectedEnrollement(enrollement);
    setIsMatiereModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedEnrollement(null);
  };

  const handleCloseMatiereModal = () => {
    setIsMatiereModalOpen(false);
    setSelectedEnrollement(null);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold dark:text-white">
          Enrollements disponibles
        </h3>
        <button
          onClick={() => {
            setSelectedEnrollement(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
        >
          <Icon icon="material-symbols:add" className="text-xl" />
          Nouvel enrollement
        </button>
      </div>

      {enrollements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stroke bg-white py-16 dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-meta-4">
            <Icon
              icon="material-symbols:assignment-outline"
              className="text-4xl text-bodydark"
            />
          </div>
          <p className="mb-2 text-lg font-medium text-black dark:text-white">
            Aucun enrollement
          </p>
          <p className="mb-6 text-sm text-bodydark">
            Créez votre premier enrollement pour cette promotion
          </p>
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/90"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            Créer un enrollement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollements.map((enrollement) => (
            <ProduitCard
              key={enrollement._id}
              designation={enrollement.designation}
              prix={enrollement.prix}
              isActive={enrollement.isActive}
              dateDebut={enrollement.debut}
              dateFin={enrollement.fin}
              description={enrollement.description}
              metadata={{
                icon: "material-symbols:book-outline",
                label: `matière${(enrollement.matieres?.length || 0) > 1 ? "s" : ""}`,
                value: enrollement.matieres?.length || 0,
              }}
              imageUrl="/images/courses/mern.webp"
              onEdit={() => handleEdit(enrollement)}
              onManage={() => handleManageMatieres(enrollement)}
              manageLabel="Gérer les matières"
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <EnrollementFormModal
        isOpen={isFormModalOpen}
        enrollement={selectedEnrollement}
        anneeId={anneeId}
        promotionId={promotionId}
        onClose={handleCloseFormModal}
        onSuccess={onRefresh}
      />

      {/* Matiere Selection Modal */}
      {selectedEnrollement && (
        <MatiereSelectionModal
          isOpen={isMatiereModalOpen}
          enrollement={selectedEnrollement}
          anneeId={anneeId}
          promotionId={promotionId}
          onClose={handleCloseMatiereModal}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
