"use client";

import {
  AcademicProvider,
  useAcademicContext,
} from "@/app/contexts/AcademicContext";
import AcademicSidebar from "@/app/components/AcademicSidebar";
import { Icon } from "@iconify/react";

function EnseignementLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    annees,
    sections,
    selectedAnnee,
    selectedSection,
    expandedFiliere,
    selectedPromotion,
    setSelectedAnnee,
    setSelectedSection,
    setExpandedFiliere,
    setSelectedPromotion,
    isLoading,
  } = useAcademicContext();

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
        onSelectedSection={setSelectedSection}
        onExpandedFiliere={(filiereId) => {
          setExpandedFiliere(expandedFiliere === filiereId ? null : filiereId);
        }}
        onSelectedPromotion={setSelectedPromotion}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

export default function EnseignementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AcademicProvider>
      <EnseignementLayoutContent>{children}</EnseignementLayoutContent>
    </AcademicProvider>
  );
}
