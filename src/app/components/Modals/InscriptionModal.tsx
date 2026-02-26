"use client";

import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import { createInscription } from "@/app/actions/subscription.actions";
import { DocumentsStudent, InfoStudent, ResumeStudent } from "./StepsFrom";

interface InscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionId: string;
  promotionNom: string;
  promotionNiveau: string;
  anneeId: string;
  anneeDesignation: string;
  filiereNom: string;
  sectionNom: string;
}

export interface StudentData {
  nomComplet: string;
  email: string;
  telephone: string;
  adresse: string;
  password: string;
  confirmPassword: string;
  grade: string;
}

export interface Document {
  title: string;
  url: string;
}

export default function InscriptionModal({
  isOpen,
  onClose,
  promotionId,
  promotionNom,
  promotionNiveau,
  anneeId,
  anneeDesignation,
  filiereNom,
  sectionNom,
}: InscriptionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inscriptionData, setInscriptionData] = useState<any>(null);

  const [studentData, setStudentData] = useState<StudentData>({
    nomComplet: "",
    email: "",
    telephone: "",
    adresse: "",
    password: "",
    confirmPassword: "",
    grade: "Etudiant",
  });

  const [documents, setDocuments] = useState<Document[]>([
    { title: "", url: "" },
  ]);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3) {
      handleSubmitInscription();
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validation Étape 1
  const validateStep1 = () => {
    if (
      !studentData.nomComplet ||
      !studentData.email ||
      !studentData.password ||
      !studentData.confirmPassword
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    if (studentData.password !== studentData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return false;
    }

    if (studentData.password.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      alert("Veuillez entrer un email valide");
      return false;
    }

    return true;
  };

  // Validation Étape 2
  const validateStep2 = () => {
    const validDocuments = documents.filter((doc) => doc.title && doc.url);
    if (validDocuments.length === 0) {
      alert("Veuillez ajouter au moins un document");
      return false;
    }
    return true;
  };

  // Gestion des documents
  const addDocument = () => {
    setDocuments([...documents, { title: "", url: "" }]);
  };

  const removeDocument = (index: number) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const updateDocument = (
    index: number,
    field: keyof Document,
    value: string,
  ) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  // Soumission de l'inscription
  const handleSubmitInscription = async () => {
    setIsSubmitting(true);
    try {
      const validDocuments = documents.filter((doc) => doc.title && doc.url);

      const result = await createInscription({
        studentData: {
          nomComplet: studentData.nomComplet,
          email: studentData.email,
          telephone: studentData.telephone,
          adresse: studentData.adresse,
          password: studentData.password,
          grade: studentData.grade,
        },
        promotionId,
        anneeId,
        documents: validDocuments,
      });

      if (!result.success) {
        alert(result.error || "Erreur lors de l'inscription");
        setIsSubmitting(false);
        return;
      }

      setInscriptionData(result.data);
      setCurrentStep(4);
    } catch (error) {
      console.error("Error submitting inscription:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fermer la modal et réinitialiser
  const handleClose = () => {
    if (!isSubmitting) {
      setCurrentStep(1);
      setStudentData({
        nomComplet: "",
        email: "",
        telephone: "",
        adresse: "",
        password: "",
        confirmPassword: "",
        grade: "Etudiant",
      });
      setDocuments([{ title: "", url: "" }]);
      setInscriptionData(null);
      onClose();
    }
  };

  // Imprimer le document
  const handlePrint = () => {
    if (invoiceRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Attestation d'inscription</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .invoice { max-width: 800px; margin: 0 auto; }
                .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 28px; font-weight: bold; color: #1e40af; }
                .section { margin: 20px 0; }
                .label { font-weight: bold; color: #374151; }
                .value { color: #6b7280; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                th { background-color: #f3f4f6; font-weight: bold; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; }
                @media print { 
                  body { padding: 20px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${invoiceRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-midnight_text">
              Inscription à la promotion
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {promotionNom} - {filiereNom}
            </p>
          </div>
          {currentStep < 4 && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <Icon icon="material-symbols:close" width={24} />
            </button>
          )}
        </div>

        {/* Stepper */}
        {currentStep < 4 && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      step === currentStep
                        ? "bg-primary text-white"
                        : step < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? (
                      <Icon icon="material-symbols:check" width={20} />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-20 h-1 mx-2 transition ${
                        step < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-2xl mx-auto mt-2">
              <span className="text-xs text-gray-600">Informations</span>
              <span className="text-xs text-gray-600">Documents</span>
              <span className="text-xs text-gray-600">Confirmation</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Étape 1: Informations étudiant */}
          {currentStep === 1 && (
            <InfoStudent
              studentData={studentData}
              setStudentData={setStudentData}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Étape 2: Documents */}
          {currentStep === 2 && (
            <DocumentsStudent
              documents={documents}
              addDocument={addDocument}
              removeDocument={removeDocument}
              updateDocument={updateDocument}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Étape 3: Résumé */}
          {currentStep === 3 && (
            <ResumeStudent
              studentData={studentData}
              promotionNom={promotionNom}
              promotionNiveau={promotionNiveau}
              anneeDesignation={anneeDesignation}
              filiereNom={filiereNom}
              sectionNom={sectionNom}
              documents={documents}
            />
          )}

          {/* Étape 4: Attestation d'inscription */}
          {currentStep === 4 && inscriptionData && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="material-symbols:check-circle"
                    width={40}
                    className="text-green-600"
                  />
                </div>
                <h3 className="text-2xl font-bold text-midnight_text mb-2">
                  Inscription réussie !
                </h3>
                <p className="text-gray-600">
                  Votre demande d'inscription a été enregistrée avec succès.
                </p>
              </div>

              {/* Invoice/Attestation */}
              <div
                ref={invoiceRef}
                className="border border-gray-300 rounded-lg p-8 bg-white"
              >
                <div className="invoice">
                  {/* Header */}
                  <div className="header">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h1 className="title">ATTESTATION D'INSCRIPTION</h1>
                        <p className="text-sm text-gray-600 mt-2">
                          Année académique {anneeDesignation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          N°{" "}
                          {inscriptionData.subscription._id
                            .slice(-8)
                            .toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Date:{" "}
                          {new Date().toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Étudiant */}
                  <div className="section">
                    <h3 className="label" style={{ marginBottom: "12px" }}>
                      INFORMATIONS DE L'ÉTUDIANT
                    </h3>
                    <table>
                      <tbody>
                        <tr>
                          <td className="label">Nom complet</td>
                          <td className="value">
                            {inscriptionData.student.nomComplet}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Matricule</td>
                          <td className="value">
                            {inscriptionData.student.matricule}
                          </td>
                        </tr>
                        <tr>
                          <td className="label">Email</td>
                          <td className="value">
                            {inscriptionData.student.email}
                          </td>
                        </tr>
                        {inscriptionData.student.telephone && (
                          <tr>
                            <td className="label">Téléphone</td>
                            <td className="value">
                              {inscriptionData.student.telephone}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Formation */}
                  <div className="section">
                    <h3 className="label" style={{ marginBottom: "12px" }}>
                      FORMATION
                    </h3>
                    <table>
                      <tbody>
                        <tr>
                          <td className="label">Section</td>
                          <td className="value">{sectionNom}</td>
                        </tr>
                        <tr>
                          <td className="label">Filière</td>
                          <td className="value">{filiereNom}</td>
                        </tr>
                        <tr>
                          <td className="label">Programme</td>
                          <td className="value">{promotionNom}</td>
                        </tr>
                        <tr>
                          <td className="label">Niveau</td>
                          <td className="value">{promotionNiveau}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Statut */}
                  <div className="section">
                    <div
                      style={{
                        padding: "16px",
                        backgroundColor: "#fef3c7",
                        border: "1px solid #fbbf24",
                        borderRadius: "8px",
                      }}
                    >
                      <p style={{ fontSize: "14px", color: "#92400e" }}>
                        <strong>Statut:</strong> En attente de validation
                        administrative
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#92400e",
                          marginTop: "8px",
                        }}
                      >
                        Votre dossier sera examiné par l'administration. Vous
                        recevrez une notification par email une fois votre
                        inscription validée.
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="footer">
                    <p style={{ fontSize: "12px", marginBottom: "8px" }}>
                      Ce document certifie que la demande d'inscription a été
                      enregistrée dans notre système.
                    </p>
                    <p style={{ fontSize: "11px" }}>
                      Pour toute question, veuillez contacter le service des
                      inscriptions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center mt-6 no-print">
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                >
                  <Icon icon="material-symbols:print" width={20} />
                  Imprimer l'attestation
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions (steps 1-3) */}
        {currentStep < 4 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Icon icon="material-symbols:arrow-back" width={20} />
              Précédent
            </button>

            <button
              onClick={nextStep}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon
                    icon="material-symbols:progress-activity"
                    width={20}
                    className="animate-spin"
                  />
                  Traitement...
                </>
              ) : currentStep === 3 ? (
                <>
                  <Icon icon="material-symbols:check" width={20} />
                  Confirmer l'inscription
                </>
              ) : (
                <>
                  Suivant
                  <Icon icon="material-symbols:arrow-forward" width={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
