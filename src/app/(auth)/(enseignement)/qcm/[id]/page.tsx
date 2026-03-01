"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchSubscribers } from "@/app/actions/cours.actions";

interface Subscriber {
  _id: string;
  userId: { _id: string; nom: string; prenom: string; matricule: string };
  subscribedAt: string;
  isActive: boolean;
}

export default function QCMDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSubscribers();
  }, [id]);

  const loadSubscribers = async () => {
    setLoading(true);
    const result = await fetchSubscribers(id, "qcm");
    if (result.success) {
      setSubscribers(result.data || []);
    }
    setLoading(false);
  };

  const filteredSubscribers = subscribers.filter(
    (s) =>
      s.userId.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userId.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.userId.matricule.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/charge-horaire"
          className="text-sm text-primary hover:underline mb-4 inline-block"
        >
          ← Retour aux cours
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Détails du QCM
        </h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un étudiant..."
          className="w-full max-w-md px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Inscrits
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {subscribers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
          <p className="text-3xl font-bold text-green-600">
            {subscribers.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Inactifs</p>
          <p className="text-3xl font-bold text-red-600">
            {subscribers.filter((s) => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSubscribers.map((sub) => (
            <div
              key={sub._id}
              className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {sub.userId.nom} {sub.userId.prenom}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Matricule: {sub.userId.matricule}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Inscrit le:{" "}
                  {new Date(sub.subscribedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sub.isActive
                      ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  }`}
                >
                  {sub.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredSubscribers.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun inscrit trouvé
        </div>
      )}
    </div>
  );
}
