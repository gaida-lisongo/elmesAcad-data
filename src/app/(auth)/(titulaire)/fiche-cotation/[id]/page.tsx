"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function FicheCotationPage() {
  const params = useParams();
  const router = useRouter();
  const elementId = params.id as string;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-primary hover:underline"
          >
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fiche Cotation
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Élément ID: {elementId}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">
            Détails de la Fiche Cotation
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Élément ID
              </label>
              <p className="text-gray-900 dark:text-white">{elementId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Critères d'évaluation
              </label>
              <p className="text-gray-600 dark:text-gray-400">
                Cette section permettra de définir les critères de cotation pour
                cet élément.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Barème
              </label>
              <p className="text-gray-600 dark:text-gray-400">
                Cette section permettra de définir le barème de cotation.
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              href={`/charge-horaire/${elementId}?tab=fiche-cotation`}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Retour au Tableau de Bord
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
