"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Slider from "react-slick";
import { Icon } from "@iconify/react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SectionType } from "@/app/page";
import { useAuthStore } from "@/store/auth.store";
import { updateSection } from "@/app/actions/section.actions";

const Companies = ({ section }: { section: SectionType }) => {
  const router = useRouter();
  const { isAuthenticated, hydrated, isSuperAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<any | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    sigle: "",
    designation: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filieres = section.filieres || [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFiliereClick = (filiereId: string) => {
    if (filiereId) {
      router.push(`/filiere/${filiereId}`);
    }
  };

  const openAddModal = () => {
    setEditingFiliere(null);
    setEditingIndex(null);
    setFormData({ sigle: "", designation: "", description: "" });
    setShowModal(true);
  };

  const openEditModal = (filiere: any, index: number) => {
    setEditingFiliere(filiere);
    setEditingIndex(index);
    setFormData({
      sigle: String(filiere.sigle || ""),
      designation: String(filiere.designation || ""),
      description: Array.isArray(filiere.description)
        ? filiere.description.join(", ")
        : String(filiere.description || ""),
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.sigle || !formData.designation || !formData.description) {
      alert("Tous les champs sont requis");
      return;
    }

    if (!section._id || section._id === "") {
      alert(
        "Impossible de modifier les filières: Section ID manquant. Veuillez d'abord créer une section.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedFilieres: any[] = [...filieres];

      const filiereData = {
        sigle: formData.sigle,
        designation: formData.designation,
        description: formData.description.split(",").map((d) => d.trim()),
        programmes: [],
      };

      if (editingIndex !== null) {
        // Update existing - keep _id if it exists and is valid
        const existingId = updatedFilieres[editingIndex]._id;
        updatedFilieres[editingIndex] = {
          ...filiereData,
          ...(existingId && existingId !== "" ? { _id: existingId } : {}),
        } as any;
      } else {
        // Add new - don't include _id, let MongoDB generate it
        updatedFilieres.push(filiereData);
      }

      // Clean up: remove empty _id fields before saving
      const cleanedFilieres = updatedFilieres.map((filiere: any) => {
        const { _id, ...rest } = filiere;
        // Only include _id if it's not empty
        return _id && _id !== "" ? { _id, ...rest } : rest;
      });

      const result = await updateSection(section._id, {
        filieres: cleanedFilieres,
      } as any);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setShowModal(false);
      alert(
        `Filière ${editingIndex !== null ? "modifiée" : "créée"} avec succès`,
      );
      window.location.reload();
    } catch (error) {
      console.error("Error saving filiere:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette filière ?")) return;

    if (!section._id || section._id === "") {
      alert("Impossible de supprimer: Section ID manquant");
      return;
    }

    try {
      const updatedFilieres = filieres.filter((_, i) => i !== index);

      // Clean up: remove empty _id fields before saving
      const cleanedFilieres = updatedFilieres.map((filiere: any) => {
        const { _id, ...rest } = filiere;
        // Only include _id if it's not empty
        return _id && _id !== "" ? { _id, ...rest } : rest;
      });

      const result = await updateSection(section._id, {
        filieres: cleanedFilieres,
      } as any);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Filière supprimée avec succès");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting filiere:", error);
      alert("Une erreur est survenue");
    }
  };

  const settings = {
    dots: false,
    infinite: filieres.length > 4,
    slidesToShow: Math.min(4, filieres.length),
    slidesToScroll: 1,
    arrows: false,
    autoplay: filieres.length > 4,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(4, filieres.length),
          slidesToScroll: 1,
          infinite: filieres.length > 4,
          dots: false,
        },
      },
      {
        breakpoint: 700,
        settings: {
          slidesToShow: Math.min(2, filieres.length),
          slidesToScroll: 1,
          infinite: filieres.length > 2,
          dots: false,
        },
      },
      {
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: filieres.length > 1,
          dots: false,
        },
      },
    ],
  };

  return (
    <section className="text-center py-10">
      <div className="container">
        <div className="flex justify-between items-center mb-6">
          <h6 className="text-midnight_text capitalize text-2xl font-semibold">
            Nos Filières
          </h6>
          {mounted && hydrated && isSuperAdmin && (
            <>
              {!section._id || section._id === "" ? (
                <div className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  ⚠️ Créez d'abord une section dans Hero (bouton "Modifier" en
                  haut)
                </div>
              ) : (
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition shadow-md"
                >
                  <Icon icon="material-symbols:add" width={20} height={20} />
                  Ajouter
                </button>
              )}
            </>
          )}
        </div>

        {filieres.length === 0 ? (
          <div className="py-10 text-gray-500">
            <p>Aucune filière disponible</p>
          </div>
        ) : (
          <div className="py-7 border-b">
            <Slider {...settings}>
              {filieres.map((filiere, index) => (
                <div key={index} className="px-2">
                  <div className="relative group">
                    <div
                      onClick={() => handleFiliereClick(filiere._id)}
                      className="cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg p-6 transition-all duration-300 border border-gray-200 hover:border-primary h-full flex flex-col items-center justify-center gap-4"
                    >
                      <Icon icon="mdi:home" className="text-primary text-6xl" />
                      <h4 className="font-semibold text-lg text-midnight_text">
                        {String(filiere.designation)}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {Array.isArray(filiere.description)
                          ? filiere.description.join(", ")
                          : String(filiere.description)}
                      </p>
                    </div>

                    {mounted &&
                      hydrated &&
                      isSuperAdmin &&
                      section._id &&
                      section._id !== "" && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(filiere, index);
                            }}
                            className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition"
                          >
                            <Icon
                              icon="material-symbols:edit"
                              width={16}
                              height={16}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(index);
                            }}
                            className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition"
                          >
                            <Icon
                              icon="material-symbols:delete"
                              width={16}
                              height={16}
                            />
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-midnight_text">
                {editingFiliere ? "Modifier la filière" : "Ajouter une filière"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="material-symbols:close" width={24} height={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sigle
                </label>
                <input
                  type="text"
                  value={formData.sigle}
                  onChange={(e) =>
                    setFormData({ ...formData, sigle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ex: INFO"
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
                  placeholder="Ex: Informatique"
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
                  placeholder="Décrivez la filière... (séparez par des virgules)"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="eos-icons:loading" width={20} height={20} />
                    Enregistrement...
                  </span>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Companies;
