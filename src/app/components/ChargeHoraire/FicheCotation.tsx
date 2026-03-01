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
}

export const FicheCotation = ({
  elementId,
  promotionId,
  anneeId,
}: FicheCotationProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [localNotes, setLocalNotes] = useState<
    Record<string, { cc: number; examen: number; rattrapage: number }>
  >({});
  const [savingId, setSavingId] = useState<string | null>(null);

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

    const text = await csvFile.text();
    const lines = text.split("\n").slice(1); // Skip header

    const rows = lines
      .filter((line) => line.trim())
      .map((line) => {
        const [matricule, cc, examen, rattrapage] = line.split(",");
        return {
          matricule: matricule.trim(),
          cc: parseFloat(cc),
          examen: parseFloat(examen),
          rattrapage: parseFloat(rattrapage),
        };
      });

    const result = await importNotesByCSV({
      elementId,
      promotionId,
      anneeId,
      rows,
    });

    if (result.success) {
      await loadStudents();
      setShowImport(false);
      setCsvFile(null);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fiche de Cotation
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {students.length} étudiant(s) inscrit(s)
          </p>
        </div>
        <button
          onClick={() => setShowImport(!showImport)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          📤 Importer CSV
        </button>
      </div>

      {/* Import CSV Panel */}
      {showImport && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Importer les notes par CSV
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Format attendu: matricule, cc, examen, rattrapage
          </p>
          <div className="flex gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
            />
            <button
              onClick={handleImportCSV}
              disabled={!csvFile}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importer
            </button>
          </div>
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
