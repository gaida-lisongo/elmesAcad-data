"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const elementId = params.id as string;
  const [activities, setActivities] = useState<any[]>([]);

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
            Activités
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Élément ID: {elementId}
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-6">
          {/* Add Activity Card */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Ajouter une Activité</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre de l'activité
                </label>
                <input
                  type="text"
                  placeholder="Ex: Travaux dirigés, Travaux pratiques..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Décrivez l'activité..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Ajouter l'activité
                </button>
              </div>
            </form>
          </div>

          {/* Activities List */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Liste des Activités</h2>
            {activities.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                Aucune activité ajoutée pour le moment.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 dark:border-slate-700 rounded-md"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {activity.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Link
              href={`/charge-horaire/${elementId}?tab=activities`}
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
