"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchRessources,
  deleteRessource,
  createRessource,
} from "@/app/actions/cours.actions";
import { uploadFichier } from "@/services/file.service";

interface Ressource {
  _id: string;
  designation: string;
  description: string[];
  reference?: string;
  document?: string;
  createdAt: string;
}

interface RessourcesManagerProps {
  elementId: string;
  titulaireId: string;
  promotionId: string;
  anneeId: string;
}

export const RessourcesManager = ({
  elementId,
  titulaireId,
  promotionId,
  anneeId,
}: RessourcesManagerProps) => {
  const [ressources, setRessources] = useState<Ressource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState<string[]>([""]);
  const [reference, setReference] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");

  useEffect(() => {
    loadRessources();
  }, [elementId]);

  const loadRessources = async () => {
    setLoading(true);
    const result = await fetchRessources(elementId);
    if (result.success) {
      setRessources(result.data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const url = await uploadFichier(file);
    if (url) setDocumentUrl(url);
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!designation.trim()) {
      alert("Le titre est obligatoire");
      return;
    }

    const result = await createRessource({
      titulaireId,
      elementId,
      promotionId,
      anneeId,
      designation,
      description: description.filter((d) => d.trim()),
      url: documentUrl || "",
      reference: reference || "",
    });

    if (result.success) {
      setShowCreate(false);
      setDesignation("");
      setDescription([""]);
      setReference("");
      setDocumentUrl("");
      await loadRessources();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette ressource ?")) return;
    const result = await deleteRessource(id);
    if (result.success) await loadRessources();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ressources Pédagogiques
        </h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          {showCreate ? "Annuler" : "+ Nouvelle ressource"}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6 space-y-4">
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Titre de la ressource *"
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
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Référence (optionnel)"
            className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
          />
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
              Document (optionnel)
            </label>
            <input
              type="file"
              onChange={(e) =>
                e.target.files?.[0] && handleUpload(e.target.files[0])
              }
              disabled={uploading}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
            />
            {uploading && (
              <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>
            )}
            {documentUrl && (
              <p className="text-sm text-green-600 mt-2">✓ Document uploadé</p>
            )}
          </div>
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 w-full"
          >
            Créer la ressource
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {ressources.map((res) => (
            <div
              key={res._id}
              className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {res.designation}
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    {res.description.map((desc, idx) => (
                      <p key={idx}>{desc}</p>
                    ))}
                  </div>
                  {res.reference && (
                    <p className="text-sm text-gray-500">
                      Référence: {res.reference}
                    </p>
                  )}
                  {res.document && (
                    <a
                      href={res.document}
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline block mt-2"
                    >
                      📄 Télécharger le document
                    </a>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    Créé le{" "}
                    {new Date(res.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/ressource/${res._id}`}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Voir détails
                  </Link>
                  <button
                    onClick={() => handleDelete(res._id)}
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

      {ressources.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucune ressource disponible
        </div>
      )}
    </div>
  );
};
