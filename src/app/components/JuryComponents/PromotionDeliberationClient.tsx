"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import type {
  ResultatEtudiant,
  SemestreResultat,
  UniteResultat,
} from "@/utils/NoteManager";

interface PromotionType {
  _id: string;
  niveau: string;
  designation: string;
  semestres?: any[];
  filiere?: { sigle: string; designation: string };
  section?: { mention: string };
}

interface AnneeType {
  _id: string;
  debut: string;
  fin: string;
}

interface PromotionDeliberationClientProps {
  promotion: PromotionType;
  annee: AnneeType;
  resultats: ResultatEtudiant[];
  promotionId: string;
}

export default function PromotionDeliberationClient({
  promotion,
  annee,
  resultats,
  promotionId,
}: PromotionDeliberationClientProps) {
  const [selectedStudent, setSelectedStudent] =
    useState<ResultatEtudiant | null>(null);
  const [view, setView] = useState<"palmares" | "details">("palmares");

  const getMentionColor = (mention: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      B: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      C: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      D: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      E: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      F: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[mention] || "bg-gray-100 text-gray-800";
  };

  const getRang = (index: number) => {
    const suffix = index === 0 ? "er" : "ème";
    return `${index + 1}${suffix}`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {promotion.niveau} - {promotion.designation}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {promotion.filiere?.sigle} • {promotion.section?.mention} •{" "}
              {new Date(annee.debut).getFullYear()}-
              {new Date(annee.fin).getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("palmares")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "palmares"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon
                icon="mdi:trophy"
                className="inline mr-2"
                width={18}
                height={18}
              />
              Palmarès
            </button>
            <button
              onClick={() => setView("details")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                view === "details"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              <Icon
                icon="mdi:table"
                className="inline mr-2"
                width={18}
                height={18}
              />
              Grille
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={selectedStudent ? "lg:col-span-2" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Icon icon="mdi:account-group" width={24} height={24} />
                Étudiants ({resultats.length})
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Admis
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  Ajourné
                </span>
              </div>
            </div>

            {resultats.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Icon
                  icon="mdi:account-off"
                  width={48}
                  height={48}
                  className="mx-auto mb-3 opacity-50"
                />
                <p>Aucun étudiant inscrit ou aucune note enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {resultats.map((resultat, index) => (
                  <div
                    key={resultat.studentId}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-slate-800 ${
                      selectedStudent?.studentId === resultat.studentId
                        ? "bg-primary/5 dark:bg-primary/10"
                        : ""
                    }`}
                    onClick={() => setSelectedStudent(resultat)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {getRang(index)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {resultat.studentName}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {resultat.matricule}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            NCV:{" "}
                            <strong className="text-green-600">
                              {resultat.promotion.ncv}
                            </strong>
                          </span>
                          <span>
                            NCNV:{" "}
                            <strong className="text-red-600">
                              {resultat.promotion.ncnv}
                            </strong>
                          </span>
                          <span>
                            Total: {resultat.promotion.totalObtenu.toFixed(1)}/
                            {resultat.promotion.totalMax}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {resultat.promotion.pourcentage.toFixed(1)}%
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${getMentionColor(
                            resultat.promotion.mention,
                          )}`}
                        >
                          {resultat.promotion.mention}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedStudent && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 sticky top-6">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Détails
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <Icon icon="mdi:close" width={20} height={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon
                      icon="mdi:account"
                      width={32}
                      height={32}
                      className="text-primary"
                    />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {selectedStudent.studentName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStudent.matricule}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {selectedStudent.promotion.pourcentage.toFixed(1)}%
                    </div>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-bold rounded mt-2 ${getMentionColor(
                        selectedStudent.promotion.mention,
                      )}`}
                    >
                      Mention {selectedStudent.promotion.mention}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {selectedStudent.semestres.map(
                    (semestre: SemestreResultat) => (
                      <div
                        key={semestre._id}
                        className="border border-gray-200 dark:border-slate-700 rounded-lg"
                      >
                        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {semestre.designation}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded ${getMentionColor(
                                semestre.mention,
                              )}`}
                            >
                              {semestre.pourcentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>NCV: {semestre.ncv}</span>
                            <span>NCNV: {semestre.ncnv}</span>
                          </div>
                        </div>
                        <div className="p-2">
                          {semestre.unites.map((unite: UniteResultat) => (
                            <div
                              key={unite._id}
                              className={`flex items-center justify-between p-2 rounded text-sm ${
                                unite.isValide
                                  ? "text-gray-700 dark:text-gray-300"
                                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10"
                              }`}
                            >
                              <span className="truncate flex-1">
                                {unite.code}
                              </span>
                              <span className="font-medium ml-2">
                                {unite.moyenne.toFixed(1)}/20
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
