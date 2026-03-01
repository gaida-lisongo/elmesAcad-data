"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  createSeance,
  fetchSeances,
  deleteSeance,
  fetchPresencesBySeance,
} from "@/app/actions/cours.actions";

interface Seance {
  _id: string;
  designation: string;
  description: string[];
  coords?: { latitude: number; longitude: number };
  createdAt: string;
}

interface SeancesManagerProps {
  elementId: string;
  promotionId: string;
  anneeId: string;
}

export const SeancesManager = ({
  elementId,
  promotionId,
  anneeId,
}: SeancesManagerProps) => {
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState<string[]>([""]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    loadSeances();
  }, [elementId]);

  const loadSeances = async () => {
    setLoading(true);
    const result = await fetchSeances(elementId);
    if (result.success) {
      setSeances(result.data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!designation.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    const result = await createSeance({
      elementId,
      promotionId,
      anneeId,
      designation,
      description: description.filter((d) => d.trim()),
      ...(latitude &&
        longitude && {
          coords: {
            latitude: latitude,
            longitude: longitude,
          },
        }),
    });

    if (result.success) {
      setShowCreate(false);
      setDesignation("");
      setDescription([""]);
      setLatitude("");
      setLongitude("");
      await loadSeances();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette séance ?")) return;
    const result = await deleteSeance(id);
    if (result.success) await loadSeances();
  };

  const generateQRCode = (seanceId: string) => {
    // URL pour le QR code (peut pointer vers une page de présence)
    const url = `${window.location.origin}/seance/${seanceId}`;
    // Utiliser une API de génération de QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
  };

  const exportToExcel = async (seanceId: string, designation: string) => {
    const result = await fetchPresencesBySeance(seanceId);
    if (!result.success || !result.data) {
      alert("Erreur lors du chargement des présences");
      return;
    }

    const presences = result.data;

    // Créer un CSV simple (à améliorer avec xlsx library si nécessaire)
    let csv = "N°,Nom,Prénom,Matricule,Présent,Date\n";
    presences.forEach((p: any, idx: number) => {
      csv += `${idx + 1},${p.userId.nom},${p.userId.prenom},${p.userId.matricule},${p.isPresent ? "Oui" : "Non"},${new Date(p.markedAt).toLocaleString("fr-FR")}\n`;
    });

    // Télécharger le fichier
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `presence_${designation.replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Séances de Cours
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {showCreate ? "Annuler" : "+ Nouvelle séance"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6 space-y-4">
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Titre de la séance *"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
          />
          {description.map((desc, idx) => (
            <input
              key={idx}
              type="text"
              value={desc}
              onChange={(e) => {
                const newDesc = [...description];
                newDesc[idx] = e.target.value;
                setDescription(newDesc);
              }}
              placeholder={`Description ${idx + 1}`}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            />
          ))}
          <button
            onClick={() => setDescription([...description, ""])}
            className="text-sm text-primary hover:underline"
          >
            + Ajouter description
          </button>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude (optionnel)"
              className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            />
            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude (optionnel)"
              className="px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 w-full"
          >
            Créer la séance
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {seances.map((seance) => (
            <div
              key={seance._id}
              className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {seance.designation}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    {seance.description.map((desc, idx) => (
                      <p key={idx}>{desc}</p>
                    ))}
                  </div>
                  {seance.coords && (
                    <p className="text-sm text-gray-500">
                      📍 GPS: {seance.coords.latitude},{" "}
                      {seance.coords.longitude}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Créée le{" "}
                    {new Date(seance.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-center">
                  <img
                    src={generateQRCode(seance._id)}
                    alt="QR Code"
                    className="w-32 h-32 border dark:border-slate-700 rounded"
                  />
                  <p className="text-xs text-gray-500">Scannez pour présence</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t dark:border-slate-700">
                <Link
                  href={`/seance/${seance._id}`}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Voir détails
                </Link>
                <button
                  onClick={() => exportToExcel(seance._id, seance.designation)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📊 Export Excel
                </button>
                <button
                  onClick={() => handleDelete(seance._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {seances.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune séance créée
        </div>
      )}
    </div>
  );
};
