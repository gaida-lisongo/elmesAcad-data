"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type {
  ResultatEtudiant,
  SemestreResultat,
  UniteResultat,
} from "@/utils/NoteManager";
import { ExportExcel } from "@/utils/ExportExcel";
import { updateNoteByJury } from "@/app/actions/jury.actions";

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

interface EditingNote {
  studentId: string;
  elementId: string;
  cc: number;
  examen: number;
  rattrapage: number;
}

export default function PromotionDeliberationClient({
  promotion,
  annee,
  resultats,
  promotionId,
}: PromotionDeliberationClientProps) {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] =
    useState<ResultatEtudiant | null>(null);
  const [view, setView] = useState<"palmares" | "details">("palmares");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingNote, setEditingNote] = useState<EditingNote | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedUnite, setExpandedUnite] = useState<string | null>(null);

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

  const handleExportAll = () => {
    ExportExcel.exportDeliberation(resultats, promotion, annee);
    setShowExportMenu(false);
  };

  const handleExportPalmares = () => {
    ExportExcel.exportPalmaresOnly(resultats, promotion, annee);
    setShowExportMenu(false);
  };

  const handleExportGrille = () => {
    ExportExcel.exportGrilleOnly(resultats, promotion, annee);
    setShowExportMenu(false);
  };

  const handleStartEditNote = (
    studentId: string,
    elementId: string,
    element: any,
  ) => {
    setEditingNote({
      studentId,
      elementId,
      cc: element.noteFinale * 0.4 || 0,
      examen: element.noteFinale * 0.6 || 0,
      rattrapage: 0,
    });
  };

  const handleSaveNote = async () => {
    if (!editingNote) return;
    setIsSaving(true);

    const res = await updateNoteByJury({
      elementId: editingNote.elementId,
      studentId: editingNote.studentId,
      promotionId,
      anneeId: annee._id,
      cc: editingNote.cc,
      examen: editingNote.examen,
      rattrapage: editingNote.rattrapage,
    });

    if (res.success) {
      router.refresh();
      setEditingNote(null);
    }
    setIsSaving(false);
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
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition flex items-center gap-2"
              >
                <Icon icon="mdi:file-excel" width={18} height={18} />
                Exporter
                <Icon
                  icon={showExportMenu ? "mdi:chevron-up" : "mdi:chevron-down"}
                  width={16}
                  height={16}
                />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50">
                  <button
                    onClick={handleExportAll}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 rounded-t-lg"
                  >
                    <Icon
                      icon="mdi:file-document-multiple"
                      width={20}
                      height={20}
                      className="text-primary"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Dossier complet
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        PV + Palmarès + Grilles
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportPalmares}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 border-t border-gray-100 dark:border-slate-700"
                  >
                    <Icon
                      icon="mdi:trophy"
                      width={20}
                      height={20}
                      className="text-yellow-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Palmarès seul
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Classement par %
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportGrille}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-3 border-t border-gray-100 dark:border-slate-700 rounded-b-lg"
                  >
                    <Icon
                      icon="mdi:table-large"
                      width={20}
                      height={20}
                      className="text-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Grilles seules
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Notes par semestre
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
                            <div key={unite._id} className="mb-1">
                              <button
                                onClick={() =>
                                  setExpandedUnite(
                                    expandedUnite === unite._id
                                      ? null
                                      : unite._id,
                                  )
                                }
                                className={`w-full flex items-center justify-between p-2 rounded text-sm transition ${
                                  unite.isValide
                                    ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                                    : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                                }`}
                              >
                                <span className="truncate flex-1 text-left flex items-center gap-2">
                                  <Icon
                                    icon={
                                      expandedUnite === unite._id
                                        ? "mdi:chevron-down"
                                        : "mdi:chevron-right"
                                    }
                                    width={16}
                                    height={16}
                                  />
                                  {unite.code}
                                </span>
                                <span className="font-medium ml-2">
                                  {unite.moyenne.toFixed(1)}/20
                                </span>
                              </button>
                              {expandedUnite === unite._id && (
                                <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-slate-700 pl-3">
                                  {unite.elements.map((element) => (
                                    <div
                                      key={element._id}
                                      className="flex items-center justify-between py-1 text-xs"
                                    >
                                      <span className="text-gray-600 dark:text-gray-400 truncate flex-1">
                                        {element.designation}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {element.noteFinale.toFixed(1)}/20
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleStartEditNote(
                                              selectedStudent.studentId,
                                              element._id,
                                              element,
                                            )
                                          }
                                          className="p-1 rounded hover:bg-primary/10 text-primary"
                                          title="Modifier la note"
                                        >
                                          <Icon
                                            icon="mdi:pencil"
                                            width={14}
                                            height={14}
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
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

      {editingNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Modifier la note
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              >
                <Icon icon="mdi:close" width={20} height={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="mdi:alert"
                    width={20}
                    height={20}
                    className="text-yellow-600 dark:text-yellow-400 mt-0.5"
                  />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Attention: Cette modification sera définitive et affectera
                    le résultat de l{"'"}étudiant.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CC (40%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={editingNote.cc}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        cc: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Examen (60%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={editingNote.examen}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        examen: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rattrapage
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={editingNote.rattrapage}
                    onChange={(e) =>
                      setEditingNote({
                        ...editingNote,
                        rattrapage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Note finale calculée:
                  </span>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {(
                      editingNote.cc * 0.4 +
                      Math.max(editingNote.examen, editingNote.rattrapage) * 0.6
                    ).toFixed(2)}
                    /20
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && (
                  <Icon
                    icon="mdi:loading"
                    width={18}
                    height={18}
                    className="animate-spin"
                  />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
