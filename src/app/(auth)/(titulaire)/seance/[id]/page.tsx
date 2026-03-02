"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchPresencesBySeance } from "@/app/actions/cours.actions";

interface Presence {
  _id: string;
  userId: { _id: string; nom: string; prenom: string; matricule: string };
  isPresent: boolean;
  markedAt: string;
}

export default function SeanceDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [presences, setPresences] = useState<Presence[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPresences();
  }, [id]);

  const loadPresences = async () => {
    setLoading(true);
    const result = await fetchPresencesBySeance(id);
    if (result.success) {
      setPresences(result.data || []);
    }
    setLoading(false);
  };

  const exportToExcel = () => {
    let csv = "N°,Nom,Prénom,Matricule,Présent,Date\n";
    presences.forEach((p, idx) => {
      csv += `${idx + 1},${p.userId.nom},${p.userId.prenom},${p.userId.matricule},${p.isPresent ? "Oui" : "Non"},${new Date(p.markedAt).toLocaleString("fr-FR")}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presence_seance_${id}.csv`;
    a.click();
  };

  const filteredPresences = presences.filter(
    (p) =>
      p.userId.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userId.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userId.matricule.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Feuille de Présence
          </h1>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📊 Exporter Excel
          </button>
        </div>
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
            Total Étudiants
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {presences.length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Présents</p>
          <p className="text-3xl font-bold text-green-600">
            {presences.filter((p) => p.isPresent).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Absents</p>
          <p className="text-3xl font-bold text-red-600">
            {presences.filter((p) => !p.isPresent).length}
          </p>
        </div>
      </div>

      {/* Presence List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Présence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Date/Heure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {filteredPresences.map((presence, idx) => (
                <tr key={presence._id}>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {presence.userId.nom}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {presence.userId.prenom}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {presence.userId.matricule}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        presence.isPresent
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {presence.isPresent ? "✓ Présent" : "✗ Absent"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(presence.markedAt).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredPresences.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune présence enregistrée
        </div>
      )}
    </div>
  );
}
