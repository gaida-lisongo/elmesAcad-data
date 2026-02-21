"use client";

import { useEffect, useState, useCallback } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";
import CommandeTable from "@/app/components/CommandeTable";
import { fetchEnrollements } from "@/app/actions/enrollement.actions";
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
/*  Product Card (Enrollement)             */
/* ─────────────────────────────────────── */
function EnrollementCard({
  enr,
  selected,
  onClick,
}: {
  enr: any;
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
          {enr.designation}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            enr.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-boxdark-2"
          }`}
        >
          {enr.isActive ? "Actif" : "Inactif"}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bodydark">
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:book-outline" width={14} />
          {enr.matieres?.length ?? 0} matière
          {enr.matieres?.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:payments" width={14} />
          {enr.prix?.toLocaleString()} $
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:calendar-today" width={14} />
          {new Date(enr.debut).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          })}{" "}
          →{" "}
          {new Date(enr.fin).toLocaleDateString("fr-FR", {
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
export default function FinanceEnrollementsPage() {
  const { selectedAnnee, selectedPromotion } = useAcademicContext();

  const [enrollements, setEnrollements] = useState<any[]>([]);
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
    const [enrResult, metricsResult] = await Promise.all([
      fetchEnrollements(selectedAnnee._id, selectedPromotion.id),
      fetchCommandesMetrics(
        "enrollement",
        selectedAnnee._id,
        selectedPromotion.id,
      ),
    ]);

    if (enrResult.success && enrResult.data) setEnrollements(enrResult.data);
    else toast.error(enrResult.error || "Erreur chargement enrollements");

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
            icon="material-symbols:assignment-outline"
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

  const selectedEnr = enrollements.find((e) => e._id === selectedId);

  return (
    <div className="min-h-screen bg-gray-2 p-6 dark:bg-boxdark-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Icon
                icon="material-symbols:receipt-long"
                className="text-3xl text-primary"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">
                Finance — Enrollements
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
            sub="Toutes promotions confondues"
            icon="material-symbols:shopping-cart"
            from="from-primary"
            to="to-primary/80"
          />
        </div>

        {/* Products list */}
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-black dark:text-white">
              Enrollements ({enrollements.length})
            </h2>
            <p className="text-sm text-bodydark">
              Cliquez sur un enrollement pour voir ses commandes
            </p>
          </div>

          {enrollements.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-bodydark">
              <Icon
                icon="material-symbols:assignment-outline"
                width={48}
                className="mb-2 opacity-30"
              />
              <p className="text-sm">Aucun enrollement pour cette promotion</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {enrollements.map((enr) => (
                <EnrollementCard
                  key={enr._id}
                  enr={enr}
                  selected={selectedId === enr._id}
                  onClick={() =>
                    setSelectedId((prev) => (prev === enr._id ? null : enr._id))
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Commande table (conditional render) */}
        {selectedId && selectedEnr && (
          <CommandeTable
            type="enrollement"
            produitId={selectedId}
            prix={selectedEnr.prix}
            designation={selectedEnr.designation}
            onStatusChanged={loadData}
          />
        )}
      </div>
    </div>
  );
}
