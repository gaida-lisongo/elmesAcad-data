"use client";

import { useState, useMemo, useEffect } from "react";
import {
  fetchNotesByElement,
  updateNote,
  importNotesByCSV,
} from "@/app/actions/cours.actions";

interface Student {
  _id: string;
  nomComplet: string;
  matricule: string;
  email: string;
  note: {
    cc: number;
    examen: number;
    rattrapage: number;
  };
}

interface FicheCotationProps {
  elementId: string;
  promotionId: string;
  anneeId: string;
  titulaireId?: string;
}

export const FicheCotation = ({
  elementId,
  promotionId,
  anneeId,
  titulaireId,
}: FicheCotationProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [localNotes, setLocalNotes] = useState<
    Record<string, { cc: number; examen: number; rattrapage: number }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    const result = await fetchNotesByElement(elementId, promotionId, anneeId);
    if (result.success && result.data) {
      setStudents(result.data);
      // Initialiser les notes locales
      const notes: Record<
        string,
        { cc: number; examen: number; rattrapage: number }
      > = {};
      result.data.forEach((student: Student) => {
        notes[student._id] = { ...student.note };
      });
      setLocalNotes(notes);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [elementId, promotionId, anneeId]);

  const calculateTotal = (studentId: string) => {
    const notes = localNotes[studentId] || { cc: 0, examen: 0, rattrapage: 0 };
    const semestre = notes.cc + notes.examen;
    const rattrapage = notes.rattrapage;

    if (rattrapage >= semestre) {
      return { total: rattrapage, source: "rattrapage" };
    }
    return { total: semestre, source: "semestre" };
  };

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.matricule.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [students, searchTerm]);

  const handleNoteChange = (
    studentId: string,
    field: "cc" | "examen" | "rattrapage",
    value: number,
  ) => {
    setLocalNotes((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveNote = async (studentId: string) => {
    const notes = localNotes[studentId];
    if (!notes) return;

    setSavingId(studentId);
    const result = await updateNote({
      elementId,
      studentId,
      promotionId,
      anneeId,
      ...notes,
    });

    if (result.success) {
      // Mettre à jour le state students avec les nouvelles notes
      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, note: notes } : s)),
      );
    }
    setSavingId(null);
  };

  const handleImportCSV = async () => {
    if (!csvFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await csvFile.text();
      const lines = text.split("\n").slice(1); // Skip header

      const rows = lines
        .filter((line) => line.trim())
        .map((line) => {
          const parts = line.split(",");
          // Format: matricule, nom_complet, cc, examen, rattrapage
          const matricule = parts[0]?.trim() || "";
          const cc = parseFloat(parts[2]) || 0;
          const examen = parseFloat(parts[3]) || 0;
          const rattrapage = parseFloat(parts[4]) || 0;
          return { matricule, cc, examen, rattrapage };
        })
        .filter(
          (row) =>
            row.matricule &&
            (row.cc > 0 || row.examen > 0 || row.rattrapage > 0),
        );

      if (rows.length === 0) {
        setImportResult({
          success: 0,
          errors: ["Aucune note trouvée dans le fichier"],
        });
        setImporting(false);
        return;
      }

      const result = await importNotesByCSV({
        elementId,
        promotionId,
        anneeId,
        rows,
      });

      if (result.success && result.data) {
        setImportResult(result.data);
        await loadStudents();
        setCsvFile(null);
      } else {
        setImportResult({
          success: 0,
          errors: [result.error || "Erreur inconnue"],
        });
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: ["Erreur lors de la lecture du fichier"],
      });
    }

    setImporting(false);
  };

  // Exporter le template CSV vide (pour que l'enseignant remplisse)
  const handleExportTemplate = () => {
    const header = "matricule,nom_complet,cc,examen,rattrapage";
    const rows = students.map((s) => `${s.matricule},"${s.nomComplet}",,,`);
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "template_notes.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Exporter les notes actuelles
  const handleExportNotes = () => {
    const header = "matricule,nom_complet,cc,examen,rattrapage,total,decision";
    const rows = students.map((s) => {
      const notes = localNotes[s._id] || s.note;
      const { total } = calculateTotal(s._id);
      const decision = total >= 10 ? "Réussite" : "Échec";
      return `${s.matricule},"${s.nomComplet}",${notes.cc},${notes.examen},${notes.rattrapage},${total},${decision}`;
    });
    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fiche_cotation.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fiche de Cotation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {students.length} étudiant(s) inscrit(s)
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportTemplate}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            title="Télécharger un fichier CSV vide à remplir"
          >
            📋 Template vide
          </button>
          <button
            onClick={handleExportNotes}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            title="Exporter les notes actuelles"
          >
            📥 Exporter notes
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            📤 Importer CSV
          </button>
        </div>
      </div>

      {/* Import CSV Panel */}
      {showImport && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Importer les notes par CSV
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded p-3 mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Format attendu:</strong> matricule, nom_complet, cc,
              examen, rattrapage
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Astuce: Téléchargez d'abord le "Template vide", remplissez les
              notes dans Excel, puis importez le fichier.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              disabled={importing}
            />
            <button
              onClick={handleImportCSV}
              disabled={!csvFile || importing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Importation...
                </>
              ) : (
                "Importer"
              )}
            </button>
            <button
              onClick={() => {
                setShowImport(false);
                setCsvFile(null);
                setImportResult(null);
              }}
              disabled={importing}
              className="px-4 py-2 bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 disabled:opacity-50"
            >
              Annuler
            </button>
          </div>

          {/* Import Result Feedback */}
          {importResult && (
            <div
              className={`mt-4 p-3 rounded-lg ${importResult.errors.length > 0 ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700" : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700"}`}
            >
              <p className="font-medium text-gray-900 dark:text-white">
                ✅ {importResult.success} note(s) importée(s) avec succès
              </p>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    ⚠️ Erreurs:
                  </p>
                  <ul className="text-xs text-red-500 dark:text-red-400 list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>
                        ... et {importResult.errors.length - 5} autres erreurs
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Rechercher un étudiant (nom ou matricule)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student, index) => {
          const { total, source } = calculateTotal(student._id);
          const notes = localNotes[student._id] || {
            cc: 0,
            examen: 0,
            rattrapage: 0,
          };
          const isSaving = savingId === student._id;

          return (
            <div
              key={student._id}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {student.nomComplet}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.matricule}
                  </p>
                </div>

                {/* Notes - Toujours éditables */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      CC
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={notes.cc}
                      onChange={(e) =>
                        handleNoteChange(
                          student._id,
                          "cc",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleSaveNote(student._id)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      tabIndex={index * 3 + 1}
                    />
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      Examen
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={notes.examen}
                      onChange={(e) =>
                        handleNoteChange(
                          student._id,
                          "examen",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleSaveNote(student._id)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      tabIndex={index * 3 + 2}
                    />
                  </div>
                  <div className="text-center">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      Rattrapage
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={notes.rattrapage}
                      onChange={(e) =>
                        handleNoteChange(
                          student._id,
                          "rattrapage",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      onBlur={() => handleSaveNote(student._id)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      tabIndex={index * 3 + 3}
                    />
                  </div>
                  <div className="text-center border-l pl-4 border-gray-300 dark:border-slate-600 min-w-[80px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total
                    </p>
                    <p
                      className={`text-xl font-bold ${total >= 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {total}/20
                    </p>
                    <p className="text-xs text-gray-500">({source})</p>
                  </div>
                  {isSaving && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun étudiant trouvé
        </div>
      )}
    </div>
  );
};
