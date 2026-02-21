"use client";

import { use, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  fetchUniteById,
  fetchElementsByUniteId,
} from "@/app/actions/unite-element.actions";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import ElementCard, { ElementCardData } from "@/app/components/ElementCard";
import ElementDetailModal from "@/app/components/ElementDataTable/ElementDetailModal";
import toast from "react-hot-toast";

/* ───────────────────────── types ───────────────────────── */
interface Unite {
  _id: string;
  code: string;
  designation: string;
  description: string[];
  competences: string[];
  credit: number;
}

interface Metadata {
  semestre: string;
  programme: string;
  section: string;
  filiere: string;
}

interface Annee {
  _id: string;
  debut: string;
  fin: string;
  isActive: boolean;
}

/* ───────────────────────── helpers ─────────────────────── */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ceilHalf(n: number): number {
  return Math.ceil(n);
}

function floorHalf(n: number): number {
  return Math.floor(n);
}

/* ───────────────────────── sub-components ──────────────── */
function StatCard({
  icon,
  label,
  value,
  sub,
  gradient,
  isLong = false,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
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
          className={`font-bold text-white ${isLong ? "line-clamp-2 text-base sm:text-lg" : "text-3xl"}`}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-white/70">{sub}</p>}
      </div>
    </div>
  );
}

type DistColor = "primary" | "green" | "blue";

const distColorMap: Record<DistColor, { text: string; bar: string }> = {
  primary: { text: "text-primary", bar: "bg-primary" },
  green: { text: "text-green-500", bar: "bg-green-500" },
  blue: { text: "text-blue-500", bar: "bg-blue-500" },
};

interface DistributionBarProps {
  designation: string;
  value: number;
  total: number;
  colorKey: DistColor;
  icon: string;
}

