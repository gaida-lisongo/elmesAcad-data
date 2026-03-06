"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  getCommandesByDocument,
  createOrUpdateCommande,
  deleteCommande,
  generateDocumentReleve,
} from "@/app/actions/documment.actions";
import { resolveMatriculeToUser } from "@/lib/utils/resolveUser";

interface Commande {
  _id: string;
  docummentId: string;
  phoneNumber: string;
  orderNumber: string;
  reference: string;
  status: "pending" | "paid" | "failed" | "ok";
  createdAt: Date;
  updatedAt: Date;
  lieu_naissance?: string;
  date_naissance?: string;
  nationalite?: string;
  sexe?: string;
  adresse?: string;
  etudiantId?:
    | {
        _id: string;
        nomComplet: string;
        email: string;
        matricule: string;
      }
    | string;
}

interface Document {
  _id: string;
  designation: string;
  prix: number;
}

interface CommandesViewerProps {
  document: Document;
  docummentId: string;
}

export default function CommandesViewer({
  document,
  docummentId,
}: CommandesViewerProps) {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  console.log("Document : ", document);

  const [formData, setFormData] = useState({
    etudiantId: "",
    phoneNumber: "",
    status: "pending" as "pending" | "paid" | "failed" | "ok",
    lieu_naissance: "",
    date_naissance: "",
    nationalite: "",
    sexe: "" as "" | "M" | "F",
    adresse: "",
  });

  useEffect(() => {
    loadCommandes();
  }, [docummentId]);

  const loadCommandes = async () => {
    setLoading(true);
    try {
      const result = await getCommandesByDocument(docummentId);
      if (result.success) {
        setCommandes(result.data);
      } else {
        setErrorMessage(result.error);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const studentInfo = await resolveMatriculeToUser(formData.etudiantId);
      if (!studentInfo) {
        setErrorMessage("Matricule invalide ou utilisateur non trouvé");
        setLoading(false);
        return;
      }

      const result = await createOrUpdateCommande({
        etudiantId: studentInfo.userId,
        docummentId: docummentId,
        phoneNumber: formData.phoneNumber,
        status: formData.status,
        lieu_naissance: formData.lieu_naissance,
        date_naissance: formData.date_naissance
          ? new Date(formData.date_naissance).toISOString()
          : undefined,
        nationalite: formData.nationalite,
        sexe: formData.sexe,
        adresse: formData.adresse,
      });

      if (result.success) {
        setSuccessMessage(result.message);
        loadCommandes();
        setFormData({
          etudiantId: "",
          phoneNumber: "",
          status: "pending",
          lieu_naissance: "",
          date_naissance: "",
          nationalite: "",
          sexe: "",
          adresse: "",
        });
        setShowForm(false);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) return;

    setLoading(true);
    try {
      const result = await deleteCommande(id);
      if (result.success) {
        setSuccessMessage(result.message ?? "Commande supprimée avec succès");
        loadCommandes();
      } else {
        setErrorMessage(result.message ?? "Erreur lors de la suppression");
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReleve = async (commandeId: string) => {
    console.log(
      "[handleGenerateReleve] Génération du relevé pour commande:",
      commandeId,
    );
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await generateDocumentReleve(commandeId);

      if (!result.success) {
        console.error("[handleGenerateReleve] Erreur retournée:", result.error);
        setErrorMessage(
          result.message || "Erreur lors de la génération du relevé",
        );
        setLoading(false);
        return;
      }

      console.log("[handleGenerateReleve] Document généré, base64 reçu");

      const base64String = (result.data as unknown as string) || "";
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const fileName = (result.fileName as string) || "document.xlsx";
      const blob = new Blob([bytes] as BlobPart[], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement("a");
      link.href = url;
      link.download = fileName;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("[handleGenerateReleve] Fichier téléchargé:", fileName);

      setSuccessMessage("Relevé généré et téléchargé avec succès");
    } catch (error: any) {
      console.error("[handleGenerateReleve] Exception:", error);
      setErrorMessage(
        error.message || "Erreur lors de la génération du relevé",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!csvFile) {
      setErrorMessage("Veuillez sélectionner un fichier CSV");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const text = await csvFile.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());

        if (values.length < 2) {
          console.log("[CSV Import] Ligne skippée (trop courte):", i);
          continue;
        }

        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });

        if (!obj.etudiantid || !obj.phonenumber) {
          console.log(
            "[CSV Import] Ligne invalide, manque etudiantId ou phoneNumber",
          );
          continue;
        }

        const studentInfo = await resolveMatriculeToUser(obj.etudiantid);
        if (!studentInfo) {
          console.warn(`[CSV Import] Matricule invalide: ${obj.etudiantid}`);
          continue;
        }

        await createOrUpdateCommande({
          etudiantId: studentInfo.userId,
          docummentId: docummentId,
          phoneNumber: obj.phonenumber,
          status: obj.status || "pending",
          lieu_naissance: obj.lieu_naissance || "",
          date_naissance: obj.date_naissance
            ? new Date(obj.date_naissance).toISOString()
            : undefined,
          nationalite: obj.nationalite || "",
          sexe: obj.sexe || "",
          adresse: obj.adresse || "",
        });
        imported++;
      }

      setSuccessMessage(`${imported} commande(s) importée(s) avec succès`);
      loadCommandes();
      setCsvFile(null);
      console.log("[CSV Import] Import terminé:", imported, "commandos");
    } catch (error: any) {
      console.error("[CSV Import] Erreur:", error);
      setErrorMessage(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: "pending" | "paid" | "failed" | "ok") => {
    switch (status) {
      case "ok":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Commandes - {document.designation}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Prix: {document.prix} $</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule Étudiant *
              </label>
              <input
                type="text"
                value={formData.etudiantId}
                onChange={(e) =>
                  setFormData({ ...formData, etudiantId: e.target.value })
                }
                required
                placeholder="ex: ST2024001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input
                type="date"
                value={formData.date_naissance}
                onChange={(e) =>
                  setFormData({ ...formData, date_naissance: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de naissance
              </label>
              <input
                type="text"
                value={formData.lieu_naissance}
                onChange={(e) =>
                  setFormData({ ...formData, lieu_naissance: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationalité
              </label>
              <input
                type="text"
                value={formData.nationalite}
                onChange={(e) =>
                  setFormData({ ...formData, nationalite: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sexe
              </label>
              <select
                value={formData.sexe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sexe: e.target.value as "" | "M" | "F",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">-- Sélectionner --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={formData.adresse}
              onChange={(e) =>
                setFormData({ ...formData, adresse: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | "pending"
                    | "paid"
                    | "failed"
                    | "ok",
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="ok">Validé</option>
              <option value="failed">Échoué</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? "En cours..." : "Ajouter commande"}
          </button>
        </form>
      )}

      {/* CSV Import Section */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Icon icon="material-symbols:upload-file" width={20} height={20} />
          Importer depuis CSV
        </h3>
        <form onSubmit={handleCSVImport} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier CSV (colonnes: etudiantId, phoneNumber, [date_naissance,
              lieu_naissance, nationalite, sexe, adresse, status])
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !csvFile}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Import en cours..." : "Importer"}
          </button>
        </form>
      </div>

      {/* Commandes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">
            {commandes.length} Commande(s)
          </h3>
          <button
            onClick={loadCommandes}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Rafraîchir"
          >
            <Icon
              icon="material-symbols:refresh"
              width={20}
              height={20}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {commandes.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucune commande trouvée
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Étudiant
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((cmd) => (
                  <tr key={cmd._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {typeof cmd.etudiantId === "object"
                        ? cmd.etudiantId.nomComplet
                        : cmd.etudiantId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {cmd.phoneNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div className="text-xs">
                        <p className="font-mono">{cmd.orderNumber}</p>
                        <p className="text-gray-500">{cmd.reference}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(cmd.status)}`}
                      >
                        {cmd.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(cmd.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleGenerateReleve(cmd._id)}
                          disabled={loading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                          title="Générer le relevé"
                        >
                          <Icon
                            icon="material-symbols:file-download"
                            width={18}
                            height={18}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(cmd._id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Icon
                            icon="material-symbols:delete"
                            width={18}
                            height={18}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
