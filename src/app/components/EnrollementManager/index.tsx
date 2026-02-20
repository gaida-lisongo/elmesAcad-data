"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { deleteEnrollement } from "@/app/actions/enrollement.actions";
import EnrollementFormModal from "./EnrollementFormModal";
import MatiereSelectionModal from "./MatiereSelectionModal";

interface EnrollementDataTableProps {
  enrollements: any[];
  anneeId: string;
  promotionId: string;
  onRefresh: () => void;
}

export default function EnrollementDataTable({
  enrollements,
  anneeId,
  promotionId,
  onRefresh,
}: EnrollementDataTableProps) {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isMatiereModalOpen, setIsMatiereModalOpen] = useState(false);
  const [selectedEnrollement, setSelectedEnrollement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (enrollement: any) => {
    setSelectedEnrollement(enrollement);
    setIsFormModalOpen(true);
  };

  const handleManageMatieres = (enrollement: any) => {
    setSelectedEnrollement(enrollement);
    setIsMatiereModalOpen(true);
  };

  const handleDelete = async (enrollementId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm("Voulez-vous vraiment supprimer cet enrollement ?")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteEnrollement(enrollementId);

      if (result.success) {
        toast.success("Enrollement supprimé avec succès");
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            <div
              key={enrollement._id}
              className="group relative overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:shadow-xl dark:border-strokedark dark:bg-boxdark"
            >
              {/* Card Header with gradient */}
              <div className="relative h-36 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-6">
                {/* Status badge */}
                <div className="absolute right-4 top-4">
                  {enrollement.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                      <Icon icon="material-symbols:check-circle" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white">
                      <Icon icon="material-symbols:cancel" />
                      Inactif
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="absolute bottom-4 left-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg">
                    <Icon icon="material-symbols:payments" />${enrollement.prix}
                  </div>
                </div>

                {/* Decorative circle */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20"></div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Title */}
                <h4 className="mb-3 line-clamp-2 text-lg font-bold text-black dark:text-white">
                  {enrollement.designation}
                </h4>

                {/* Dates */}
                <div className="mb-4 flex items-center gap-4 text-sm text-bodydark">
                  <div className="flex items-center gap-1">
                    <Icon icon="material-symbols:calendar-today" />
                    {formatDate(enrollement.debut)}
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <Icon icon="material-symbols:event" />
                    {formatDate(enrollement.fin)}
                  </div>
                </div>

                {/* Description Preview */}
                {enrollement.description &&
                  enrollement.description.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-1 text-xs font-medium text-bodydark">
                        Description ({enrollement.description.length} points)
                      </p>
                      <div className="line-clamp-2 text-sm text-bodydark">
                        • {enrollement.description[0]}
                      </div>
                    </div>
                  )}

                {/* Matieres count */}
                <div className="mb-4 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:book-outline"
                    className="text-xl text-primary"
                  />
                  <span className="text-sm font-medium text-bodydark">
                    {enrollement.matieres?.length || 0} matière
                    {(enrollement.matieres?.length || 0) > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t border-stroke pt-4 dark:border-strokedark">
                  <button
                    onClick={() => handleManageMatieres(enrollement)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                  >
                    <Icon icon="material-symbols:settings" />
                    Gérer les matières
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(enrollement)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <Icon icon="material-symbols:edit" />
                      Modifier
                    </button>
                    <button
                      onClick={(e) => handleDelete(enrollement._id, e)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                      disabled={loading}
                    >
                      <Icon icon="material-symbols:delete-outline" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary opacity-0 transition-opacity group-hover:opacity-100"></div>
            </div>
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
