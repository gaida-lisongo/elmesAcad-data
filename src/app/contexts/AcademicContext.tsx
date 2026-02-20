"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchAnnees, fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchSections } from "@/app/actions/section.actions";
import type {
  AnneeType,
  SectionType,
  FiliereType,
  ProgrammeType,
  PromotionSelection,
} from "@/app/components/AcademicSidebar";

interface AcademicContextValue {
  // Data
  annees: AnneeType[];
  sections: SectionType[];

  // Selected items
  selectedAnnee: AnneeType | null;
  selectedSection: SectionType | null;
  expandedFiliere: string | null;
  selectedPromotion: PromotionSelection | null;
  selectedProgramme: ProgrammeType | null;

  // Setters
  setSelectedAnnee: (annee: AnneeType | null) => void;
  setSelectedSection: (section: SectionType | null) => void;
  setExpandedFiliere: (filiereId: string | null) => void;
  setSelectedPromotion: (
    promotion: PromotionSelection | null,
    programme?: ProgrammeType,
  ) => void;

  // Loading state
  isLoading: boolean;
}

const AcademicContext = createContext<AcademicContextValue | undefined>(
  undefined,
);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [annees, setAnnees] = useState<AnneeType[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<AnneeType | null>(null);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(
    null,
  );
  const [expandedFiliere, setExpandedFiliere] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotionState] =
    useState<PromotionSelection | null>(null);
  const [selectedProgramme, setSelectedProgramme] =
    useState<ProgrammeType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

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
              if (firstProgramme._id) {
                setSelectedPromotionState({
                  id: firstProgramme._id,
                  name: `${firstProgramme.niveau} - ${firstProgramme.designation}`,
                  sectionId: firstSection._id,
                  filiereId: firstFiliere._id || "",
                });
                setSelectedProgramme(firstProgramme);
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

  const handleSetSelectedSection = (section: SectionType | null) => {
    setSelectedSection(section);
    setExpandedFiliere(null);
    setSelectedPromotionState(null);
    setSelectedProgramme(null);
  };

  const handleSetSelectedPromotion = (
    promotion: PromotionSelection | null,
    programme?: ProgrammeType,
  ) => {
    setSelectedPromotionState(promotion);
    setSelectedProgramme(programme || null);
  };

  const value: AcademicContextValue = {
    annees,
    sections,
    selectedAnnee,
    selectedSection,
    expandedFiliere,
    selectedPromotion,
    selectedProgramme,
    setSelectedAnnee,
    setSelectedSection: handleSetSelectedSection,
    setExpandedFiliere,
    setSelectedPromotion: handleSetSelectedPromotion,
    isLoading,
  };

  return (
    <AcademicContext.Provider value={value}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademicContext() {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error(
      "useAcademicContext must be used within an AcademicProvider",
    );
  }
  return context;
}
