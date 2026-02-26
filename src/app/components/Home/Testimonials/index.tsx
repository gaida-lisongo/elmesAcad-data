"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { AnneeType } from "@/app/page";
import { useAuthStore } from "@/store/auth.store";
import {
  createCalendrier,
  updateCalendrier,
  deleteCalendrier,
} from "@/app/actions/annee.actions";
import ModalEdit, { FormDataType } from "./ModalEdit";

const Testimonial = ({ annee }: { annee: AnneeType }) => {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<FormDataType>({
    photo: "",
    from: "",
    to: "",
    title: "",
    description: "",
    items: "",
    _id: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const calendrier = annee?.calendrier || [];

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      photo: "",
      from: "",
      to: "",
      title: "",
      description: "",
      items: "",
      _id: "",
    });
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      photo: item.photo || "",
      from: item.from || "",
      to: item.to || "",
      title: item.title || "",
      description: Array.isArray(item.description)
        ? item.description.join(", ")
        : item.description || "",
      items: Array.isArray(item.items) ? item.items.join(", ") : "",
      _id: item._id || "",
    });
    setShowModal(true);
  };

  const createCalendar = async (formData: {
    from: string;
    to: string;
    title: string;
    description: string;
    photo?: string;
    items?: string;
  }) => {
    if (
      !formData.from ||
      !formData.to ||
      !formData.title ||
      !formData.description
    ) {
      alert("Tous les champs requis doivent être remplis");
      return;
    }
    try {
      const dataToSend = {
        ...formData,
        items: formData.items
          ? formData.items.split(",").map((i) => i.trim())
          : [],
      };

      let result;
      result = await createCalendrier(annee._id, dataToSend);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Calendrier créé avec succès");
    } catch (error) {
      console.error("Error saving calendrier:", error);
      alert("Une erreur est survenue");
    } finally {
      setShowModal(false);
    }
  };

  const updateCalendar = async (formData: {
    _id?: string;
    from: string;
    to: string;
    title: string;
    description: string;
    photo?: string;
    items?: string;
  }) => {
    if (
      !formData.from ||
      !formData.to ||
      !formData.title ||
      !formData.description
    ) {
      alert("Tous les champs requis doivent être remplis");
      return;
    }
    try {
      const dataToSend = {
        ...formData,
        items: formData.items
          ? formData.items.split(",").map((i) => i.trim())
          : [],
      };

      let result;
      result = await updateCalendrier(
        annee._id,
        String(formData._id),
        dataToSend,
      );

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Calendrier mis à jour avec succès");
    } catch (error) {
      console.error("Error saving calendrier:", error);
      alert("Une erreur est survenue");
    } finally {
      setShowModal(false);
    }
  };

  const handleDelete = async (item: any) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;

    try {
      const result = await deleteCalendrier(annee._id, String(item._id));

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      alert("Calendrier supprimé avec succès");
    } catch (error) {
      console.error("Error deleting calendrier:", error);
      alert("Une erreur est survenue");
    } finally {
      window.location.reload();
    }
  };

  const settings = {
    dots: true,
    infinite: calendrier.length > 3,
    slidesToShow: Math.min(3, calendrier.length),
    slidesToScroll: 2,
    arrows: false,
    autoplay: false,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, calendrier.length),
          slidesToScroll: 1,
          infinite: calendrier.length > 3,
          dots: false,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: Math.min(2, calendrier.length),
          slidesToScroll: 1,
          infinite: calendrier.length > 2,
          dots: false,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: calendrier.length > 1,
          dots: false,
        },
      },
    ],
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon
            key={`full-${i}`}
            icon="tabler:star-filled"
            className="text-yellow-500 text-xl inline-block"
          />
        ))}
        {halfStars > 0 && (
          <Icon
            icon="tabler:star-half-filled"
            className="text-yellow-500 text-xl inline-block"
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon
            key={`empty-${i}`}
            icon="tabler:star-filled"
            className="text-gray-400 text-xl inline-block"
          />
        ))}
      </>
    );
  };

  console.log("Annees data:", annee);

  return (
    <section id="testimonial">
      <div className="container">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-midnight_text max-w-96">
            Année Académique {new Date(annee.debut).getFullYear()} -{" "}
            {new Date(annee.fin).getFullYear()}
          </h2>
          {mounted && hydrated && isAuthenticated() && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition shadow-md"
            >
              <Icon icon="material-symbols:add" width={20} height={20} />
              Ajouter un calendrier
            </button>
          )}
        </div>

        {calendrier.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            <p>Aucun calendrier disponible</p>
          </div>
        ) : (
          <Slider {...settings}>
            {calendrier.map((items, i) => (
              <div key={i}>
                <div className="bg-white border border-black/10 shadow-md rounded-2xl m-3 p-5 mt-20 relative group">
                  <div className="absolute top-[-45px]">
                    <Image
                      src={items?.photo || "/images/testimonial/user1.webp"}
                      alt={String(items?.title)}
                      width={100}
                      height={120}
                      className="inline-block rounded-full border border-black/10"
                    />
                  </div>
                  {mounted && hydrated && isAuthenticated() && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-2">
                      <button
                        onClick={() => openEditModal(items)}
                        title="Éditer"
                        className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition"
                      >
                        <Icon
                          icon="material-symbols:edit"
                          width={18}
                          height={18}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(items)}
                        title="Supprimer"
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                      >
                        <Icon
                          icon="material-symbols:delete"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                  )}
                  <p className="text-base font-normal text-darkgray my-4">
                    {Array.isArray(items?.description)
                      ? items.description.join(", ")
                      : items?.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-medium text-darkbrown pt-4 pb-2">
                        {items.title}
                      </p>
                      <p className="text-sm font-normal text-lightgray pb-2">
                        {items.from} - {items.to}
                      </p>
                    </div>
                    <div className="flex">
                      {renderStars(items.items?.length || 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </div>

      {/* Modal Création/Édition */}
      {showModal && (
        <ModalEdit
          data={formData || {}}
          onSave={(payload: FormDataType) => {
            if (editingItem) {
              updateCalendar(payload as FormDataType);
            } else {
              createCalendar(payload);
            }
          }}
          setShowModal={setShowModal}
        />
      )}
    </section>
  );
};

export default Testimonial;
