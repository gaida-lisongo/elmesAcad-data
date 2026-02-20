"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import {
  addElement,
  updateElement,
  deleteElement,
} from "@/app/actions/element.actions";
import { fetchPromotionById } from "@/app/actions/promotion.actions";
import Link from "next/link";

interface ElementType {
  code: string;
  designation: string;
  objectifs: string[];
  place_ec: string;
}

interface UniteType {
  code: string;
  designation: string;
  description: string[];
  competences: string[];
  credit: number;
  elements?: ElementType[];
}

export default function UniteDetailPage({
  params,
}: {
  params: { promotionId: string; semestreIndex: string; uniteIndex: string };
}) {
  const router = useRouter();
  const [unite, setUnite] = useState<UniteType | null>(null);
  const [promotionName, setPromotionName] = useState("");
  const [semestreName, setSemestreName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    designation: "",
    objectifs: "",
    place_ec: "",
  });

  const promotionId = params.promotionId;
  const semestreIndex = parseInt(params.semestreIndex);
  const uniteIndex = parseInt(params.uniteIndex);

  useEffect(() => {
    loadUniteData();
  }, []);

  const loadUniteData = async () => {
    try {
      // Fetch promotion details
      const result = await fetchPromotionById(promotionId);

      if (!result.success || !result.data) {
        toast.error("Impossible de charger les données");
        setIsLoading(false);
        return;
      }

      const { programme, filiere, section } = result.data;

      // Check if semestre and unite exist
      if (
        !programme.semestres ||
        !programme.semestres[semestreIndex] ||
        !programme.semestres[semestreIndex].unites ||
        !programme.semestres[semestreIndex].unites[uniteIndex]
      ) {
        toast.error("Unité introuvable");
        setIsLoading(false);
        return;
      }

      const semestreData = programme.semestres[semestreIndex];
      const uniteData = semestreData.unites[uniteIndex];

      setPromotionName(
        `${programme.niveau} - ${programme.designation} (${filiere.sigle})`,
      );
      setSemestreName(semestreData.designation);
      setUnite(uniteData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading unite:", error);
      toast.error("Erreur lors du chargement des données");
      setIsLoading(false);
    }
  };

  const handleAddElement = async () => {
    if (
      !formData.code ||
      !formData.designation ||
      !formData.objectifs ||
      !formData.place_ec
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await addElement(
        promotionId,
        semestreIndex,
        uniteIndex,
        formData,
      );

      if (result.success) {
        toast.success("Cours ajouté avec succès");
        setFormData({ code: "", designation: "", objectifs: "", place_ec: "" });
        setIsAdding(false);
        loadUniteData();
      } else {
        toast.error(result.error || "Erreur lors de l'ajout du cours");
      }
    } catch (error) {
      console.error("Error adding element:", error);
      toast.error("Erreur lors de l'ajout du cours");
    }
  };

  const handleUpdateElement = async () => {
    if (editingIndex === null) return;

    if (
      !formData.code ||
      !formData.designation ||
      !formData.objectifs ||
      !formData.place_ec
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await updateElement(
        promotionId,
        semestreIndex,
        uniteIndex,
        editingIndex,
        formData,
      );

      if (result.success) {
        toast.success("Cours modifié avec succès");
        setFormData({ code: "", designation: "", objectifs: "", place_ec: "" });
        setEditingIndex(null);
        loadUniteData();
      } else {
        toast.error(result.error || "Erreur lors de la modification");
      }
    } catch (error) {
      console.error("Error updating element:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteElement = async (index: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      return;
    }

    try {
      const result = await deleteElement(
        promotionId,
        semestreIndex,
        uniteIndex,
        index,
      );

      if (result.success) {
        toast.success("Cours supprimé avec succès");
        loadUniteData();
      } else {
        toast.error(result.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const startEditing = (element: ElementType, index: number) => {
    setFormData({
      code: element.code,
      designation: element.designation,
      objectifs: element.objectifs.join("\n"),
      place_ec: element.place_ec,
    });
    setEditingIndex(index);
  };

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

  if (!unite) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <Icon
            icon="material-symbols:error"
            className="text-red-500 text-6xl mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Unité introuvable
          </h3>
          <Link
            href="/cours"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition mt-4"
          >
            <Icon icon="material-symbols:arrow-back" width={20} />
            Retour aux cours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/cours"
          className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
        >
          <Icon icon="material-symbols:arrow-back" width={20} />
          Retour à la gestion des cours
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon
                icon="material-symbols:book"
                className="text-primary text-4xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-midnight_text">
                {unite.designation}
              </h1>
              <p className="text-gray-600 mt-1">
                {unite.code} • {unite.credit} crédits
              </p>
            </div>
          </div>

          {/* Description & Competences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Description
              </h3>
              <ul className="space-y-2">
                {unite.description.map((desc, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Icon
                      icon="material-symbols:check-circle"
                      className="text-primary text-lg flex-shrink-0 mt-0.5"
                    />
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {unite.competences.map((comp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Elements Management */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-midnight_text">
            Éléments constitutifs (Cours)
          </h2>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Icon icon="material-symbols:add" width={20} />
            Ajouter un cours
          </button>
        </div>

        {/* Add/Edit Modal */}
        {(isAdding || editingIndex !== null) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-midnight_text mb-6">
                {editingIndex !== null ? "Modifier le cours" : "Nouveau cours"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Ex: EC101"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Place EC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.place_ec}
                      onChange={(e) =>
                        setFormData({ ...formData, place_ec: e.target.value })
                      }
                      placeholder="Ex: CM, TD, TP"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Désignation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    placeholder="Ex: Introduction aux bases de données"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectifs <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (une ligne par objectif)
                    </span>
                  </label>
                  <textarea
                    value={formData.objectifs}
                    onChange={(e) =>
                      setFormData({ ...formData, objectifs: e.target.value })
                    }
                    placeholder="Comprendre les concepts fondamentaux&#10;Maîtriser les techniques de...&#10;Développer des compétences en..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingIndex(null);
                    setFormData({
                      code: "",
                      designation: "",
                      objectifs: "",
                      place_ec: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={
                    editingIndex !== null
                      ? handleUpdateElement
                      : handleAddElement
                  }
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {editingIndex !== null ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Elements List */}
        {unite.elements && unite.elements.length > 0 ? (
          <div className="space-y-4">
            {unite.elements.map((element, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {element.designation}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Code: {element.code} • {element.place_ec}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(element, index)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <Icon icon="material-symbols:edit" width={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteElement(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Icon icon="material-symbols:delete" width={20} />
                    </button>
                  </div>
                </div>

                {/* Objectifs */}
                {element.objectifs && element.objectifs.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Objectifs pédagogiques:
                    </p>
                    <ul className="space-y-2">
                      {element.objectifs.map((obj, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Icon
                            icon="material-symbols:check-circle"
                            className="text-primary text-lg flex-shrink-0 mt-0.5"
                          />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
              Aucun cours défini
            </h3>
            <p className="text-gray-500 mb-6">
              Commencez par ajouter un élément constitutif à cette unité
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Icon icon="material-symbols:add" width={20} />
              Ajouter le premier cours
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
