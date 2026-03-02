"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import {
  fetchQCMActivities,
  fetchQuestionnaireActivities,
  deleteQCMActivity,
  deleteQuestionnaireActivity,
} from "@/app/actions/cours.actions";

interface Activity {
  _id: string;
  designation: string;
  description: string[];
  type: "qcm" | "questionnaire";
  maxPts?: number;
  amount?: number;
  currency?: string;
  createdAt: string;
}

interface ActivitesManagerProps {
  elementId: string;
  titulaireId: string;
  promotionId: string;
  anneeId: string;
  onCreateNew: (type: "qcm" | "questionnaire") => void;
}

export interface ActivitesManagerRef {
  refresh: () => Promise<void>;
}

export const ActivitesManager = forwardRef<
  ActivitesManagerRef,
  ActivitesManagerProps
>(({ elementId, titulaireId, promotionId, anneeId, onCreateNew }, ref) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "qcm" | "questionnaire">("all");

  const loadActivities = async () => {
    setLoading(true);
    const [qcmResult, questResult] = await Promise.all([
      fetchQCMActivities(elementId),
      fetchQuestionnaireActivities(elementId),
    ]);

    const allActivities = [
      ...(qcmResult.data || []).map((a: any) => ({
        ...a,
        type: "qcm" as const,
      })),
      ...(questResult.data || []).map((a: any) => ({
        ...a,
        type: "questionnaire" as const,
      })),
    ];

    setActivities(
      allActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
    setLoading(false);
  };

  // Expose refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: loadActivities,
  }));

  useEffect(() => {
    loadActivities();
  }, [elementId]);

  const handleDelete = async (id: string, type: "qcm" | "questionnaire") => {
    if (!confirm("Supprimer cette activité ?")) return;

    const result =
      type === "qcm"
        ? await deleteQCMActivity(id)
        : await deleteQuestionnaireActivity(id);

    if (result.success) {
      await loadActivities();
    }
  };

  const filteredActivities = activities.filter(
    (a) => filter === "all" || a.type === filter,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Activités Pédagogiques
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => onCreateNew("qcm")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + QCM
          </button>
          <button
            onClick={() => onCreateNew("questionnaire")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Questionnaire
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "qcm", "questionnaire"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {f === "all" ? "Tous" : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Activities List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity._id}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.type === "qcm"
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {activity.type.toUpperCase()}
                    </span>
                    {activity.maxPts && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.maxPts} pts
                      </span>
                    )}
                    {activity.amount && (
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {activity.amount} {activity.currency}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {activity.designation}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {activity.description.map((desc, idx) => (
                      <p key={idx}>{desc}</p>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
                    Créé le{" "}
                    {new Date(activity.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/${activity.type}/${activity._id}`}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Voir détails
                  </Link>
                  <button
                    onClick={() => handleDelete(activity._id, activity.type)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredActivities.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune activité trouvée
        </div>
      )}
    </div>
  );
});

ActivitesManager.displayName = "ActivitesManager";
