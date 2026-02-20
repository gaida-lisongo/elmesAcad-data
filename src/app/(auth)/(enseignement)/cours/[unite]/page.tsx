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
                {unite.credit} Crédits
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

        {/* Metrics Banner */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon
                  icon="material-symbols:credit-card-outline"
                  className="text-2xl text-primary"
                />
              </div>
              <div>
                <p className="text-sm text-bodydark">Crédits UE</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {unite.credit}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Icon
                  icon="material-symbols:book-outline"
                  className="text-2xl text-green-500"
                />
              </div>
              <div>
                <p className="text-sm text-bodydark">Total Éléments</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {elements.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-boxdark">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Icon
                  icon="material-symbols:credit-score"
                  className="text-2xl text-blue-500"
                />
              </div>
              <div>
                <p className="text-sm text-bodydark">Total Crédits EC</p>
                <p className="text-2xl font-bold text-black dark:text-white">
                  {totalCreditsEC.toFixed(totalCreditsEC % 1 === 0 ? 0 : 1)}
                </p>
              </div>
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