function DistributionBar({
  designation,
  value,
  total,
  colorKey,
  icon,
}: DistributionBarProps) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const { text, bar } = distColorMap[colorKey];
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon icon={icon} className={`text-lg ${text}`} />
          <span className="text-sm font-medium text-black dark:text-white">
            {designation}
          </span>
        </div>
        <span className="text-sm font-bold text-black dark:text-white">
          {value}h
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-stroke dark:bg-strokedark">
        <div
          className={`h-full rounded-full transition-all duration-700 ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════ Page ═════════════════════════════ */
export default function UniteDetailPage({
  params,
}: {
  params: Promise<{ uniteId: string }>;
}) {
  const { uniteId } = use(params);

  const [unite, setUnite] = useState<Unite | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [elements, setElements] = useState<ElementCardData[]>([]);
  const [annee, setAnnee] = useState<Annee | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedElement, setSelectedElement] =
    useState<ElementCardData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  /* ── data loading ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [uniteRes, elementsRes, anneeRes] = await Promise.all([
        fetchUniteById(uniteId),
        fetchElementsByUniteId(uniteId),
        fetchAnneeActive(),
      ]);

      if (!uniteRes.success || !uniteRes.data) {
        toast.error(uniteRes.error || "Unité non trouvée");
        return;
      }

      setUnite(uniteRes.data.unite);
      setMetadata({
        semestre: uniteRes.data.semestre,
        programme: uniteRes.data.programme,
        section: uniteRes.data.section,
        filiere: uniteRes.data.filiere,
      });

      if (elementsRes.success && elementsRes.data) {
        setElements(elementsRes.data);
      }

      if (anneeRes.success && anneeRes.data) {
        setAnnee(anneeRes.data);
      }
    } catch {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniteId]);

  /* ── derived values ── */
  const credit = Number(unite?.credit ?? 0);
  const totalHeure = 25 * credit;
  const totalPresentiel = (totalHeure * 2) / 3;
  const totalRecherche = totalHeure / 3;

  const distribution = [
    {
      id: 1,
      designation: "Cours Magistral Interactif",
      value: Math.round(totalPresentiel * 0.5),
      icon: "material-symbols:school-outline",
      colorKey: "primary" as DistColor,
    },
    {
      id: 2,
      designation: "Travail Pratique",
      value: ceilHalf(totalPresentiel * 0.25),
      icon: "material-symbols:science-outline",
      colorKey: "green" as DistColor,
    },
    {
      id: 3,
      designation: "Travail Dirigé",
      value: floorHalf(totalPresentiel * 0.25),
      icon: "material-symbols:edit-document-outline",
      colorKey: "blue" as DistColor,
    },
  ];

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-bodydark">Chargement de l'unité…</p>
        </div>
      </div>
    );
  }

  if (!unite) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <Icon
            icon="material-symbols:error-outline"
            className="mx-auto mb-4 text-6xl text-red-500"
          />
          <h2 className="text-2xl font-semibold dark:text-white">
            Unité non trouvée
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Academic year banner ── */}
      {annee && (
        <div className="border-b border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
            <Icon
              icon="material-symbols:calendar-month-outline"
              className="shrink-0 text-xl text-primary"
            />
            <span className="text-sm font-medium text-black dark:text-white">
              Année académique active :
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
              {formatDate(annee.debut)} — {formatDate(annee.fin)}
            </span>
          </div>
        </div>
      )}

      {/* ── Page body ── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          {/* ════════════════ LEFT COLUMN (50%) ════════════════ */}
          <div className="flex min-w-0 w-full flex-col gap-6 lg:w-1/2">
            {/* Code + Designation */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-boxdark">
              <span className="mb-2 inline-block break-all rounded-lg bg-primary/10 px-3 py-1 font-mono text-sm font-bold text-primary">
                {unite.code}
              </span>
              <h1 className="mt-2 break-words text-xl font-extrabold leading-tight text-black sm:text-3xl dark:text-white">
                {unite.designation}
              </h1>
              {metadata && (
                <p className="mt-2 text-sm text-bodydark">
                  {metadata.section} · {metadata.programme}
                </p>
              )}
            </div>

            {/* Description */}
            {unite.description && unite.description.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark">
                <div className="mb-4 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:description-outline"
                    className="text-2xl text-primary"
                  />
                  <h2 className="text-lg font-bold text-black dark:text-white">
                    Description
                  </h2>
                </div>
                <ul className="space-y-2">
                  {unite.description.map((desc, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-bodydark"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="text-sm leading-relaxed">{desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Éléments constitutifs */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark">
              <div className="mb-5 flex items-center gap-2">
                <Icon
                  icon="material-symbols:book-outline"
                  className="text-2xl text-primary"
                />
                <h2 className="text-lg font-bold text-black dark:text-white">
                  Éléments Constitutifs
                </h2>
                <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {elements.length}
                </span>
              </div>

              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stroke py-12 text-center dark:border-strokedark">
                  <Icon
                    icon="material-symbols:book-outline"
                    className="mb-3 text-4xl text-bodydark"
                  />
                  <p className="font-medium text-black dark:text-white">
                    Aucun élément constitutif
                  </p>
                  <p className="mt-1 text-sm text-bodydark">
                    Les éléments apparaîtront ici une fois créés
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {elements.map((el) => (
                    <ElementCard
                      key={el._id}
                      element={el}
                      onView={(e) => {
                        setSelectedElement(e);
                        setDetailOpen(true);
                      }}
                      showActions={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ════════════════ RIGHT COLUMN (50%) ════════════════ */}
          <div className="flex min-w-0 w-full flex-col gap-6 lg:w-1/2">
            {/* Small info cards: Programme + Semestre */}
            {metadata && (
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
                  <p className="line-clamp-3 text-xs font-bold text-black sm:text-sm dark:text-white">
                    {metadata.programme}
                  </p>
                </div>
                <div className="flex min-w-0 flex-col items-start gap-2 rounded-2xl border border-stroke bg-white p-3 shadow-sm sm:p-4 dark:border-strokedark dark:bg-boxdark">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="material-symbols:calendar-today-outline"
                      className="shrink-0 text-lg text-blue-500"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-bodydark">
                      Semestre
                    </span>
                  </div>
                  <p className="line-clamp-3 text-xs font-bold text-black sm:text-sm dark:text-white">
                    {metadata.semestre}
                  </p>
                </div>
              </div>
            )}

            {/* 2x2 stat grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                icon="material-symbols:credit-card-outline"
                label="Crédits UE"
                value={credit}
                sub="Crédits de l'unité"
                gradient="bg-gradient-to-br from-primary to-primary/80"
              />
              <StatCard
                icon="material-symbols:book-outline"
                label="Éléments"
                value={elements.length}
                sub="Éléments constitutifs"
                gradient="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                icon="material-symbols:stars-outline"
                label="Points à capitaliser"
                value={20 * credit}
                sub={`20 × ${credit} crédits`}
                gradient="bg-gradient-to-br from-violet-500 to-violet-600"
              />
              <StatCard
                icon="material-symbols:account-tree-outline"
                label="Filière"
                value={metadata?.filiere ?? "—"}
                sub="Appartenance"
                gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                isLong
              />
            </div>

            {/* Distribution des heures */}
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark">
              <div className="mb-5 flex items-center gap-2">
                <Icon
                  icon="material-symbols:schedule-outline"
                  className="text-2xl text-primary"
                />
                <h2 className="text-lg font-bold text-black dark:text-white">
                  Répartition des heures
                </h2>
              </div>

              {/* Summary row */}
              <div className="mb-5 grid grid-cols-3 divide-x divide-stroke dark:divide-strokedark">
                <div className="pr-4 text-center">
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {Math.round(totalHeure)}h
                  </p>
                  <p className="mt-0.5 text-xs text-bodydark">Total</p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-2xl font-bold text-green-500">
                    {Math.round(totalPresentiel)}h
                  </p>
                  <p className="mt-0.5 text-xs text-bodydark">Présentiel</p>
                </div>
                <div className="pl-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">
                    {Math.round(totalRecherche)}h
                  </p>
                  <p className="mt-0.5 text-xs text-bodydark">Personnel</p>
                </div>
              </div>

              {/* Progress bars for présentiel breakdown */}
              <div className="mb-3">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-bodydark">
                  Distribution présentiel ({Math.round(totalPresentiel)}h)
                </p>
                {distribution.map((item) => (
                  <DistributionBar
                    key={item.id}
                    designation={item.designation}
                    value={item.value}
                    total={Math.round(totalPresentiel)}
                    colorKey={item.colorKey}
                    icon={item.icon}
                  />
                ))}
              </div>
            </div>

            {/* Compétences */}
            {unite.competences && unite.competences.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-boxdark">
                <div className="mb-4 flex items-center gap-2">
                  <Icon
                    icon="material-symbols:verified-outline"
                    className="text-2xl text-primary"
                  />
                  <h2 className="text-lg font-bold text-black dark:text-white">
                    Compétences
                  </h2>
                </div>
                <ul className="space-y-3">
                  {unite.competences.map((comp, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-xl bg-gray-2 p-3 dark:bg-boxdark-2"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {i + 1}
                      </div>
                      <span className="text-sm leading-relaxed text-black dark:text-white">
                        {comp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ElementDetailModal */}
      <ElementDetailModal
        isOpen={detailOpen}
        element={selectedElement}
        onClose={() => {
          setDetailOpen(false);
          setSelectedElement(null);
        }}
        onSuccess={loadData}
      />
    </div>
  );
}
