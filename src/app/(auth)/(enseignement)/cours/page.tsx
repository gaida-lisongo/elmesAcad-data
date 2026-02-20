"use client";

import { useAcademicContext } from "@/app/contexts/AcademicContext";
import { Icon } from "@iconify/react";

export default function CoursPage() {
  const {
    selectedAnnee,
    selectedSection,
    selectedPromotion,
    selectedProgramme,
  } = useAcademicContext();

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

  console.log("Selected Promotion:", selectedPromotion);
  console.log("Selected Programme:", selectedProgramme);
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
      {selectedProgramme && (
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

      {/* Semestres */}
      {selectedProgramme?.semestres &&
      selectedProgramme.semestres.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-midnight_text">Semestres</h2>
          {selectedProgramme.semestres.map((semestre: any, index: number) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-midnight_text">
                  {semestre.designation}
                </h3>
                <span className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold">
                  {semestre.credit} crédits
                </span>
              </div>

              {/* Unités */}
              {semestre.unites && semestre.unites.length > 0 ? (
                <div className="space-y-4">
                  {semestre.unites.map((unite: any, uniteIndex: number) => (
                    <div
                      key={uniteIndex}
                      className="border border-gray-200 rounded-xl p-6 hover:border-primary transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {unite.designation}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Code: {unite.code}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                          {unite.credit} crédits
                        </span>
                      </div>

                      {/* Description */}
                      {unite.description && unite.description.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Description:
                          </p>
                          <ul className="space-y-1">
                            {unite.description.map(
                              (desc: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm text-gray-600 pl-4"
                                >
                                  • {desc}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Compétences */}
                      {unite.competences && unite.competences.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">
                            Compétences:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {unite.competences.map(
                              (comp: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-primary/5 text-primary rounded-full text-xs"
                                >
                                  {comp}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Aucune unité d'enseignement définie pour ce semestre
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Icon
            icon="material-symbols:folder-open"
            className="text-gray-300 text-6xl mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucun semestre défini
          </h3>
          <p className="text-gray-500">
            Le programme n'a pas encore de semestres configurés.
          </p>
        </div>
      )}

      {/* Debug Info (can be removed in production) */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
        <p className="font-semibold mb-2">Informations de debug:</p>
        <p>Promotion ID: {selectedPromotion.id}</p>
        <p>Année ID: {selectedAnnee._id}</p>
        <p>Section ID: {selectedSection?._id}</p>
        <p>Filière ID: {selectedPromotion.filiereId}</p>
      </div>
    </div>
  );
}
