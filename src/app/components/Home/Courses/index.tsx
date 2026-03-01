"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { SectionType } from "@/app/page";
import { useAuthStore } from "@/store/auth.store";
import {
  createPromotion,
  deletePromotionById,
  updatePromotionById,
} from "@/app/actions/promotion.actions";
import PromotionCard from "../../PromotionCard";

interface CoursesProps {
  section: SectionType;
  promotions: any[];
}

const Courses = (data: CoursesProps) => {
  const { isAuthenticated, hydrated, isSuperAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [allPromotions, setAllPromotions] = useState(data.promotions || []);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [selectedFiliereId, setSelectedFiliereId] = useState("");
  const [formData, setFormData] = useState({
    niveau: "",
    designation: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalPromotions = allPromotions.length;

  // Filtered promotions based on search term
  const filteredPromotions =
    searchTerm.trim() === ""
      ? allPromotions
      : allPromotions.filter((promotion) => {
          const searchLower = searchTerm.toLowerCase();
          const niveau = String(promotion.niveau).toLowerCase();
          const designation = String(promotion.designation).toLowerCase();
          const filiere = String(
            promotion.filiereName || promotion.filiere || "",
          ).toLowerCase();

          return (
            niveau.includes(searchLower) ||
            designation.includes(searchLower) ||
            filiere.includes(searchLower)
          );
        });

  const handleSearch = () => {
    if (searchTerm.trim() !== "") {
      setIsSearching(true);
    }
  };

  const openCreateModal = () => {
    setModalStep(1);
    setSelectedFiliereId("");
    setFormData({ niveau: "", designation: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (promotion: any) => {
    setEditingPromotion(promotion);
    const index = allPromotions.findIndex(
      (p: any) =>
        String(p._id) === String(promotion._id) &&
        String(p.filiereId) === String(promotion.filiereId),
    );
    setEditingIndex(index);
    setFormData({
      niveau: promotion.niveau,
      designation: promotion.designation,
      description: Array.isArray(promotion.description)
        ? promotion.description.join(", ")
        : promotion.description,
    });
    setShowEditModal(true);
  };

  const handleUpdatePromotion = async () => {
    if (!formData.niveau || !formData.designation || !formData.description) {
      alert("Tous les champs sont requis");
      return;
    }

    if (!editingPromotion) {
      alert("Promotion non trouvée");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePromotionById(
        String(editingPromotion._id),
        formData,
      );

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Promotion mise à jour avec succès");
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromotion = async (promotion: any) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?"))
      return;

    if (!promotion._id) {
      alert("Promotion ID manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deletePromotionById(String(promotion._id));

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Promotion supprimée avec succès");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = () => {
    if (!selectedFiliereId) {
      alert("Veuillez sélectionner une filière");
      return;
    }
    setModalStep(2);
  };

  const handleCreatePromotion = async () => {
    if (!formData.niveau || !formData.designation || !formData.description) {
      alert("Tous les champs sont requis");
      return;
    }

    if (!data.section._id || data.section._id === "") {
      alert("Section ID manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPromotion(
        data.section._id,
        selectedFiliereId,
        formData,
      );

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Promotion créée avec succès");
      setShowModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="courses" className="scroll-mt-12 pb-20">
      <div className="container">
        {/* Moteur de recherche */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Rechercher par niveau, désignation ou filière..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value.trim() === "") {
                    setIsSearching(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition"
              >
                <Icon icon="material-symbols:search" width={24} height={24} />
              </button>
            </div>

            {mounted && hydrated && isSuperAdmin && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition shadow-md whitespace-nowrap"
              >
                <Icon icon="material-symbols:add" width={20} height={20} />
                Créer une promotion
              </button>
            )}
          </div>

          {/* Résultats de recherche ou total */}
          <div className="mt-6 flex items-center justify-between">
            {searchTerm && isSearching ? (
              <p className="text-sm text-gray-600 animate-fadeIn">
                {filteredPromotions.length} résultat
                {filteredPromotions.length !== 1 ? "s" : ""} trouvé
                {filteredPromotions.length !== 1 ? "s" : ""}
              </p>
            ) : (
              <h2 className="text-2xl font-bold text-midnight_text">
                Total des programmes ({totalPromotions})
              </h2>
            )}

            {searchTerm && isSearching && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setIsSearching(false);
                }}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 animate-fadeIn"
              >
                <Icon icon="material-symbols:close" width={16} height={16} />
                Effacer la recherche
              </button>
            )}
          </div>
        </div>

        {/* Grille des programmes (articles de blog style) */}
        {filteredPromotions.length === 0 ? (
          <div className="py-10 text-center text-gray-500 animate-fadeIn">
            <Icon
              icon="material-symbols:search-off"
              className="text-6xl mx-auto mb-4 text-gray-400"
            />
            <p className="text-lg">
              {searchTerm && isSearching
                ? "Aucun résultat ne correspond à votre recherche"
                : "Aucun programme disponible"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPromotions.map((promotion, i) => (
              <div
                key={i}
                className="animate-fadeInUp"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <PromotionCard
                  promotion={promotion}
                  onEdit={openEditModal}
                  onDelete={handleDeletePromotion}
                  isSubmitting={isSubmitting}
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 2 Étapes */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            {modalStep === 1 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-midnight_text">
                    Étape 1: Choisir une filière
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon
                      icon="material-symbols:close"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>

                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {data.section.filieres && data.section.filieres.length > 0 ? (
                    data.section.filieres.map((filiere) => (
                      <button
                        key={String(filiere._id)}
                        onClick={() =>
                          setSelectedFiliereId(String(filiere._id))
                        }
                        className={`w-full p-3 rounded-lg border-2 transition text-left ${
                          selectedFiliereId === String(filiere._id)
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-primary"
                        }`}
                      >
                        <p className="font-semibold text-midnight_text">
                          {String(filiere.designation)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {String(filiere.sigle)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune filière disponible</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!selectedFiliereId}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-midnight_text">
                    Étape 2: Créer la promotion
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon
                      icon="material-symbols:close"
                      width={24}
                      height={24}
                    />
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Niveau
                    </label>
                    <input
                      type="text"
                      value={formData.niveau}
                      onChange={(e) =>
                        setFormData({ ...formData, niveau: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Ex: Licence"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Désignation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Ex: Licence 1"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Décrivez le programme... (séparez par des virgules)"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalStep(1)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleCreatePromotion}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Icon icon="eos-icons:loading" width={20} height={20} />
                        Création...
                      </span>
                    ) : (
                      "Créer"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Édition Promotion */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-midnight_text">
                Éditer la promotion
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="material-symbols:close" width={24} height={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Niveau
                </label>
                <input
                  type="text"
                  value={formData.niveau}
                  onChange={(e) =>
                    setFormData({ ...formData, niveau: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ex: Licence"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Désignation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ex: Licence 1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Décrivez le programme... (séparez par des virgules)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdatePromotion}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="eos-icons:loading" width={20} height={20} />
                    Mise à jour...
                  </span>
                ) : (
                  "Mettre à jour"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Courses;
