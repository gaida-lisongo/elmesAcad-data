"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByCategory,
} from "@/app/actions/documment.actions";

interface Document {
  _id: string;
  designation: string;
  category: string;
  description: string[];
  prix: number;
  isActive: boolean;
  commandesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentManagerProps {
  documents: Document[];
  category: string;
  categoryOptions: string[];
  promotionId: string;
  anneeId: string;
  onDocumentClick?: (document: Document) => void;
  onRefresh?: () => void;
}

export default function DocumentManager({
  documents: initialDocuments,
  category,
  categoryOptions,
  promotionId,
  anneeId,
  onDocumentClick,
  onRefresh,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
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
  });

  const resetForm = () => {
    setFormData({
      designation: "",
      description: "",
      prix: 0,
      category: category,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (doc: Document) => {
    setFormData({
      designation: doc.designation,
      description: doc.description.join(", "),
      prix: doc.prix,
      category: doc.category,
    });
    setEditingId(doc._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const description = formData.description
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d);

      if (editingId) {
        const result = await updateDocument({
          _id: editingId,
          designation: formData.designation,
          description: description,
          prix: formData.prix,
          category: formData.category,
        });

        if (result.success) {
          setSuccessMessage(result.message);
          const refreshResult = await getDocumentsByCategory(
            category,
            promotionId,
            anneeId,
          );
          if (refreshResult.success) {
            setDocuments(refreshResult.data);
          }
          resetForm();
        } else {
          setErrorMessage(result.message);
        }
      } else {
        const result = await createDocument({
          designation: formData.designation,
          description: description,
          prix: formData.prix,
          category: formData.category,
          anneeId: anneeId,
          promotionId: promotionId,
          signatures: [],
          slug: formData.designation.toLowerCase().replace(/\s+/g, "-"),
        });

        if (result.success) {
          setSuccessMessage(result.message);
          const refreshResult = await getDocumentsByCategory(
            category,
            promotionId,
            anneeId,
          );
          if (refreshResult.success) {
            setDocuments(refreshResult.data);
          }
          resetForm();
        } else {
          setErrorMessage(result.message);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message);
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
        setSuccessMessage(result.message);
        setDocuments(documents.filter((d) => d._id !== id));
      } else {
        setErrorMessage(result.message);
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
              Désignation
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
              Description (séparée par des virgules)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix
            </label>
            <input
              type="number"
              value={formData.prix}
              onChange={(e) =>
                setFormData({ ...formData, prix: parseFloat(e.target.value) })
              }
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
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
                    Prix: {doc.prix} FC
                  </p>
                  {doc.description && (
                    <p className="text-sm text-gray-500 mt-2">
                      {doc.description.join(", ")}
                    </p>
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
