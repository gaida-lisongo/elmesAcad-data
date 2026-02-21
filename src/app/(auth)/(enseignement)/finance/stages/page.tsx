"use client";

import { useEffect, useState, useCallback } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";
import CommandeTable from "@/app/components/CommandeTable";
import { fetchStages } from "@/app/actions/stage.actions";
import { fetchCommandesMetrics } from "@/app/actions/commande.actions";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";

/* ─────────────────────────────────────── */
/*  Metrics Card                           */
/* ─────────────────────────────────────── */
function MetricCard({
  label,
  value,
  sub,
  icon,
  from,
  to,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-6 shadow-lg`}
    >
      <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rounded-full bg-white/10" />
      <div className="relative">
        <div className="mb-3 inline-flex rounded-xl bg-white/20 p-3">
          <Icon icon={icon} className="text-3xl text-white" />
        </div>
        <p className="text-sm font-medium text-white/80">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="mt-1 text-xs text-white/70">{sub}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Product Card (Stage)                   */
/* ─────────────────────────────────────── */
function StageCard({
  stage,
  selected,
  onClick,
}: {
  stage: any;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
        selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-stroke bg-white hover:border-primary/50 dark:border-strokedark dark:bg-boxdark"
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-semibold leading-snug text-black dark:text-white">
          {stage.designation}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            stage.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-boxdark-2"
          }`}
        >
          {stage.isActive ? "Actif" : "Inactif"}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bodydark">
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:business" width={14} />
          {stage.entreprises?.length ?? 0} entreprise
          {stage.entreprises?.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:payments" width={14} />
          {stage.prix?.toLocaleString()} $
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:calendar-today" width={14} />
          {new Date(stage.date_debut).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}{" "}
          →{" "}
          {new Date(stage.date_fin).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}
        </span>
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
          <Icon icon="material-symbols:arrow-drop-down-circle" width={14} />
          Commandes affichées ci-dessous
        </div>
      )}
    </button>
  );
}

/* ─────────────────────────────────────── */
/*  Page                                   */
/* ─────────────────────────────────────── */
export default function FinanceStagesPage() {
  const { selectedAnnee, selectedPromotion } = useAcademicContext();

  const [stages, setStages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    caReel: 0,
    caEnAttente: 0,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!selectedAnnee || !selectedPromotion) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [stageResult, metricsResult] = await Promise.all([
      fetchStages(selectedAnnee._id, selectedPromotion.id),
      fetchCommandesMetrics("stage", selectedAnnee._id, selectedPromotion.id),
    ]);

    if (stageResult.success && stageResult.data) setStages(stageResult.data);
    else toast.error(stageResult.error || "Erreur chargement stages");

    if (metricsResult.success && metricsResult.data)
      setMetrics(metricsResult.data);

    setLoading(false);
  }, [selectedAnnee, selectedPromotion]);

  useEffect(() => {
    setSelectedId(null);
    loadData();
  }, [loadData]);

  if (!selectedAnnee || !selectedPromotion) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="text-center">
          <Icon
            icon="material-symbols:work-outline"
            width={64}
            height={64}
            className="mx-auto mb-4 text-gray-300"
          />
          <h3 className="mb-2 text-xl font-semibold text-gray-700">
            Sélectionnez une promotion
          </h3>
          <p className="text-gray-500">
            Choisissez une année et une promotion dans le menu de gauche
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  const selectedStage = stages.find((s) => s._id === selectedId);

  return (
    <div className="min-h-screen bg-gray-2 p-6 dark:bg-boxdark-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Icon
                icon="material-symbols:work-outline"
                className="text-3xl text-primary"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                Finance — Stages
              </h1>
              <p className="text-sm text-bodydark">
                {selectedPromotion.name} ·{" "}
                {new Date(selectedAnnee.debut).getFullYear()} –{" "}
                {new Date(selectedAnnee.fin).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            label="CA Réel (encaissé)"
            value={`${metrics.caReel.toLocaleString()} $`}
            sub="Commandes avec statut OK"
            icon="material-symbols:check-circle"
            from="from-green-500"
            to="to-green-600"
          />
          <MetricCard
            label="CA En Attente"
            value={`${metrics.caEnAttente.toLocaleString()} $`}
            sub="Commandes en cours"
            icon="material-symbols:hourglass-empty"
            from="from-yellow-500"
            to="to-orange-500"
          />
          <MetricCard
            label="Total Commandes"
            value={String(metrics.total)}
            sub="Toutes périodes confondues"
            icon="material-symbols:shopping-cart"
            from="from-primary"
            to="to-primary/80"
          />
        </div>

        {/* Products list */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-black dark:text-white">
              Stages ({stages.length})
            </h2>
            <p className="text-sm text-bodydark">
              Cliquez sur un stage pour voir ses commandes
            </p>
          </div>

          {stages.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-bodydark">
              <Icon
                icon="material-symbols:work-outline"
                width={48}
                className="mb-2 opacity-30"
              />
              <p className="text-sm">Aucun stage pour cette promotion</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stages.map((stage) => (
                <StageCard
                  key={stage._id}
                  stage={stage}
                  selected={selectedId === stage._id}
                  onClick={() =>
                    setSelectedId((prev) =>
                      prev === stage._id ? null : stage._id,
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Commande table (conditional render) */}
        {selectedId && selectedStage && (
          <CommandeTable
            type="stage"
            produitId={selectedId}
            prix={selectedStage.prix}
            designation={selectedStage.designation}
            onStatusChanged={loadData}
          />
        )}
      </div>
    </div>
  );
}
