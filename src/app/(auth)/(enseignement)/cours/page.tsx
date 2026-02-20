"use client";

import { useState } from "react";
import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";
import SemestreManager from "@/app/components/SemestreManager";

export default function CoursPage() {
  const {
    selectedAnnee,
    selectedSection,
    selectedPromotion,
    selectedProgramme,
  } = useAcademicContext();
  const [refreshKey, setRefreshKey] = useState(0);

  // If no promotion is selected, show a message
  if (!selectedPromotion || !selectedAnnee) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
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
            Choisissez une section, filière et promotion dans le menu de gauche
          </p>
        </div>
      </div>
    );
  }

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1);
    // Force re-fetch from context if needed
    window.location.reload();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon
              icon="material-symbols:book"
              className="text-primary text-4xl"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-midnight_text">
              Cours & Matières
            </h1>
            <p className="text-gray-600 mt-1">{selectedPromotion.name}</p>
          </div>
        </div>

        {/* Context Info */}
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Année académique</p>
              <p className="font-semibold text-gray-800">
                {new Date(selectedAnnee.debut).getFullYear()} -{" "}
                {new Date(selectedAnnee.fin).getFullYear()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Section</p>
              <p className="font-semibold text-gray-800">
                {selectedSection?.mention}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Promotion</p>
              <p className="font-semibold text-gray-800">
                {selectedPromotion.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Programme Details */}
      {selectedProgramme && selectedProgramme.description && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-midnight_text mb-4">
            Description du programme
          </h2>
          <ul className="space-y-2">
            {selectedProgramme.description.map((desc, index) => (
              <li key={index} className="flex items-start gap-3">
                <Icon
                  icon="material-symbols:check-circle"
                  className="text-primary text-xl flex-shrink-0 mt-0.5"
                />
                <span className="text-gray-700">{desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Semestre Manager */}
      <SemestreManager
        key={refreshKey}
        promotionId={selectedPromotion.id}
        initialSemestres={selectedProgramme?.semestres || []}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
