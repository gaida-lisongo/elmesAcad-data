"use client";

import { use, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  fetchProduitById,
  type ProduitType,
} from "@/app/actions/produit.actions";
import ProductSection from "@/app/components/CommandeManager/ProductSection";
import CommandeManager from "@/app/components/CommandeManager";

/* ── types ─────────────────────────────────────────────── */
interface PageData {
  produit: any;
  annee: { _id: string; debut: string; fin: string } | null;
  promotionName: string;
  sectionName: string;
  filiereName: string;
}

const TYPE_LABEL: Record<
  ProduitType,
  { label: string; icon: string; color: string }
> = {
  enrollement: {
    label: "Session d'inscription",
    icon: "material-symbols:edit-document-outline",
    color: "bg-gradient-to-br from-violet-500 to-violet-600",
  },
  stage: {
    label: "Stage académique",
    icon: "material-symbols:business-outline",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
  },
  sujet: {
    label: "Sujet de mémoire",
    icon: "solar:document-text-outline",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
};

/* ── helpers ───────────────────────────────────────────── */
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function anneeLabel(annee: { debut: string; fin: string } | null) {
  if (!annee) return "—";
  return `${formatDate(annee.debut)} — ${formatDate(annee.fin)}`;
}

/* ── StatCard (reused pattern) ─────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  gradient,
  isLong = false,
}: {
  icon: string;
  label: string;
  value: string | number;
  gradient: string;
  isLong?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${gradient} p-4 shadow-md sm:p-5`}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-white/10" />
      <div className="relative">
        <div className="mb-3 inline-flex rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">
          <Icon icon={icon} className="text-2xl text-white" />
        </div>
        <p className="mb-0.5 text-xs font-medium text-white/80">{label}</p>
        <p
          className={`font-bold text-white ${isLong ? "line-clamp-2 text-sm sm:text-base" : "text-2xl sm:text-3xl"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function ProduitPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = use(params);

  /* ── parse slug: e.g. "enrollement-64abc123" ── */
  const lastDash = rawType.lastIndexOf("-");
  const produitType = rawType.slice(0, lastDash) as ProduitType;
  const produitId = rawType.slice(lastDash + 1);
  const validTypes: ProduitType[] = ["enrollement", "stage", "sujet"];

  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!validTypes.includes(produitType) || produitId.length !== 24) {
      setLoading(false);
      return;
    }
    fetchProduitById(produitType, produitId).then((res) => {
      if (res.success && res.data) setData(res.data);
      else toast.error(res.error ?? "Produit non trouvé");
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawType]);

  /* ── loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-bodydark">Chargement du produit…</p>
        </div>
      </div>
    );
  }

  if (!data || !validTypes.includes(produitType)) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Icon
            icon="material-symbols:error-outline"
            className="mx-auto mb-4 text-6xl text-red-500"
          />
          <h2 className="text-2xl font-semibold">Produit non trouvé</h2>
        </div>
      </div>
    );
  }

  const { produit, annee, promotionName, sectionName } = data;
  const cfg = TYPE_LABEL[produitType];
  const debut = produit.debut ?? produit.date_debut;
  const fin = produit.fin ?? produit.date_fin;

  return (
    <div className="min-h-screen pt-10">
      {/* ── Academic year banner ── */}
      {annee && (
        <div className="border-b border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <Icon
              icon="material-symbols:calendar-month-outline"
              className="shrink-0 text-xl text-primary"
            />
            <span className="text-sm font-medium text-black">
              Année académique active :
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
              {formatDate(annee.debut)} — {formatDate(annee.fin)}
            </span>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ═══ LEFT: content ═══ */}
          <div className="flex min-w-0 w-full flex-col gap-6 lg:w-1/2">
            {/* Designation + hint */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-boxdark">
              <div className="mb-3 flex items-center gap-2">
                <div className={`inline-flex rounded-lg p-2 ${cfg.color}`}>
                  <Icon icon={cfg.icon} className="text-xl text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wide text-bodydark">
                  {cfg.label}
                </span>
              </div>
              <h1 className="break-words text-xl font-extrabold leading-tight text-black sm:text-2xl">
                {produit.designation}
              </h1>
              {sectionName && (
                <p className="mt-1 text-sm text-bodydark">
                  {sectionName} · {promotionName}
                </p>
              )}
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 p-3">
                <Icon
                  icon="material-symbols:info-outline"
                  className="mt-0.5 shrink-0 text-lg text-primary"
                />
                <p className="text-xs text-primary/80">
                  Remplissez le formulaire de commande ci-contre pour souscrire
                  à ce produit académique.
                </p>
              </div>
            </div>

            {/* Description */}
            {produit.description && produit.description.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-boxdark">
                <div className="mb-4 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:description-outline"
                    className="text-2xl text-primary"
                  />
                  <h2 className="text-lg font-bold text-black">Description</h2>
                </div>
                <ul className="space-y-2">
                  {produit.description.map((d: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-bodydark"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product-specific section */}
            <ProductSection type={produitType} produit={produit} />
          </div>

          {/* ═══ RIGHT: cards + form ═══ */}
          <div className="flex min-w-0 w-full flex-col gap-6 lg:w-1/2">
            {/* Mini cards: Promotion + Type */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-stroke bg-white p-3 shadow-sm sm:p-4 dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center gap-1.5">
                  <Icon
                    icon="material-symbols:school-outline"
                    className="shrink-0 text-lg text-primary"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-bodydark">
                    Promotion
                  </span>
                </div>
                <p className="line-clamp-3 text-xs font-bold text-black sm:text-sm">
                  {promotionName}
                </p>
              </div>
              <div className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-stroke bg-white p-3 shadow-sm sm:p-4 dark:border-strokedark dark:bg-boxdark">
                <div className="flex items-center gap-1.5">
                  <Icon
                    icon={cfg.icon}
                    className="shrink-0 text-lg text-primary"
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-bodydark">
                    Type
                  </span>
                </div>
                <p className="line-clamp-3 text-xs font-bold text-black sm:text-sm">
                  {cfg.label}
                </p>
              </div>
            </div>

            {/* 2×2 stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatCard
                icon="material-symbols:payments-outline"
                label="Montant"
                value={`${Number(produit.prix).toLocaleString("fr-FR")} FC`}
                gradient="bg-gradient-to-br from-primary to-primary/80"
                isLong
              />
              <StatCard
                icon={
                  produit.isActive
                    ? "material-symbols:check-circle-outline"
                    : "material-symbols:cancel-outline"
                }
                label="Statut"
                value={produit.isActive ? "Actif" : "Inactif"}
                gradient={
                  produit.isActive
                    ? "bg-gradient-to-br from-green-500 to-green-600"
                    : "bg-gradient-to-br from-slate-400 to-slate-500"
                }
              />
              <StatCard
                icon="material-symbols:event-outline"
                label="Début"
                value={debut ? formatDate(debut) : "—"}
                gradient="bg-gradient-to-br from-violet-500 to-violet-600"
                isLong
              />
              <StatCard
                icon="material-symbols:event-busy-outline"
                label="Fin"
                value={fin ? formatDate(fin) : "—"}
                gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                isLong
              />
            </div>

            {/* Commande form */}
            <CommandeManager
              type={produitType}
              produit={produit}
              promotionName={promotionName}
              anneeLabel={anneeLabel(annee)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
