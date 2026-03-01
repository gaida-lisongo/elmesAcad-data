"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function RessourcesPage() {
  const params = useParams();
  const router = useRouter();
  const elementId = params.id as string;
  const [resources, setResources] = useState<any[]>([]);

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
            Ressources
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Élément ID: {elementId}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Upload Resource Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Ajouter une Ressource</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre de la ressource
                </label>
                <input
                  type="text"
                  placeholder="Ex: Support de cours, Livre de référence..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de ressource
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                  <option>Sélectionner un type</option>
                  <option>Cours</option>
                  <option>Exercice</option>
                  <option>Référence</option>
                  <option>Lien externe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL ou description
                </label>
                <textarea
                  placeholder="Collez l'URL ou décrivez la ressource..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Ajouter la ressource
                </button>
              </div>
            </form>
          </div>

          {/* Resources List */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Liste des Ressources</h2>
            {resources.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Aucune ressource ajoutée pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {resources.map((resource, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-slate-700 rounded-md flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Type: {resource.type}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {resource.description}
                      </p>
                    </div>
                    <button className="text-red-500 hover:text-red-700">
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Link
              href={`/charge-horaire/${elementId}?tab=ressources`}
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
