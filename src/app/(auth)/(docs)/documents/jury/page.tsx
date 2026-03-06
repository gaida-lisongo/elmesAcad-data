"use client";

import { useState, useEffect } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import DocumentManager from "@/app/components/DocumentManager";
import CommandesViewer from "@/app/components/CommandesViewer";
import { getDocumentsWithComandesCount } from "@/app/actions/documment.actions";

const JURY_CATEGORIES = ["BULLETIN"];

interface Document {
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

export default function JuryDocsPage() {
  const { selectedPromotion, selectedAnnee } = useAcademicContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory] = useState(JURY_CATEGORIES[0]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );

  useEffect(() => {
    if (selectedPromotion && selectedAnnee) {
      loadDocuments();
    }
  }, [selectedPromotion, selectedAnnee]);

  const loadDocuments = async () => {
    if (!selectedPromotion || !selectedAnnee) return;

    setLoading(true);
    try {
      const result = await getDocumentsWithComandesCount(
        selectedCategory,
        selectedPromotion.id,
        selectedAnnee._id,
      );

      if (result.success) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des documents:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPromotion || !selectedAnnee) {
    return (
      <div className="p-6 bg-white rounded-lg">
        <p className="text-center text-gray-500">
          Veuillez sélectionner une année et une promotion
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Category Info */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold text-gray-800">
          Catégorie: {selectedCategory}
        </h3>
        <p className="text-sm text-gray-600">Gestion des bulletins</p>
      </div>

      {/* Main Content */}
      {selectedDocument ? (
        <div>
          <button
            onClick={() => setSelectedDocument(null)}
            className="mb-4 flex items-center gap-2 text-primary hover:underline"
          >
            ← Retour aux documents
          </button>
          <CommandesViewer
            document={selectedDocument}
            docummentId={selectedDocument._id}
            promotion={selectedPromotion}
          />
        </div>
      ) : (
        <DocumentManager
          documents={documents}
          category={selectedCategory}
          categoryOptions={JURY_CATEGORIES}
          promotionId={selectedPromotion.id}
          anneeId={selectedAnnee._id}
          onDocumentClick={setSelectedDocument}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
}
