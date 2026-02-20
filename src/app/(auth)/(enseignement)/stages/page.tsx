"use client";

import { useEffect, useState } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";
import StageDataTable from "@/app/components/StageManager";
import { fetchStages } from "@/app/actions/stage.actions";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";

export default function StagesPage() {
  const { selectedAnnee, selectedPromotion } = useAcademicContext();
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStages = async () => {
    if (!selectedAnnee || !selectedPromotion) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchStages(selectedAnnee._id, selectedPromotion.id);

      if (result.success && result.data) {
        setStages(result.data);
      } else {
        toast.error(result.error || "Erreur lors du chargement des stages");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, [selectedAnnee, selectedPromotion]);

  if (!selectedAnnee || !selectedPromotion) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <Icon
            icon="material-symbols:business"
            width={64}
            height={64}
            className="mx-auto mb-4 text-gray-300"
          />
          <h3 className="mb-2 text-xl font-semibold text-gray-700">
            Sélectionnez une promotion
          </h3>
          <p className="text-gray-500">
            Choisissez une année académique et une promotion dans le menu de
            gauche
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  // Calculate metrics
  const totalStages = stages.length;
  const activeStages = stages.filter((s) => s.isActive).length;
  const totalRevenue = stages.reduce((sum, s) => sum + (s.prix || 0), 0);
  const totalEntreprises = stages.reduce(
    (sum, s) => sum + (s.entreprises?.length || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-2 p-6 dark:bg-boxdark-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Icon
                icon="material-symbols:business"
                className="text-4xl text-primary"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Gestion des stages
              </h1>
              <p className="text-bodydark">{selectedPromotion.name}</p>
            </div>
          </div>

          {/* Context Info */}
          <div className="border-t border-stroke pt-4 dark:border-strokedark">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1 text-sm text-bodydark">Année académique</p>
                <p className="font-semibold text-black dark:text-white">
                  {new Date(selectedAnnee.debut).getFullYear()} -{" "}
                  {new Date(selectedAnnee.fin).getFullYear()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-sm text-bodydark">Promotion</p>
                <p className="font-semibold text-black dark:text-white">
                  {selectedPromotion.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Stages */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:business"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Total Stages
              </p>
              <p className="text-4xl font-bold text-white">{totalStages}</p>
              <p className="mt-2 text-xs text-white/70">
                Opportunités de stage créées
              </p>
            </div>
          </div>

          {/* Card 2: Active Stages */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:check-circle"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Stages actifs
              </p>
              <p className="text-4xl font-bold text-white">{activeStages}</p>
              <p className="mt-2 text-xs text-white/70">
                Opportunités ouvertes
              </p>
            </div>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:payments"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Frais totaux
              </p>
              <p className="text-4xl font-bold text-white">${totalRevenue}</p>
              <p className="mt-2 text-xs text-white/70">
                Frais de traitement des stages
              </p>
            </div>
          </div>

          {/* Card 4: Total Entreprises */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:apartment"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Entreprises partenaires
              </p>
              <p className="text-4xl font-bold text-white">
                {totalEntreprises}
              </p>
              <p className="mt-2 text-xs text-white/70">
                Entreprises dans tous les stages
              </p>
            </div>
          </div>
        </div>

        {/* Stage DataTable */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
          <StageDataTable
            stages={stages}
            anneeId={selectedAnnee._id}
            promotionId={selectedPromotion.id}
            onRefresh={loadStages}
          />
        </div>
      </div>
    </div>
  );
}
