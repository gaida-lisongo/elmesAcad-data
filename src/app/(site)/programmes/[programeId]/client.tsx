"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import UniteCard from "@/app/components/UniteCard";
import {
  addPlanningToHoraire,
  updatePlanningInHoraire,
  removePlanningFromHoraire,
  createHoraire,
  deleteHoraire,
} from "@/app/actions/horaire.actions";

interface ProgrammeClientProps {
  programme: any;
  filiere: any;
  section: any;
  horaires: any[];
  anneeActive: any;
  totalSemestres: number;
  totalCredits: number;
  totalUnites: number;
}

export default function ProgrammeClient({
  programme,
  filiere,
  section,
  horaires: initialHoraires,
  anneeActive,
  totalSemestres,
  totalCredits,
  totalUnites,
}: ProgrammeClientProps) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("cours");
  const [horaires, setHoraires] = useState(initialHoraires);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedHoraire, setSelectedHoraire] = useState<any>(null);
  const [planningFormData, setPlanningFormData] = useState({
    debut: "",
    fin: "",
    description: "",
    elementId: "",
    isActive: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    { id: "cours", label: "Cours", icon: "solar:book-outline" },
    { id: "stages", label: "Stages", icon: "solar:case-outline" },
    { id: "sujets", label: "Sujets", icon: "solar:document-text-outline" },
    { id: "sessions", label: "Sessions", icon: "solar:calendar-outline" },
  ];

  const formatDate = (date: string | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddPlanning = async () => {
    if (!selectedHoraire || !planningFormData.debut || !planningFormData.fin) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addPlanningToHoraire(selectedHoraire._id, {
        ...planningFormData,
        debut: new Date(planningFormData.debut),
        fin: new Date(planningFormData.fin),
      });

      if (!result.success) {
        alert(result.error || "Erreur lors de l'ajout du planning");
        return;
      }

      alert("Planning ajouté avec succès");
      setShowPlanningModal(false);
      setPlanningFormData({
        debut: "",
        fin: "",
        description: "",
        elementId: "",
        isActive: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("Error adding planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlanning = async (
    horaireId: string,
    planningId: string,
  ) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce planning ?")) return;

    setIsSubmitting(true);
    try {
      const result = await removePlanningFromHoraire(horaireId, planningId);

      if (!result.success) {
        alert(result.error || "Erreur lors de la suppression");
        return;
      }

      alert("Planning supprimé avec succès");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlanningStatus = async (
    horaireId: string,
    planningId: string,
    currentStatus: boolean,
  ) => {
    setIsSubmitting(true);
    try {
      const result = await updatePlanningInHoraire(horaireId, planningId, {
        isActive: !currentStatus,
      });

      if (!result.success) {
        alert(result.error || "Erreur lors de la mise à jour");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating planning:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render all unites from all semestres
  const renderCours = () => {
    if (!programme.semestres || programme.semestres.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:book-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucune unité d'enseignement disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {programme.semestres.map((semestre: any, idx: number) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-midnight_text flex items-center gap-2">
                <Icon icon="solar:notebook-minimalistic-outline" width={24} />
                {semestre.designation}
              </h3>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {semestre.credit} Crédits
              </span>
            </div>

            {semestre.unites && semestre.unites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {semestre.unites.map((unite: any, uniteIdx: number) => (
                  <div
                    key={uniteIdx}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${uniteIdx * 50}ms` }}
                  >
                    <UniteCard unite={unite} showActions={false} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Aucune unité dans ce semestre
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStages = () => {
    return (
      <div className="text-center py-10 text-gray-500">
        <Icon
          icon="solar:case-outline"
          className="text-6xl mx-auto mb-4 text-gray-400"
        />
        <p>Stages à venir - En développement</p>
      </div>
    );
  };

  const renderSujets = () => {
    return (
      <div className="text-center py-10 text-gray-500">
        <Icon
          icon="solar:document-text-outline"
          className="text-6xl mx-auto mb-4 text-gray-400"
        />
        <p>Sujets à venir - En développement</p>
      </div>
    );
  };

  const renderSessions = () => {
    return (
      <div className="text-center py-10 text-gray-500">
        <Icon
          icon="solar:calendar-outline"
          className="text-6xl mx-auto mb-4 text-gray-400"
        />
        <p>Sessions à venir - En développement</p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Section 2/5 - Horaires */}
      <div className="lg:col-span-2 space-y-4">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
            <Icon
              icon="solar:notebook-minimalistic-outline"
              className="text-3xl mb-2"
            />
            <p className="text-3xl font-bold">{totalSemestres}</p>
            <p className="text-sm opacity-90">Semestres</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-md">
            <Icon icon="solar:book-outline" className="text-3xl mb-2" />
            <p className="text-3xl font-bold">{totalUnites}</p>
            <p className="text-sm opacity-90">Unités</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md col-span-2">
            <Icon icon="solar:star-outline" className="text-3xl mb-2" />
            <p className="text-3xl font-bold">{totalCredits}</p>
            <p className="text-sm opacity-90">Crédits Totaux</p>
          </div>
        </div>

        {/* Horaires Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-midnight_text flex items-center gap-2">
              <Icon icon="solar:calendar-outline" width={24} />
              Horaires de l'année
            </h3>
            {mounted && hydrated && isAuthenticated() && (
              <button
                onClick={() => alert("Créer horaire - À implémenter")}
                className="text-primary hover:text-primary/80 text-sm flex items-center gap-1"
              >
                <Icon icon="material-symbols:add" width={18} />
                Ajouter
              </button>
            )}
          </div>

          {anneeActive ? (
            <div className="mb-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">
                Année académique : {anneeActive.designation}
              </p>
              <p className="text-xs text-gray-600">
                {formatDate(anneeActive.debut)} - {formatDate(anneeActive.fin)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">
              Aucune année académique active
            </p>
          )}

          {horaires.length > 0 ? (
            <div className="space-y-3">
              {horaires.map((horaire: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-midnight_text">
                        Semestre {horaire.semestreId}
                      </p>
                    </div>
                    {mounted && hydrated && isAuthenticated() && (
                      <button
                        onClick={() => {
                          setSelectedHoraire(horaire);
                          setShowPlanningModal(true);
                        }}
                        className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                      >
                        <Icon icon="material-symbols:add" width={16} />
                      </button>
                    )}
                  </div>

                  {horaire.planing && horaire.planing.length > 0 ? (
                    <div className="space-y-2">
                      {horaire.planing.map((plan: any, planIdx: number) => (
                        <div
                          key={planIdx}
                          className={`text-xs p-3 rounded-lg ${
                            plan.isActive
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium">
                              {plan.description || "Sans description"}
                            </p>
                            {mounted && hydrated && isAuthenticated() && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    togglePlanningStatus(
                                      horaire._id,
                                      plan._id,
                                      plan.isActive,
                                    )
                                  }
                                  className="text-primary hover:text-primary/80"
                                  title={
                                    plan.isActive ? "Désactiver" : "Activer"
                                  }
                                >
                                  <Icon
                                    icon={
                                      plan.isActive
                                        ? "solar:eye-outline"
                                        : "solar:eye-closed-outline"
                                    }
                                    width={16}
                                  />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeletePlanning(horaire._id, plan._id)
                                  }
                                  className="text-red-500 hover:text-red-600"
                                  disabled={isSubmitting}
                                  title="Supprimer"
                                >
                                  <Icon
                                    icon="material-symbols:delete"
                                    width={16}
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600">
                            {formatDate(plan.debut)} - {formatDate(plan.fin)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Aucun planning</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucun horaire disponible
            </p>
          )}
        </div>
      </div>

      {/* Section 3/5 - Tabs Content */}
      <div className="lg:col-span-3">
        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition ${
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                <Icon icon={tab.icon} width={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {activeTab === "cours" && renderCours()}
          {activeTab === "stages" && renderStages()}
          {activeTab === "sujets" && renderSujets()}
          {activeTab === "sessions" && renderSessions()}
        </div>
      </div>

      {/* Modal Add Planning */}
      {showPlanningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-midnight_text">
                Ajouter un planning
              </h3>
              <button
                onClick={() => setShowPlanningModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="material-symbols:close" width={24} height={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="datetime-local"
                  value={planningFormData.debut}
                  onChange={(e) =>
                    setPlanningFormData({
                      ...planningFormData,
                      debut: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin *
                </label>
                <input
                  type="datetime-local"
                  value={planningFormData.fin}
                  onChange={(e) =>
                    setPlanningFormData({
                      ...planningFormData,
                      fin: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={planningFormData.description}
                  onChange={(e) =>
                    setPlanningFormData({
                      ...planningFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Description du planning..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={planningFormData.isActive}
                  onChange={(e) =>
                    setPlanningFormData({
                      ...planningFormData,
                      isActive: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary"
                  disabled={isSubmitting}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Actif
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPlanningModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAddPlanning}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="eos-icons:loading" width={20} height={20} />
                    Ajout...
                  </span>
                ) : (
                  "Ajouter"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
