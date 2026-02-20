"use client";

import { useEffect, useState } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";
import SujetDataTable from "@/app/components/SujetManager";
import { fetchSujets } from "@/app/actions/sujet.actions";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";

export default function SujetsPage() {
  const { selectedAnnee, selectedPromotion } = useAcademicContext();
  const [sujets, setSujets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSujets = async () => {
    if (!selectedAnnee || !selectedPromotion) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await fetchSujets(selectedAnnee._id, selectedPromotion.id);

      if (result.success && result.data) {
        setSujets(result.data);
      } else {
        toast.error(result.error || "Erreur lors du chargement des sujets");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSujets();
  }, [selectedAnnee, selectedPromotion]);

  if (!selectedAnnee || !selectedPromotion) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <Icon
            icon="material-symbols:lightbulb"
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
  const totalSujets = sujets.length;
  const activeSujets = sujets.filter((s) => s.isActive).length;
  const totalRevenue = sujets.reduce((sum, s) => sum + (s.prix || 0), 0);
  const totalCriteres = sujets.reduce(
    (sum, s) => sum + (s.criteres?.length || 0),
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
                icon="material-symbols:lightbulb"
                className="text-4xl text-primary"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                Gestion des sujets de recherche
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
          {/* Card 1: Total Sujets */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:lightbulb"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Total Sujets
              </p>
              <p className="text-4xl font-bold text-white">{totalSujets}</p>
              <p className="mt-2 text-xs text-white/70">
                Sujets de recherche proposés
              </p>
            </div>
          </div>

          {/* Card 2: Active Sujets */}
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
                Sujets actifs
              </p>
              <p className="text-4xl font-bold text-white">{activeSujets}</p>
              <p className="mt-2 text-xs text-white/70">
                Sujets disponibles pour soumission
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
                Frais de traitement des recherches
              </p>
            </div>
          </div>

          {/* Card 4: Total Criteres */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:checklist"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Critères d'évaluation
              </p>
              <p className="text-4xl font-bold text-white">{totalCriteres}</p>
              <p className="mt-2 text-xs text-white/70">
                Critères dans tous les sujets
              </p>
            </div>
          </div>
        </div>

        {/* Sujet DataTable */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
          <SujetDataTable
            sujets={sujets}
            anneeId={selectedAnnee._id}
            promotionId={selectedPromotion.id}
            onRefresh={loadSujets}
          />
        </div>
      </div>
    </div>
  );
}
