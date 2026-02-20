"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { fetchAnnees, fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchSections } from "@/app/actions/section.actions";
import { fetchSubscriptionsByPromotion } from "@/app/actions/subscription.actions";
import StudentDataTable from "@/app/components/StudentDataTable";
import AcademicSidebar from "@/app/components/AcademicSidebar";
import type {
  AnneeType,
  SectionType,
  ProgrammeType,
  PromotionSelection,
} from "@/app/components/AcademicSidebar";

export default function StudentsPage() {
  const [annees, setAnnees] = useState<AnneeType[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneeType | null>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(
    null,
  );
  const [expandedFiliere, setExpandedFiliere] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionSelection | null>(null);
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

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSetSelectedSection = (section: SectionType | null) => {
    setSelectedSection(section);
    setExpandedFiliere(null);
    setSelectedPromotion(null);
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
      <AcademicSidebar
        annees={annees}
        sections={sections}
        selectedAnnee={selectedAnnee}
        selectedSection={selectedSection}
        expandedFiliere={expandedFiliere}
        selectedPromotion={selectedPromotion}
        onSelectedAnnee={setSelectedAnnee}
        onSelectedSection={handleSetSelectedSection}
        onExpandedFiliere={(filiereId) =>
          setExpandedFiliere((prev) => (prev === filiereId ? null : filiereId))
        }
        onSelectedPromotion={setSelectedPromotion}
      />

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
