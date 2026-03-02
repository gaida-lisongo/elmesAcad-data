"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  createResultat,
  updateResultat,
  deleteResultat,
  fetchSubscribeResultatsByResultat,
} from "@/app/actions/jury.actions";

interface PromotionType {
  _id: string;
  niveau: string;
  designation: string;
  filiere: { sigle: string; designation: string };
  section: { mention: string };
}

interface ResultatType {
  _id: string;
  promotionId: string;
  anneeId: string;
  status: "published" | "unpublished";
  amount: number;
  currency: string;
  category: "semestre" | "annee";
  promotion?: PromotionType;
  createdAt?: string;
}

interface AnneeType {
  _id: string;
  debut: string;
  fin: string;
  isActive: boolean;
}

interface SubscribeResultatType {
  _id: string;
  studentId: {
    _id: string;
    nomComplet: string;
    matricule: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

interface ResultatManagerClientProps {
  annee: AnneeType;
  initialResultats: ResultatType[];
  promotions: PromotionType[];
}

export default function ResultatManagerClient({
  annee,
  initialResultats,
  promotions,
}: ResultatManagerClientProps) {
  const [resultats, setResultats] = useState<ResultatType[]>(initialResultats);
  const [selectedResultat, setSelectedResultat] = useState<ResultatType | null>(
    null,
  );
  const [subscriptions, setSubscriptions] = useState<SubscribeResultatType[]>(
    [],
  );
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    promotionId: "",
    amount: 0,
    currency: "USD",
    category: "annee" as "semestre" | "annee",
  });

  const handleCreateResultat = async () => {
    if (!formData.promotionId) return;
    setIsSubmitting(true);

    const res = await createResultat({
      promotionId: formData.promotionId,
      anneeId: annee._id,
      amount: formData.amount,
      currency: formData.currency,
      category: formData.category,
    });

    if (res.success && res.data) {
      const promo = promotions.find((p) => p._id === formData.promotionId);
      setResultats([...resultats, { ...res.data, promotion: promo }]);
      setShowCreateModal(false);
      setFormData({
        promotionId: "",
        amount: 0,
        currency: "USD",
        category: "annee",
      });
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (resultat: ResultatType) => {
    const newStatus =
      resultat.status === "published" ? "unpublished" : "published";
    const res = await updateResultat(resultat._id, { status: newStatus });
    if (res.success) {
      setResultats(
        resultats.map((r) =>
          r._id === resultat._id ? { ...r, status: newStatus } : r,
        ),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce résultat ?")) return;
    const res = await deleteResultat(id);
    if (res.success) {
      setResultats(resultats.filter((r) => r._id !== id));
      if (selectedResultat?._id === id) {
        setSelectedResultat(null);
        setSubscriptions([]);
      }
    }
  };

  const handleSelectResultat = async (resultat: ResultatType) => {
    setSelectedResultat(resultat);
    setLoadingSubscriptions(true);
    const res = await fetchSubscribeResultatsByResultat(resultat._id);
    setSubscriptions(res.success ? res.data || [] : []);
    setLoadingSubscriptions(false);
  };

  const getStatusColor = (status: string) => {
    return status === "published"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
  };

  const getCategoryLabel = (category: string) => {
    return category === "semestre" ? "Semestriel" : "Annuel";
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord - Bureau du Jury
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Année académique: {new Date(annee.debut).getFullYear()} -{" "}
            {new Date(annee.fin).getFullYear()}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
        >
          <Icon icon="mdi:plus" width={20} height={20} />
          Nouveau Résultat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon icon="mdi:clipboard-list" width={24} height={24} />
                Résultats configurés ({resultats.length})
              </h2>
            </div>

            {resultats.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Icon
                  icon="mdi:folder-open-outline"
                  width={48}
                  height={48}
                  className="mx-auto mb-3 opacity-50"
                />
                <p>Aucun résultat configuré pour cette année</p>
                <p className="text-sm mt-1">
                  Cliquez sur "Nouveau Résultat" pour commencer
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {resultats.map((resultat) => (
                  <div
                    key={resultat._id}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      selectedResultat?._id === resultat._id
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                    onClick={() => handleSelectResultat(resultat)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {resultat.promotion?.niveau} -{" "}
                            {resultat.promotion?.designation}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(resultat.status)}`}
                          >
                            {resultat.status === "published"
                              ? "Publié"
                              : "Non publié"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Icon icon="mdi:school" width={16} height={16} />
                            {resultat.promotion?.filiere?.sigle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="mdi:calendar" width={16} height={16} />
                            {getCategoryLabel(resultat.category)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon="mdi:cash" width={16} height={16} />
                            {resultat.amount} {resultat.currency}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(resultat);
                          }}
                          className={`p-2 rounded-lg transition ${
                            resultat.status === "published"
                              ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                          title={
                            resultat.status === "published"
                              ? "Dépublier"
                              : "Publier"
                          }
                        >
                          <Icon
                            icon={
                              resultat.status === "published"
                                ? "mdi:eye-off"
                                : "mdi:eye"
                            }
                            width={20}
                            height={20}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(resultat._id);
                          }}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                          title="Supprimer"
                        >
                          <Icon
                            icon="mdi:trash-can-outline"
                            width={20}
                            height={20}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 sticky top-6">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon icon="mdi:account-group" width={24} height={24} />
                Consultations
              </h2>
            </div>

            {!selectedResultat ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Icon
                  icon="mdi:cursor-default-click"
                  width={40}
                  height={40}
                  className="mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">
                  Sélectionnez un résultat pour voir les consultations
                </p>
              </div>
            ) : loadingSubscriptions ? (
              <div className="p-8 text-center">
                <Icon
                  icon="mdi:loading"
                  width={32}
                  height={32}
                  className="mx-auto animate-spin text-primary"
                />
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Icon
                  icon="mdi:account-off"
                  width={40}
                  height={40}
                  className="mx-auto mb-2 opacity-50"
                />
                <p className="text-sm">Aucune consultation enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {subscriptions.map((sub) => (
                  <div key={sub._id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon
                          icon="mdi:account"
                          width={18}
                          height={18}
                          className="text-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {sub.studentId?.nomComplet}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {sub.studentId?.matricule}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          sub.status === "paid"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : sub.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {sub.status === "paid"
                          ? "Payé"
                          : sub.status === "pending"
                            ? "En attente"
                            : sub.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nouveau Résultat
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <Icon icon="mdi:close" width={20} height={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Promotion
                </label>
                <select
                  value={formData.promotionId}
                  onChange={(e) =>
                    setFormData({ ...formData, promotionId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Sélectionner une promotion</option>
                  {promotions.map((promo) => (
                    <option key={promo._id} value={promo._id}>
                      {promo.niveau} - {promo.designation} (
                      {promo.filiere.sigle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as "semestre" | "annee",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="annee">Annuel</option>
                  <option value="semestre">Semestriel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Devise
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="CDF">CDF</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateResultat}
                disabled={!formData.promotionId || isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <Icon
                    icon="mdi:loading"
                    width={18}
                    height={18}
                    className="animate-spin"
                  />
                )}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
