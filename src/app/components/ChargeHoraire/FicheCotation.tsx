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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState({
    cc: 0,
    examen: 0,
    rattrapage: 0,
  });
  const [showImport, setShowImport] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const loadStudents = async () => {
    setLoading(true);
    const result = await fetchNotesByElement(elementId, promotionId, anneeId);
    if (result.success && result.data) {
      setStudents(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudents();
  }, [elementId, promotionId, anneeId]);

  const calculateTotal = (student: Student) => {
    const semestre = student.note.cc + student.note.examen;
    const rattrapage = student.note.rattrapage;

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

  const handleEdit = (student: Student) => {
    setEditingId(student._id);
    setEditNotes(student.note);
  };

  const handleSave = async (studentId: string) => {
    const result = await updateNote({
      elementId,
      studentId,
      promotionId,
      anneeId,
      ...editNotes,
    });

    if (result.success) {
      await loadStudents();
      setEditingId(null);
    }
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
        {filteredStudents.map((student) => {
          const { total, source } = calculateTotal(student);
          const isEditing = editingId === student._id;

          return (
            <div
              key={student._id}
              className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* Student Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {student.nomComplet}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {student.matricule} • {student.email}
                  </p>
                </div>

                {/* Notes */}
                <div className="flex items-center gap-6">
                  {isEditing ? (
                    <>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={editNotes.cc}
                          onChange={(e) =>
                            setEditNotes({
                              ...editNotes,
                              cc: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="CC"
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.5"
                          value={editNotes.examen}
                          onChange={(e) =>
                            setEditNotes({
                              ...editNotes,
                              examen: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="Examen"
                        />
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={editNotes.rattrapage}
                          onChange={(e) =>
                            setEditNotes({
                              ...editNotes,
                              rattrapage: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 px-2 py-1 border rounded"
                          placeholder="Rattrapage"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(student._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 dark:bg-slate-700 rounded hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CC
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {student.note.cc}/10
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Examen
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {student.note.examen}/10
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Rattrapage
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {student.note.rattrapage}/20
                        </p>
                      </div>
                      <div className="text-center border-l pl-6 border-gray-300 dark:border-slate-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            total >= 10
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {total}/20
                        </p>
                        <p className="text-xs text-gray-500">({source})</p>
                      </div>
                      <button
                        onClick={() => handleEdit(student)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                      >
                        ✎ Modifier
                      </button>
                    </>
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
