"use client";

import { useState, useEffect } from "react";
import {
  fetchRecoursByElement,
  updateRecoursStatus,
} from "@/app/actions/cours.actions";

interface Recours {
  _id: string;
  userId: { _id: string; nom: string; prenom: string; matricule: string };
  motif: string;
  description: string;
  preuve?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface RecoursManagerProps {
  elementId: string;
}

export const RecoursManager = ({ elementId }: RecoursManagerProps) => {
  const [recours, setRecours] = useState<Recours[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    loadRecours();
  }, [elementId]);

  const loadRecours = async () => {
    setLoading(true);
    const result = await fetchRecoursByElement(elementId);
    if (result.success) {
      setRecours(result.data || []);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    const result = await updateRecoursStatus(id, status);
    if (result.success) {
      await loadRecours();
    }
  };

  const filteredRecours = recours.filter(
    (r) => filter === "all" || r.status === filter,
  );

  const getStatusBadge = (status: string) => {
    const styles = {
      pending:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
      approved:
        "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      rejected: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    };
    const labels = {
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Demandes de Recours
        </h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg ${
              filter === f
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {f === "all"
              ? "Tous"
              : f === "pending"
                ? "En attente"
                : f === "approved"
                  ? "Approuvés"
                  : "Rejetés"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecours.map((rec) => (
            <div
              key={rec._id}
              className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {rec.userId.nom} {rec.userId.prenom}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Matricule: {rec.userId.matricule}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Soumis le{" "}
                    {new Date(rec.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {getStatusBadge(rec.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Motif:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {rec.motif}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {rec.description}
                  </p>
                </div>
                {rec.preuve && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Preuve:
                    </p>
                    <a
                      href={rec.preuve}
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      📄 Voir la preuve
                    </a>
                  </div>
                )}
              </div>

              {rec.status === "pending" && (
                <div className="flex gap-3 mt-4 pt-4 border-t dark:border-slate-700">
                  <button
                    onClick={() => handleStatusUpdate(rec._id, "approved")}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(rec._id, "rejected")}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    ✗ Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredRecours.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun recours trouvé
        </div>
      )}
    </div>
  );
};
