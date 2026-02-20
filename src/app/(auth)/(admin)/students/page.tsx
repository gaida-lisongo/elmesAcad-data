"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { fetchAnnees, fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchSections } from "@/app/actions/section.actions";
import { fetchSubscriptionsByPromotion } from "@/app/actions/subscription.actions";
import StudentDataTable from "@/app/components/StudentDataTable";

interface Annee {
  _id: string;
  debut: string | Date;
  fin: string | Date;
  isActive: boolean;
}

interface Programme {
  _id?: string;
  niveau: string;
  designation: string;
  description: string[];
}

interface Filiere {
  _id?: string;
  sigle: string;
  designation: string;
  description: string[];
  programmes?: Programme[];
}

interface Section {
  _id: string;
  mention: string;
  designation: string;
  mission: string;
  promesses: string[];
  filieres?: Filiere[];
}

export default function StudentsPage() {
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<Annee | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [expandedFiliere, setExpandedFiliere] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<{
    id: string;
    name: string;
    sectionId: string;
    filiereId: string;
  } | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedPromotion && selectedAnnee) {
      loadStudents();
    }
  }, [selectedPromotion, selectedAnnee, refreshKey]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load annees
      const anneesResult = await fetchAnnees();
      if (anneesResult.success && anneesResult.data) {
        setAnnees(anneesResult.data);

        // Try to get active annee
        const activeResult = await fetchAnneeActive();
        if (activeResult.success && activeResult.data) {
          setSelectedAnnee(activeResult.data);
        } else if (anneesResult.data.length > 0) {
          setSelectedAnnee(anneesResult.data[0]);
        }
      }

      // Load sections
      const sectionsResult = await fetchSections();
      if (sectionsResult.success && sectionsResult.data) {
        setSections(sectionsResult.data);
        if (sectionsResult.data.length > 0) {
          const firstSection = sectionsResult.data[0];
          setSelectedSection(firstSection);

          // Auto-expand first filiere and select first promotion
          if (firstSection.filieres && firstSection.filieres.length > 0) {
            const firstFiliere = firstSection.filieres[0];
            setExpandedFiliere(firstFiliere._id || firstFiliere.designation);

            if (firstFiliere.programmes && firstFiliere.programmes.length > 0) {
              const firstProgramme = firstFiliere.programmes[0];
              console.log("Auto-selecting first promotion:", {
                id: firstProgramme._id,
                name: firstProgramme.designation,
                niveau: firstProgramme.niveau,
              });
              if (firstProgramme._id) {
                setSelectedPromotion({
                  id: firstProgramme._id,
                  name: `${firstProgramme.niveau} - ${firstProgramme.designation}`,
                  sectionId: firstSection._id,
                  filiereId: firstFiliere._id || "",
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async () => {
    if (!selectedPromotion || !selectedAnnee) return;

    console.log("Loading students for:", {
      promotionId: selectedPromotion.id,
      promotionName: selectedPromotion.name,
      anneeId: selectedAnnee._id,
    });

    try {
      const result = await fetchSubscriptionsByPromotion(
        selectedPromotion.id,
        selectedAnnee._id,
      );
      console.log("Fetched students:", result);
      if (result.success && result.data) {
        // Transform data to match EnrolledStudent structure
        const transformedData = result.data.map((item: any) => ({
          _id: item._id,
          subscription: {
            _id: item._id,
            isValid: item.isValid,
          },
          etudiant: item.etudiant,
        }));
        setStudents(transformedData);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const handleSelectPromotion = (
    programme: Programme,
    sectionId: string,
    filiereId: string,
  ) => {
    console.log("Selecting promotion:", {
      id: programme._id,
      name: programme.designation,
      niveau: programme.niveau,
    });

    if (!programme._id) {
      console.error("Programme has no _id:", programme);
      alert("Erreur: Cette promotion n'a pas d'identifiant valide");
      return;
    }

    setSelectedPromotion({
      id: programme._id,
      name: `${programme.niveau} - ${programme.designation}`,
      sectionId,
      filiereId,
    });
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
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
    <div className="-mx-6 -my-6 flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 p-6 overflow-y-auto sticky top-0 h-screen">
        {/* Année académique selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Année académique
          </label>
          <select
            value={selectedAnnee?._id || ""}
            onChange={(e) => {
              const annee = annees.find((a) => a._id === e.target.value);
              setSelectedAnnee(annee || null);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
          >
            {annees.map((annee) => (
              <option key={annee._id} value={annee._id}>
                {new Date(annee.debut).getFullYear()} -{" "}
                {new Date(annee.fin).getFullYear()}
                {annee.isActive && " (Active)"}
              </option>
            ))}
          </select>
        </div>

        {/* Sections and Filieres */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Sections & Filières
          </h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <div key={section._id}>
                {/* Section Header */}
                <button
                  onClick={() => setSelectedSection(section)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    selectedSection?._id === section._id
                      ? "bg-primary text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {section.mention}
                </button>

                {/* Filieres (shown only for selected section) */}
                {selectedSection?._id === section._id &&
                  section.filieres &&
                  section.filieres.length > 0 && (
                    <div className="mt-2 ml-4 space-y-2">
                      {section.filieres.map((filiere) => {
                        const filiereId = filiere._id || filiere.designation;
                        const isExpanded = expandedFiliere === filiereId;

                        return (
                          <div key={filiereId}>
                            {/* Filiere Header */}
                            <button
                              onClick={() =>
                                setExpandedFiliere(
                                  isExpanded ? null : filiereId,
                                )
                              }
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                              <span>{filiere.sigle}</span>
                              <Icon
                                icon={
                                  isExpanded
                                    ? "material-symbols:expand-less"
                                    : "material-symbols:expand-more"
                                }
                                width={20}
                                height={20}
                              />
                            </button>

                            {/* Programmes (shown when expanded) */}
                            {isExpanded &&
                              filiere.programmes &&
                              filiere.programmes.length > 0 && (
                                <div className="mt-1 ml-4 space-y-1">
                                  {filiere.programmes.map((programme) => (
                                    <button
                                      key={
                                        programme._id || programme.designation
                                      }
                                      onClick={() =>
                                        handleSelectPromotion(
                                          programme,
                                          section._id,
                                          filiereId,
                                        )
                                      }
                                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                        selectedPromotion?.id === programme._id
                                          ? "bg-primary/10 text-primary font-medium"
                                          : "text-gray-600 hover:bg-gray-50"
                                      }`}
                                    >
                                      <div className="font-medium">
                                        {programme.niveau}
                                      </div>
                                      <div className="text-xs opacity-75">
                                        {programme.designation}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedPromotion && selectedAnnee ? (
          <StudentDataTable
            initialStudents={students}
            promotionId={selectedPromotion.id}
            promotionName={selectedPromotion.name}
            anneeId={selectedAnnee._id}
            anneeName={`${new Date(selectedAnnee.debut).getFullYear()} - ${new Date(selectedAnnee.fin).getFullYear()}`}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon
                icon="material-symbols:school-outline"
                width={64}
                height={64}
                className="text-gray-300 mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sélectionnez une promotion
              </h3>
              <p className="text-gray-500">
                Choisissez une section, filière et promotion dans le menu de
                gauche
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
