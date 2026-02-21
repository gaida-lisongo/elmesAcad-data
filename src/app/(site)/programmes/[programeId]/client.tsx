"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import UniteCard from "@/app/components/UniteCard";
import HoraireModal from "@/app/components/Modals/HoraireModal";
import PlanningModal from "@/app/components/Modals/PlanningModal";
import DeleteModal from "@/app/components/Modals/DeleteModal";
import { updatePlanningInHoraire } from "@/app/actions/horaire.actions";

interface ProgrammeClientProps {
  programme: any;
  filiere: any;
  section: any;
  horaires: any[];
  anneeActive: any;
  stages: any[];
  sujets: any[];
  enrollements: any[];
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
  stages,
  sujets,
  enrollements,
  totalSemestres,
  totalCredits,
  totalUnites,
}: ProgrammeClientProps) {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("cours");
  const [horaires, setHoraires] = useState(initialHoraires);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showHoraireModal, setShowHoraireModal] = useState(false);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSemestre, setSelectedSemestre] = useState<string | null>(null);
  const [selectedHoraire, setSelectedHoraire] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    horaireId: string;
    planningId: string;
    description?: string;
  } | null>(null);

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
              <div className="space-y-3">
                {semestre.unites.map((unite: any, uniteIdx: number) => (
                  <div
                    key={uniteIdx}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${uniteIdx * 50}ms` }}
                  >
                    <UniteCard item={unite} type="unite" showActions={false} />
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
    if (!anneeActive) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:case-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucune année académique active</p>
        </div>
      );
    }

    if (stages.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:case-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucun stage disponible pour cette promotion</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {stages.map((stage: any, idx: number) => (
          <div
            key={idx}
            className="animate-fadeInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <UniteCard item={stage} type="stage" showActions={false} />
          </div>
        ))}
      </div>
    );
  };

  const renderSujets = () => {
    if (!anneeActive) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:document-text-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucune année académique active</p>
        </div>
      );
    }

    if (sujets.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:document-text-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucun sujet disponible pour cette promotion</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {sujets.map((sujet: any, idx: number) => (
          <div
            key={idx}
            className="animate-fadeInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <UniteCard item={sujet} type="sujet" showActions={false} />
          </div>
        ))}
      </div>
    );
  };

  const renderSessions = () => {
    if (!anneeActive) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:calendar-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucune année académique active</p>
        </div>
      );
    }

    if (enrollements.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <Icon
            icon="solar:calendar-outline"
            className="text-6xl mx-auto mb-4 text-gray-400"
          />
          <p>Aucune session disponible pour cette promotion</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {enrollements.map((enrollement: any, idx: number) => (
          <div
            key={idx}
            className="animate-fadeInUp"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <UniteCard
              item={enrollement}
              type="enrollement"
              showActions={false}
            />
          </div>
        ))}
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
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-bold text-midnight_text flex items-center gap-2">
              <Icon icon="solar:calendar-outline" width={24} />
              Horaires de l'année
            </h3>
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

          <div className="space-y-3">
            {programme.semestres?.map((semestre: any, idx: number) => {
              const semestreNum = semestre?._id;
              const horaire = horaires.find(
                (h: any) => String(h.semestreId) === String(semestreNum),
              );

              return (
                <div
                  key={semestreNum}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-sm text-midnight_text">
                        {semestre.designation}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {semestre.credit} crédits
                      </p>
                    </div>
                    {mounted && hydrated && isAuthenticated() && (
                      <>
                        {horaire ? (
                          <button
                            onClick={() => {
                              setSelectedHoraire(horaire);
                              setShowPlanningModal(true);
                            }}
                            className="text-primary hover:text-primary/80 text-xs flex items-center gap-1"
                            disabled={isSubmitting}
                          >
                            <Icon icon="material-symbols:add" width={16} />
                            Planning
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSemestre(semestreNum);
                              setShowHoraireModal(true);
                            }}
                            className="text-white bg-primary hover:bg-primary/90 text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                            disabled={isSubmitting}
                          >
                            <Icon icon="material-symbols:add" width={16} />
                            Créer horaire
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {horaire ? (
                    horaire.planing && horaire.planing.length > 0 ? (
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
                                    onClick={() => {
                                      setDeleteTarget({
                                        horaireId: horaire._id,
                                        planningId: plan._id,
                                        description: plan.description,
                                      });
                                      setShowDeleteModal(true);
                                    }}
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
                    )
                  ) : (
                    <p className="text-xs text-gray-500">
                      Créez un horaire pour ajouter des plannings
                    </p>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Modals */}
      <HoraireModal
        isOpen={showHoraireModal}
        onClose={() => {
          setShowHoraireModal(false);
          setSelectedSemestre(null);
        }}
        anneeId={anneeActive?._id || ""}
        promotionId={programme._id}
        semestreId={selectedSemestre || ""}
        semestreDesignation={
          programme.semestres?.find((s: any) => s._id === selectedSemestre)
            ?.designation
        }
        semestreCredit={
          programme.semestres?.find((s: any) => s._id === selectedSemestre)
            ?.credit
        }
        anneeDesignation={`${new Date(anneeActive?.debut || "").getFullYear()} - ${new Date(anneeActive?.fin || "").getFullYear()}`}
        unites={
          programme.semestres?.find((s: any) => s._id === selectedSemestre)
            ?.unites || []
        }
      />

      <PlanningModal
        isOpen={showPlanningModal}
        onClose={() => {
          setShowPlanningModal(false);
          setSelectedHoraire(null);
        }}
        horaireId={selectedHoraire?._id || ""}
        semestreDesignation={
          programme.semestres?.find(
            (s: any) => String(s._id) === String(selectedHoraire?.semestreId),
          )?.designation
        }
        semestreCredit={
          programme.semestres?.find(
            (s: any) => String(s._id) === String(selectedHoraire?.semestreId),
          )?.credit
        }
        anneeDesignation={`${new Date(anneeActive?.debut || "").getFullYear()} - ${new Date(anneeActive?.fin || "").getFullYear()}`}
        unites={
          programme.semestres?.find(
            (s: any) => String(s._id) === String(selectedHoraire?.semestreId),
          )?.unites || []
        }
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        horaireId={deleteTarget?.horaireId || ""}
        planningId={deleteTarget?.planningId || ""}
        planningDescription={deleteTarget?.description}
      />
    </div>
  );
}
