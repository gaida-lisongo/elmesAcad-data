"use client";

import { use, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import ElementDataTable from "@/app/components/ElementDataTable";
import {
  fetchUniteById,
  fetchElementsByUniteId,
} from "@/app/actions/unite-element.actions";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import toast from "react-hot-toast";
import Loader from "@/app/components/Common/Loader";

interface Element {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  objectifs: string[];
  place_ec: string;
  uniteId: string;
  anneeId: string;
  titulaireId?: string;
}

interface Unite {
  _id: string;
  code: string;
  designation: string;
  description: string[];
  competences: string[];
  credit: number;
}

export default function UnitePage({
  params,
}: {
  params: Promise<{ unite: string }>;
}) {
  const unwrappedParams = use(params);
  const uniteId = unwrappedParams.unite;
  const { selectedAnnee } = useAcademicContext();
  const [unite, setUnite] = useState<Unite | null>(null);
  const [elements, setElements] = useState<Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    semestre: string;
    programme: string;
    section: string;
  } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch unite details
      const uniteResult = await fetchUniteById(uniteId);
      if (!uniteResult.success || !uniteResult.data) {
        toast.error(uniteResult.error || "Unité non trouvée");
        return;
      }

      setUnite(uniteResult.data.unite);
      setMetadata({
        semestre: uniteResult.data.semestre,
        programme: uniteResult.data.programme,
        section: uniteResult.data.section,
      });

      // Fetch elements
      const elementsResult = await fetchElementsByUniteId(uniteId);
      if (!elementsResult.success || !elementsResult.data) {
        toast.error(elementsResult.error || "Erreur lors du chargement");
        return;
      }

      setElements(elementsResult.data);
    } catch (error) {
      console.error(error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uniteId]);

  if (loading) {
    return <Loader />;
  }

  if (!selectedAnnee) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icon
            icon="material-symbols:error-outline"
            className="mx-auto mb-4 text-6xl text-red-500"
          />
          <h2 className="text-2xl font-semibold dark:text-white">
            Aucune année académique sélectionnée
          </h2>
          <p className="mt-2 text-bodydark">
            Veuillez sélectionner une année académique dans la barre latérale
          </p>
        </div>
      </div>
    );
  }

  if (!unite) {
    return (
      <div className="flex h-screen items-center justify-center">
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

  const totalCreditsEC = elements.reduce(
    (sum, el) => sum + (Number(el.credit) || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-2 p-6 dark:bg-boxdark-2">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-bodydark">
          {metadata?.section} / {metadata?.programme} / {metadata?.semestre} /{" "}
          <span className="font-semibold text-black dark:text-white">
            {unite.code} - {unite.designation}
          </span>
        </div>

        {/* Header */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              {unite.code} - {unite.designation}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {Number(unite.credit) || 0} Crédits
              </span>
            </div>
          </div>

          {unite.description && unite.description.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                Description
              </h3>
              <ul className="list-inside list-disc space-y-1 text-bodydark">
                {unite.description.map((desc, idx) => (
                  <li key={idx}>{desc}</li>
                ))}
              </ul>
            </div>
          )}

          {unite.competences && unite.competences.length > 0 && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                Compétences
              </h3>
              <ul className="list-inside list-disc space-y-1 text-bodydark">
                {unite.competences.map((comp, idx) => (
                  <li key={idx}>{comp}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Metrics Cards - E-commerce Style */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Crédits UE */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:credit-card-outline"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Crédits UE
              </p>
              <p className="text-4xl font-bold text-white">
                {Number(unite.credit) || 0}
              </p>
              <p className="mt-2 text-xs text-white/70">
                Crédits de l'unité d'enseignement
              </p>
            </div>
          </div>

          {/* Card 2: Total Éléments */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:book-outline"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Total Éléments
              </p>
              <p className="text-4xl font-bold text-white">{elements.length}</p>
              <p className="mt-2 text-xs text-white/70">
                Éléments constitutifs créés
              </p>
            </div>
          </div>

          {/* Card 3: Total Crédits EC */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg transition-all hover:scale-105 hover:shadow-xl">
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                <Icon
                  icon="material-symbols:credit-score"
                  className="text-3xl text-white"
                />
              </div>
              <p className="mb-1 text-sm font-medium text-white/80">
                Total Crédits EC
              </p>
              <p className="text-4xl font-bold text-white">
                {totalCreditsEC.toFixed(totalCreditsEC % 1 === 0 ? 0 : 1)}
              </p>
              <p className="mt-2 text-xs text-white/70">
                Somme des crédits des éléments
              </p>
            </div>
          </div>
        </div>

        {/* Elements DataTable */}
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
          <ElementDataTable
            elements={elements}
            uniteId={uniteId}
            anneeId={selectedAnnee._id}
            onRefresh={loadData}
          />
        </div>
      </div>
    </div>
  );
}
