"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByCategory,
} from "@/app/actions/documment.actions";
import { resolveMatriculeToUser } from "@/lib/utils/resolveUser";

interface DocumentItem {
  _id: string;
  designation: string;
  category: string;
  description: string[];
  prix: number;
  isActive: boolean;
  commandesCount?: number;
  signatures?: {
    userId: string;
    fonction: string;
    nomComplet?: string;
    email?: string;
    matricule?: string;
    userType?: "teacher" | "student" | "unknown";
  }[];
  createdAt: string;
  updatedAt: string;
}

interface DocumentManagerProps {
  documents: DocumentItem[];
  category: string;
  categoryOptions: string[];
  promotionId: string;
  anneeId: string;
  onDocumentClick?: (document: DocumentItem) => void;
  onRefresh?: () => void;
}

export default function DocumentManager({
  documents: initialDocuments,
  category,
  categoryOptions: _categoryOptions,
  promotionId,
  anneeId,
  onDocumentClick,
  onRefresh,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    designation: "",
    description: "",
    prix: 0,
    category: category,
    signatures: [{ userId: "", fonction: "" }],
  });

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const resetForm = () => {
    setFormData({
      designation: "",
      description: "",
      prix: 0,
      category: category,
      signatures: [{ userId: "", fonction: "" }],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (doc: DocumentItem) => {
    setFormData({
      designation: doc.designation,
      description: doc.description.join("\n"),
      prix: doc.prix,
      category: doc.category,
      signatures:
        doc.signatures && doc.signatures.length > 0
          ? doc.signatures.map((sig) => ({
              userId: sig.matricule || sig.userId,
              fonction: sig.fonction,
            }))
          : [{ userId: "", fonction: "" }],
    });
    setEditingId(doc._id);
    setShowForm(true);
  };

  const handleAddSignature = () => {
    setFormData((prev) => ({
      ...prev,
      signatures: [...prev.signatures, { userId: "", fonction: "" }],
    }));
  };

  const handleRemoveSignature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      signatures: prev.signatures.filter((_, i) => i !== index),
    }));
  };

  const handleSignatureChange = (
    index: number,
    field: "userId" | "fonction",
    value: string,
  ) => {
    setFormData((prev) => {
      const newSignatures = [...prev.signatures];
      newSignatures[index] = { ...newSignatures[index], [field]: value };
      return { ...prev, signatures: newSignatures };
    });
  };

  const refreshDocuments = async () => {
    const refreshResult = await getDocumentsByCategory(
      category,
      promotionId,
      anneeId,
    );
    if (refreshResult.success) {
      setDocuments(refreshResult.data);
      onRefresh?.();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const description = formData.description
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d);

      const parseSignatures = [];
      const failedMatricules: string[] = [];

      for (const s of formData.signatures) {
        if (!s.userId || !s.fonction) continue; // Skip empty signatures

        try {
          const userInfo = await resolveMatriculeToUser(s.userId);
          if (userInfo?.userId)
            parseSignatures.push({
              userId: userInfo.userId,
              fonction: s.fonction,
            });
        } catch (error: any) {
          failedMatricules.push(s.userId);
        }
      }

      if (failedMatricules.length > 0) {
        setErrorMessage(
          `❌ Matricules non trouvés: ${failedMatricules.join(", ")}. Vérifiez les matricules entrés.`,
        );
        setLoading(false);
        return;
      }

      const validSignatures = parseSignatures.filter(
        (sig) => sig.userId && sig.fonction.trim(),
      );

      if (editingId) {
        const result = await updateDocument({
          _id: editingId,
          designation: formData.designation,
          description: description,
          prix: formData.prix,
          category: formData.category,
          signatures: validSignatures,
        });

        if (result.success) {
          setSuccessMessage(`✅ Document modifié avec succès`);
          await refreshDocuments();
          resetForm();
        } else {
          setErrorMessage(result.message || "Erreur lors de la modification");
        }
      } else {
        const result = await createDocument({
          designation: formData.designation,
          description: description,
          prix: formData.prix,
          category: formData.category,
          anneeId: anneeId,
          promotionId: promotionId,
          signatures: validSignatures,
          slug: formData.designation.toLowerCase().replace(/\s+/g, "-"),
        });

        if (result.success) {
          setSuccessMessage(`✅ Document créé avec succès`);
          await refreshDocuments();
          resetForm();
        } else {
          setErrorMessage(result.message || "Erreur lors de la création");
        }
      }
    } catch (error: any) {
      setErrorMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    setLoading(true);
    try {
      const result = await deleteDocument(id);
      if (result.success) {
        setSuccessMessage(
          `${result.message ?? "Document supprimé avec succès"}`,
        );
        setDocuments(documents.filter((d) => d._id !== id));
      } else {
        setErrorMessage(`${result.message ?? "Erreur lors de la suppression"}`);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg">
      {/* Messages */}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Icon
            icon="material-symbols:check-circle"
            width={24}
            height={24}
            className="text-green-600"
          />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <Icon
            icon="material-symbols:error"
            width={24}
            height={24}
            className="text-red-600"
          />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Documents - {category}
        </h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
        >
          <Icon icon="material-symbols:add" width={20} height={20} />
          {showForm ? "Annuler" : "Ajouter"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Désignation *
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) =>
                setFormData({ ...formData, designation: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (une ligne par élément)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary font-mono text-sm"
              rows={4}
              placeholder={"Ligne 1\nLigne 2\nLigne 3..."}
            />
            <p className="text-xs text-gray-500 mt-1">
              Appuyez sur Entrée pour ajouter une nouvelle ligne
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix *
            </label>
            <input
              type="number"
              value={formData.prix}
              onChange={(e) =>
                setFormData({ ...formData, prix: parseFloat(e.target.value) })
              }
              step="0.01"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  👥 Signataires (optionnel)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Entrez le matricule (Ex: PROF001, E2024001) - le système
                  convertira automatiquement
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSignature}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition"
              >
                <Icon icon="material-symbols:add" width={16} height={16} />
                Ajouter
              </button>
            </div>

            {formData.signatures.map((sig, index) => (
              <div key={index} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Matricule de l'utilisateur *
                  </label>
                  <input
                    type="text"
                    value={sig.userId}
                    onChange={(e) =>
                      handleSignatureChange(index, "userId", e.target.value)
                    }
                    placeholder="Ex: PROF001, E2024001"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">
                    Le système convertira automatiquement la matricule
                  </p>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">
                    Fonction *
                  </label>
                  <input
                    type="text"
                    value={sig.fonction}
                    onChange={(e) =>
                      handleSignatureChange(index, "fonction", e.target.value)
                    }
                    placeholder="Ex: Directeur"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                {formData.signatures.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSignature(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Icon
                      icon="material-symbols:delete"
                      width={18}
                      height={18}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "En cours..." : editingId ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucun document trouvé
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onDocumentClick?.(doc)}
                >
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {doc.designation}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Prix: {doc.prix} USD
                  </p>
                  {doc.description && doc.description.length > 0 && (
                    <div className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">
                      {doc.description.join("\n")}
                    </div>
                  )}
                  {doc.signatures && doc.signatures.length > 0 && (
                    <div className="text-xs text-gray-600 mt-2">
                      <p className="font-medium mb-2">
                        Signataires ({doc.signatures.length}):
                      </p>
                      <ul className="space-y-1 ml-2">
                        {doc.signatures.map((sig, idx) => (
                          <li
                            key={idx}
                            className="text-xs bg-blue-50 p-1.5 rounded border border-blue-200"
                          >
                            <div className="font-medium text-gray-800">
                              {sig.nomComplet || "Unknown"}
                            </div>
                            <div className="text-gray-600">{sig.fonction}</div>
                            <div className="flex gap-2 text-gray-500 text-xs">
                              <span>
                                {sig.userType === "teacher"
                                  ? "👨‍🏫 Enseignant"
                                  : sig.userType === "student"
                                    ? "👨‍🎓 Étudiant"
                                    : "❓ Type inconnu"}
                              </span>
                              {sig.matricule && <span>• {sig.matricule}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {doc.commandesCount !== undefined && (
                    <p className="text-sm text-primary font-medium mt-2">
                      {doc.commandesCount} commande(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Icon icon="material-symbols:edit" width={20} height={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Icon
                      icon="material-symbols:delete"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
