"use client";

import { useState } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import DocumentManager from "@/app/components/DocumentManager";
import CommandesViewer from "@/app/components/CommandesViewer";
import { getDocumentsWithComandesCount } from "@/app/actions/documment.actions";
import { useEffect } from "react";
import PDFManager from "@/utils/pdfs/PDFManager";
import RelevePDF from "@/utils/pdfs/RelevePDF";

const ENSEIGNEMENT_CATEGORIES = [
  "RELEVE",
  "FICHE-VALIDATION",
  "ACQUIS DE DROIT",
];

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

export default function EnseignementDocsPage() {
  const { selectedPromotion, selectedAnnee } = useAcademicContext();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    ENSEIGNEMENT_CATEGORIES[0],
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );

  useEffect(() => {
    if (selectedPromotion && selectedAnnee) {
      loadDocuments();
    }
  }, [selectedPromotion, selectedAnnee, selectedCategory]);

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

  const generatePDF = async () => {
    const relevePdf = new RelevePDF();
    await relevePdf.render();
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
      {/* Category Tabs */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Catégories</h3>
        <div className="flex flex-wrap gap-2">
          {ENSEIGNEMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedDocument(null);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={generatePDF}
            className="ml-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            Générer PDF
          </button>
        </div>
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
          categoryOptions={ENSEIGNEMENT_CATEGORIES}
          promotionId={selectedPromotion.id}
          anneeId={selectedAnnee._id}
          onDocumentClick={setSelectedDocument}
          onRefresh={loadDocuments}
        />
      )}
    </div>
  );
}
