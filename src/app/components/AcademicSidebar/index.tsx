"use client";

import { Icon } from "@iconify/react";

export interface AnneeType {
  _id: string;
  debut: string | Date;
  fin: string | Date;
  isActive: boolean;
}

export interface ProgrammeType {
  _id?: string;
  niveau: string;
  designation: string;
  description: string[];
  semestres?: {
    designation: string;
    credit: number;
    unites: any[];
  }[];
}

export interface FiliereType {
  _id?: string;
  sigle: string;
  designation: string;
  description: string[];
  programmes?: ProgrammeType[];
}

export interface SectionType {
  _id: string;
  mention: string;
  designation: string;
  mission: string;
  promesses: string[];
  filieres?: FiliereType[];
}

export interface PromotionSelection {
  id: string;
  name: string;
  sectionId: string;
  filiereId: string;
}

interface AcademicSidebarProps {
  annees: AnneeType[];
  sections: SectionType[];
  selectedAnnee: AnneeType | null;
  selectedSection: SectionType | null;
  expandedFiliere: string | null;
  selectedPromotion: PromotionSelection | null;
  onSelectedAnnee: (annee: AnneeType | null) => void;
  onSelectedSection: (section: SectionType | null) => void;
  onExpandedFiliere: (filiereId: string | null) => void;
  onSelectedPromotion: (
    promotion: PromotionSelection | null,
    programme?: ProgrammeType,
  ) => void;
}

export default function AcademicSidebar({
  annees,
  sections,
  selectedAnnee,
  selectedSection,
  expandedFiliere,
  selectedPromotion,
  onSelectedAnnee,
  onSelectedSection,
  onExpandedFiliere,
  onSelectedPromotion,
}: AcademicSidebarProps) {
  const handleSelectPromotion = (
    programme: ProgrammeType,
    sectionId: string,
    filiereId: string,
  ) => {
    if (!programme._id) {
      console.error("Programme has no _id:", programme);
      return;
    }

    const promotion: PromotionSelection = {
      id: programme._id,
      name: `${programme.niveau} - ${programme.designation}`,
      sectionId,
      filiereId,
    };

    onSelectedPromotion(promotion, programme);
  };

  return (
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
            onSelectedAnnee(annee || null);
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
                onClick={() => onSelectedSection(section)}
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
                              onExpandedFiliere(isExpanded ? null : filiereId)
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
                                    key={programme._id || programme.designation}
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
  );
}
