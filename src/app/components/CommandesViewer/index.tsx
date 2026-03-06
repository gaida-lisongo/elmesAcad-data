"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  getCommandesByDocument,
  createOrUpdateCommande,
  deleteCommande,
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
      });

      if (result.success) {
        setSuccessMessage(result.message);
        loadCommandes();
        setFormData({
          etudiantId: "",
          phoneNumber: "",
          status: "pending",
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
      // Parse CSV and import
      // This is a simple implementation - you might want to enhance it
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());

        if (values.length < 2) continue;

        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });

        if (obj.etudiantid && obj.phonenumber) {
          const studentInfo = await resolveMatriculeToUser(obj.etudiantid);
          if (!studentInfo) {
            console.warn(
              `Matricule invalide ou utilisateur non trouvé: ${obj.etudiantid}`,
            );
            continue;
          }

          await createOrUpdateCommande({
            etudiantId: studentInfo.userId,
            docummentId: docummentId,
            phoneNumber: obj.phonenumber,
            status: obj.status || "pending",
          });
          imported++;
        }
      }

      setSuccessMessage(`${imported} commande(s) importée(s) avec succès`);
      loadCommandes();
      setCsvFile(null);
    } catch (error: any) {
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Étudiant
            </label>
            <input
              type="text"
              value={formData.etudiantId}
              onChange={(e) =>
                setFormData({ ...formData, etudiantId: e.target.value })
              }
              required
              placeholder="ObjectId de l'étudiant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de téléphone
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
              Fichier CSV (colonnes: etudiantId, phoneNumber, [status])
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
                      <button
                        onClick={() => handleDelete(cmd._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Icon
                          icon="material-symbols:delete"
                          width={18}
                          height={18}
                        />
                      </button>
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
