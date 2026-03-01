"use client";

import { useState } from "react";
import {
  createQCMActivity,
  createQuestionnaireActivity,
} from "@/app/actions/cours.actions";
import { uploadFichier } from "@/services/file.service";

interface CreateActivityModalProps {
  elementId: string;
  titulaireId: string;
  promotionId: string;
  anneeId: string;
  type: "qcm" | "questionnaire";
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateActivityModal = ({
  elementId,
  titulaireId,
  promotionId,
  anneeId,
  type,
  onClose,
  onSuccess,
}: CreateActivityModalProps) => {
  const [designation, setDesignation] = useState("");
  const [description, setDescription] = useState<string[]>([""]);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [maxPts, setMaxPts] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // QCM specific
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentOptions, setCurrentOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  // Questionnaire specific
  const [currentEnonce, setCurrentEnonce] = useState("");
  const [uploading, setUploading] = useState(false);

  const addDescription = () => setDescription([...description, ""]);

  const updateDescription = (index: number, value: string) => {
    const newDesc = [...description];
    newDesc[index] = value;
    setDescription(newDesc);
  };

  const removeDescription = (index: number) => {
    setDescription(description.filter((_, i) => i !== index));
  };

  const addQCMQuestion = () => {
    if (!currentQuestion.trim() || currentOptions.every((o) => !o.trim()))
      return;

    setQuestions([
      ...questions,
      {
        question: currentQuestion,
        options: currentOptions.filter((o) => o.trim()),
        correctIndex,
      },
    ]);
    setCurrentQuestion("");
    setCurrentOptions(["", "", "", ""]);
    setCorrectIndex(0);
  };

  const addQuestionnaireQuestion = async (file?: File) => {
    if (!currentEnonce.trim()) return;

    let url = "";
    if (file) {
      setUploading(true);
      const result = await uploadFichier(file);
      setUploading(false);
      if (result) url = result;
    }

    setQuestions([...questions, { enonce: currentEnonce, url }]);
    setCurrentEnonce("");
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!designation.trim() || questions.length === 0) {
      alert("Complétez tous les champs obligatoires");
      return;
    }

    setLoading(true);
    const payload = {
      titulaireId,
      elementId,
      promotionId,
      anneeId,
      designation,
      description: description.filter((d) => d.trim()),
      currency,
      amount: amount ? parseFloat(amount) : undefined,
      maxPts: maxPts ? parseFloat(maxPts) : undefined,
      questions,
    };

    const result =
      type === "qcm"
        ? await createQCMActivity(payload as any)
        : await createQuestionnaireActivity(payload as any);

    setLoading(false);
    if (result.success) {
      onSuccess();
      onClose();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b dark:border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Créer {type === "qcm" ? "QCM" : "Questionnaire"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              placeholder="Titre de l'activité"
            />
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descriptions
            </label>
            {description.map((desc, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => updateDescription(idx, e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                  placeholder={`Description ${idx + 1}`}
                />
                {description.length > 1 && (
                  <button
                    onClick={() => removeDescription(idx)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addDescription}
              className="text-sm text-primary hover:underline"
            >
              + Ajouter description
            </button>
          </div>

          {/* Points & Price */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Points Max
              </label>
              <input
                type="number"
                value={maxPts}
                onChange={(e) => setMaxPts(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>CDF</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="border-t dark:border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Questions ({questions.length})
            </h3>

            {type === "qcm" ? (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Question"
                />
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="radio"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="mt-3"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...currentOptions];
                        newOpts[idx] = e.target.value;
                        setCurrentOptions(newOpts);
                      }}
                      className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
                <button
                  onClick={addQCMQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
                >
                  Ajouter question
                </button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={currentEnonce}
                  onChange={(e) => setCurrentEnonce(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                  placeholder="Énoncé de la question"
                />
                <div className="flex gap-2">
                  <input
                    type="file"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      addQuestionnaireQuestion(e.target.files[0])
                    }
                    className="flex-1 px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                    disabled={uploading}
                  />
                  <button
                    onClick={() => addQuestionnaireQuestion()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={uploading}
                  >
                    {uploading ? "Upload..." : "Ajouter"}
                  </button>
                </div>
              </div>
            )}

            {/* Question List */}
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {type === "qcm" ? q.question : q.enonce}
                      </p>
                      {type === "qcm" && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {q.options.map((opt: string, i: number) => (
                            <li
                              key={i}
                              className={
                                i === q.correctIndex
                                  ? "text-green-600 font-semibold"
                                  : ""
                              }
                            >
                              {i === q.correctIndex && "✓ "}
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                      {type === "questionnaire" && q.url && (
                        <a
                          href={q.url}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Voir document
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => removeQuestion(idx)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-slate-800 border-t dark:border-slate-700 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            disabled={loading || questions.length === 0}
          >
            {loading ? "Enregistrement..." : "Créer l'activité"}
          </button>
        </div>
      </div>
    </div>
  );
};
