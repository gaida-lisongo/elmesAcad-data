"use client";
import { Icon } from "@iconify/react";
import { Document, StudentData } from "./InscriptionModal";
import { useState } from "react";
import { uploadFichier } from "@/services/file.service";

export function InfoStudent({
  studentData,
  setStudentData,
  isSubmitting,
}: {
  studentData: StudentData;
  setStudentData: (data: StudentData) => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-midnight_text mb-4">
        Vos informations personnelles
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom complet *
        </label>
        <input
          type="text"
          value={studentData.nomComplet}
          onChange={(e) =>
            setStudentData({
              ...studentData,
              nomComplet: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="Prénom et nom"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={studentData.email}
          onChange={(e) =>
            setStudentData({ ...studentData, email: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="votre.email@example.com"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Téléphone
        </label>
        <input
          type="tel"
          value={studentData.telephone}
          onChange={(e) =>
            setStudentData({
              ...studentData,
              telephone: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="+243 000 000 000"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresse
        </label>
        <textarea
          value={studentData.adresse}
          onChange={(e) =>
            setStudentData({ ...studentData, adresse: e.target.value })
          }
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="Votre adresse complète"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mot de passe *
        </label>
        <input
          type="password"
          value={studentData.password}
          onChange={(e) =>
            setStudentData({ ...studentData, password: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="Minimum 6 caractères"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe *
        </label>
        <input
          type="password"
          value={studentData.confirmPassword}
          onChange={(e) =>
            setStudentData({
              ...studentData,
              confirmPassword: e.target.value,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
          placeholder="Confirmez votre mot de passe"
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}

export function DocumentsStudent({
  documents,
  addDocument,
  removeDocument,
  updateDocument,
  isSubmitting,
}: {
  documents: Document[];
  addDocument: () => void;
  removeDocument: (index: number) => void;
  updateDocument: (index: number, field: keyof Document, value: string) => void;
  isSubmitting: boolean;
}) {
  const [uploadingStates, setUploadingStates] = useState<Record<number, boolean>>({});

  const handleFileUpload = async (index: number, file: File) => {
    try {
      setUploadingStates(prev => ({ ...prev, [index]: true }));
      const url = await uploadFichier(file);
      updateDocument(index, "url", url);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload du fichier. Veuillez réessayer.");
    } finally {
      setUploadingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-midnight_text">
          Vos documents
        </h3>
        <button
          onClick={addDocument}
          className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
          disabled={isSubmitting}
        >
          <Icon icon="material-symbols:add" width={18} />
          Ajouter un document
        </button>
      </div>

      <div className="space-y-3">
        {documents.map((doc, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                Document {index + 1}
              </h4>
              {documents.length > 1 && (
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-600"
                  disabled={isSubmitting || uploadingStates[index]}
                >
                  <Icon icon="material-symbols:delete" width={18} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Titre du document
                </label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) =>
                    updateDocument(index, "title", e.target.value)
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ex: Diplôme d'État"
                  disabled={isSubmitting || uploadingStates[index]}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Uploader le document
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(index, file);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                    disabled={isSubmitting || uploadingStates[index]}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {uploadingStates[index] && (
                    <Icon
                      icon="eos-icons:loading"
                      width={20}
                      className="text-primary"
                    />
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-500">OU</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  URL du document
                </label>
                <input
                  type="url"
                  value={doc.url}
                  onChange={(e) => updateDocument(index, "url", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="https://..."
                  disabled={isSubmitting || uploadingStates[index]}
                />
              </div>

              {doc.url && (
                <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded">
                  <Icon icon="material-symbols:check-circle" width={16} />
                  <span>Document ajouté</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <Icon
            icon="material-symbols:info"
            width={16}
            className="inline mr-1"
          />
          Les documents seront vérifiés par l'administration avant validation de
          votre inscription.
        </p>
      </div>
    </div>
  );
}

export function ResumeStudent({
  studentData,
  promotionNom,
  promotionNiveau,
  filiereNom,
  sectionNom,
  anneeDesignation,
  documents,
}: {
  studentData: StudentData;
  promotionNom: string;
  promotionNiveau: string;
  filiereNom: string;
  sectionNom: string;
  anneeDesignation: string;
  documents: Document[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-midnight_text mb-4">
        Vérifiez vos informations
      </h3>

      {/* Informations personnelles */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-midnight_text mb-3 flex items-center gap-2">
          <Icon icon="material-symbols:person" width={20} />
          Informations personnelles
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Nom complet:</span>
            <span className="font-medium">{studentData.nomComplet}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{studentData.email}</span>
          </div>
          {studentData.telephone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Téléphone:</span>
              <span className="font-medium">{studentData.telephone}</span>
            </div>
          )}
          {studentData.adresse && (
            <div className="flex justify-between">
              <span className="text-gray-600">Adresse:</span>
              <span className="font-medium">{studentData.adresse}</span>
            </div>
          )}
        </div>
      </div>

      {/* Promotion */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-midnight_text mb-3 flex items-center gap-2">
          <Icon icon="material-symbols:school" width={20} />
          Promotion
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Programme:</span>
            <span className="font-medium">{promotionNom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Niveau:</span>
            <span className="font-medium">{promotionNiveau}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Filière:</span>
            <span className="font-medium">{filiereNom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Section:</span>
            <span className="font-medium">{sectionNom}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Année académique:</span>
            <span className="font-medium">{anneeDesignation}</span>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-midnight_text mb-3 flex items-center gap-2">
          <Icon icon="material-symbols:folder" width={20} />
          Documents fournis
        </h4>
        <div className="space-y-2">
          {documents
            .filter((doc) => doc.title && doc.url)
            .map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded"
              >
                <Icon
                  icon="material-symbols:description"
                  width={16}
                  className="text-primary"
                />
                <span className="font-medium">{doc.title}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-700">
          <Icon
            icon="material-symbols:warning"
            width={16}
            className="inline mr-1"
          />
          En validant, vous confirmez que toutes les informations fournies sont
          exactes. Votre inscription sera soumise à validation administrative.
        </p>
      </div>
    </div>
  );
}
