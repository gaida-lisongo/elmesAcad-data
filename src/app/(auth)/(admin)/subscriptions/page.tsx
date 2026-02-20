"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  fetchAllSubscriptionsWithDetails,
  updateSubscriptionDocumentStatus,
  updateSubscriptionValidation,
} from "@/app/actions/subscription.actions";

interface Document {
  title: string;
  url: string;
  statut: string;
}

interface SubscriptionDetail {
  _id: string;
  etudiant: {
    _id: string;
    nomComplet: string;
    email: string;
    telephone?: string;
    matricule?: string;
  };
  promotion: any;
  annee: {
    _id: string;
    debut: Date;
    fin: Date;
  };
  isValid: boolean;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

const STATUT_OPTIONS = [
  { value: "en_attente", label: "En attente", color: "orange" },
  { value: "valide", label: "Validé", color: "green" },
  { value: "rejete", label: "Rejeté", color: "red" },
];

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDetail[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    SubscriptionDetail[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, filterStatus]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllSubscriptionsWithDetails();
      if (result.success && result.data) {
        setSubscriptions(result.data);
      }
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sub) =>
          sub.etudiant.nomComplet.toLowerCase().includes(searchLower) ||
          sub.etudiant.email.toLowerCase().includes(searchLower) ||
          (sub.etudiant.matricule &&
            sub.etudiant.matricule.toLowerCase().includes(searchLower)),
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      if (filterStatus === "valid") {
        filtered = filtered.filter((sub) => sub.isValid);
      } else if (filterStatus === "invalid") {
        filtered = filtered.filter((sub) => !sub.isValid);
      } else if (filterStatus === "pending") {
        filtered = filtered.filter(
          (sub) =>
            sub.documents &&
            sub.documents.some((doc) => doc.statut === "en_attente"),
        );
      }
    }

    setFilteredSubscriptions(filtered);
  };

  const handleOpenModal = (subscription: SubscriptionDetail) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleUpdateDocumentStatus = async (
    documentIndex: number,
    newStatut: string,
  ) => {
    if (!selectedSubscription) return;

    try {
      const result = await updateSubscriptionDocumentStatus(
        selectedSubscription._id,
        documentIndex,
        newStatut,
      );

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      // Reload subscriptions
      loadSubscriptions();

      // Update modal data
      if (result.data) {
        const updated = subscriptions.find(
          (s) => s._id === selectedSubscription._id,
        );
        if (updated) {
          setSelectedSubscription({
            ...updated,
            documents: result.data.documents,
          });
        }
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      alert("Une erreur est survenue");
    }
  };

  const handleToggleValidation = async (
    subscriptionId: string,
    currentStatus: boolean,
  ) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir ${currentStatus ? "invalider" : "valider"} cette inscription ?`,
      )
    )
      return;

    try {
      const result = await updateSubscriptionValidation(
        subscriptionId,
        !currentStatus,
      );

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      loadSubscriptions();
    } catch (error) {
      console.error("Error updating validation:", error);
      alert("Une erreur est survenue");
    }
  };

  const getStatutColor = (statut: string) => {
    const option = STATUT_OPTIONS.find((opt) => opt.value === statut);
    return option?.color || "gray";
  };

  const getStatutLabel = (statut: string) => {
    const option = STATUT_OPTIONS.find((opt) => opt.value === statut);
    return option?.label || statut;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon
            icon="material-symbols:progress-activity"
            width={48}
            height={48}
            className="text-primary animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-6">
      <div className="container">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2 text-black">
            Gestion des inscriptions
          </h1>
          <p className="text-gray-600">
            Validez les dossiers et documents des étudiants
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Icon
              icon="material-symbols:search"
              width={20}
              height={20}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="valid">Validées</option>
            <option value="invalid">Non validées</option>
            <option value="pending">Documents en attente</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscriptions.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon
                  icon="material-symbols:description"
                  width={24}
                  height={24}
                  className="text-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validées</p>
                <p className="text-2xl font-bold text-green-600">
                  {subscriptions.filter((s) => s.isValid).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon
                  icon="material-symbols:check-circle"
                  width={24}
                  height={24}
                  className="text-green-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non validées</p>
                <p className="text-2xl font-bold text-red-600">
                  {subscriptions.filter((s) => !s.isValid).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon
                  icon="material-symbols:cancel"
                  width={24}
                  height={24}
                  className="text-red-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    subscriptions.filter(
                      (s) =>
                        s.documents &&
                        s.documents.some((d) => d.statut === "en_attente"),
                    ).length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon
                  icon="material-symbols:pending"
                  width={24}
                  height={24}
                  className="text-orange-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Étudiant
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Matricule
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Promotion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Année
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Documents
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Aucune inscription trouvée
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <tr
                      key={subscription._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon
                              icon="material-symbols:person"
                              width={20}
                              height={20}
                              className="text-primary"
                            />
                          </div>
                          <span className="font-medium text-gray-900">
                            {subscription.etudiant.nomComplet}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {subscription.etudiant.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {subscription.etudiant.matricule || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {subscription.promotion?.niveau ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {subscription.promotion.niveau}
                            </div>
                            <div className="text-xs text-gray-500">
                              {subscription.promotion.filiere?.sigle}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(subscription.annee.debut).getFullYear()} -{" "}
                        {new Date(subscription.annee.fin).getFullYear()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          <Icon
                            icon="material-symbols:folder"
                            width={14}
                            height={14}
                          />
                          {subscription.documents?.length || 0} document(s)
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            subscription.isValid
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              subscription.isValid
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          {subscription.isValid ? "Validée" : "Non validée"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleOpenModal(subscription)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            title="Gérer les documents"
                          >
                            <Icon
                              icon="material-symbols:folder-open"
                              width={18}
                              height={18}
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleValidation(
                                subscription._id,
                                subscription.isValid,
                              )
                            }
                            className={`p-2 rounded-lg transition ${
                              subscription.isValid
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            title={
                              subscription.isValid
                                ? "Invalider l'inscription"
                                : "Valider l'inscription"
                            }
                          >
                            <Icon
                              icon={
                                subscription.isValid
                                  ? "material-symbols:cancel"
                                  : "material-symbols:check-circle"
                              }
                              width={18}
                              height={18}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documents Modal */}
        {isModalOpen && selectedSubscription && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg px-8 pt-14 pb-8 bg-white max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleCloseModal}
                className="absolute top-0 right-0 mr-4 mt-8 hover:cursor-pointer"
                aria-label="Close Modal"
              >
                <Icon
                  icon="material-symbols:close-rounded"
                  width={24}
                  height={24}
                  className="text-black hover:text-primary"
                />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Dossier de {selectedSubscription.etudiant.nomComplet}
                </h2>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <Icon
                      icon="material-symbols:mail"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {selectedSubscription.etudiant.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <Icon
                      icon="material-symbols:badge"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {selectedSubscription.etudiant.matricule ||
                      "Pas de matricule"}
                  </p>
                  {selectedSubscription.promotion?.niveau && (
                    <p className="text-sm text-gray-600">
                      <Icon
                        icon="material-symbols:school"
                        width={16}
                        height={16}
                        className="inline mr-1"
                      />
                      <span className="font-medium">
                        {selectedSubscription.promotion.niveau}
                      </span>
                      {" - "}
                      {selectedSubscription.promotion.designation}
                      {selectedSubscription.promotion.filiere && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({selectedSubscription.promotion.filiere.sigle})
                        </span>
                      )}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <Icon
                      icon="material-symbols:calendar-month"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    Année:{" "}
                    {new Date(selectedSubscription.annee.debut).getFullYear()} -{" "}
                    {new Date(selectedSubscription.annee.fin).getFullYear()}
                  </p>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-4">
                {!selectedSubscription.documents ||
                selectedSubscription.documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon
                      icon="material-symbols:folder-off"
                      width={48}
                      height={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p>Aucun document fourni</p>
                  </div>
                ) : (
                  selectedSubscription.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Icon
                              icon="material-symbols:description"
                              width={20}
                              height={20}
                              className="text-gray-400"
                            />
                            <h3 className="font-medium text-gray-900">
                              {doc.title}
                            </h3>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            <Icon
                              icon="material-symbols:link"
                              width={16}
                              height={16}
                            />
                            Voir le document
                          </a>
                        </div>

                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              doc.statut === "valide"
                                ? "bg-green-100 text-green-700"
                                : doc.statut === "rejete"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {getStatutLabel(doc.statut)}
                          </span>

                          <select
                            value={doc.statut}
                            onChange={(e) =>
                              handleUpdateDocumentStatus(index, e.target.value)
                            }
                            className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                          >
                            {STATUT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
