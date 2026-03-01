"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuthStore } from "@/store/auth.store";
import { updateSlogan, createSlogan } from "@/app/actions/slogan.actions";
import { uploadImage } from "@/services/file.service";

// Composant Counter pour l'animation
const Counter = ({
  target,
  duration = 2000,
}: {
  target: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function pour une animation plus fluide
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = Math.floor(easeOutQuart * target);

      setCount(current);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isVisible]);

  return <span ref={countRef}>{count}</span>;
};

interface SloganSectionProps {
  slogan: {
    _id: string;
    photo?: string;
    designation: string;
    description: string[];
    anneeId: string;
  } | null;
  metrics: {
    promotions: number;
    unites: number;
    sujets: number;
    stages: number;
  };
  anneeId: string;
}

const SloganSection = ({
  slogan: initialSlogan,
  metrics,
  anneeId,
}: SloganSectionProps) => {
  const { isAuthenticated, hydrated, isSuperAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    photo: initialSlogan?.photo || "",
    designation: initialSlogan?.designation || "",
    description: initialSlogan?.description || [""],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialSlogan) {
      setFormData({
        photo: initialSlogan.photo || "",
        designation: initialSlogan.designation || "",
        description: initialSlogan.description || [""],
      });
    }
  }, [initialSlogan]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setFormData((prev) => ({ ...prev, photo: url }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erreur lors du téléchargement de l'image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescription = [...formData.description];
    newDescription[index] = value;
    setFormData((prev) => ({ ...prev, description: newDescription }));
  };

  const handleAddDescription = () => {
    setFormData((prev) => ({
      ...prev,
      description: [...prev.description, ""],
    }));
  };

  const handleRemoveDescription = (index: number) => {
    const newDescription = formData.description.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      description: newDescription.length > 0 ? newDescription : [""],
    }));
  };

  const handleSave = async () => {
    if (!formData.designation || formData.description.every((d) => !d.trim())) {
      alert("Le titre et au moins une description sont requis");
      return;
    }

    setIsLoading(true);
    try {
      const filteredDescription = formData.description.filter((d) => d.trim());

      let result;
      if (initialSlogan?._id) {
        result = await updateSlogan(initialSlogan._id, {
          ...formData,
          description: filteredDescription,
        });
      } else {
        result = await createSlogan({
          anneeId,
          ...formData,
          description: filteredDescription,
        });
      }

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setIsEditing(false);
      alert(`Slogan ${initialSlogan?._id ? "modifié" : "créé"} avec succès`);
    } catch (error) {
      console.error("Error saving slogan:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      photo: initialSlogan?.photo || "",
      designation: initialSlogan?.designation || "",
      description: initialSlogan?.description || [""],
    });
    setIsEditing(false);
  };

  return (
    <section className="bg-white py-20 mt-10">
      <div className="container mx-auto px-4">
        {/* Photo and Text Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Image Section */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {isEditing && mounted && hydrated && isSuperAdmin ? (
              <div className="relative h-full bg-gray-100 flex items-center justify-center">
                {formData.photo ? (
                  <Image
                    src={formData.photo}
                    alt="Slogan"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Icon
                    icon="solar:gallery-add-bold"
                    className="text-gray-400 text-6xl"
                  />
                )}
                <label className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-primary/90 transition flex items-center gap-2">
                  {uploadingImage ? (
                    <>
                      <Icon icon="eos-icons:loading" width={20} height={20} />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:upload-bold" width={20} height={20} />
                      Changer photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            ) : (
              <Image
                src={formData.photo || "/images/banner/mahila.webp"}
                alt="Slogan"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Title and Description */}
          <div className="space-y-6">
            {/* Designation */}
            {isEditing ? (
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                disabled={isLoading}
                className="text-4xl font-bold text-midnight_text border-2 border-primary rounded-lg p-4 w-full focus:outline-none focus:border-primary/70 disabled:opacity-50"
                placeholder="Titre du slogan"
              />
            ) : (
              <h2 className="text-4xl font-bold text-midnight_text">
                {formData.designation || "Titre non défini"}
              </h2>
            )}

            {/* Description */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  {formData.description.map((desc, index) => (
                    <div key={index} className="relative">
                      <textarea
                        value={desc}
                        onChange={(e) =>
                          handleDescriptionChange(index, e.target.value)
                        }
                        disabled={isLoading}
                        rows={3}
                        className="w-full text-lg text-gray-600 border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:border-primary disabled:opacity-50 resize-none"
                        placeholder={`Paragraphe ${index + 1}`}
                      />
                      {formData.description.length > 1 && (
                        <button
                          onClick={() => handleRemoveDescription(index)}
                          disabled={isLoading}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                        >
                          <Icon
                            icon="material-symbols:close"
                            width={20}
                            height={20}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAddDescription}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-primary hover:text-primary/70 font-medium disabled:opacity-50"
                  >
                    <Icon
                      icon="material-symbols:add-circle-outline"
                      width={20}
                      height={20}
                    />
                    Ajouter un paragraphe
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {formData.description.map((desc, index) => (
                    <p
                      key={index}
                      className="text-lg text-gray-600 whitespace-pre-line"
                    >
                      {desc}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Edit Button */}
        {mounted && hydrated && isSuperAdmin && !isEditing && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition shadow-md"
            >
              <Icon
                icon="material-symbols:edit-outline"
                width={20}
                height={20}
              />
              Modifier
            </button>
          </div>
        )}

        {/* Metrics - 4 columns on separate line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <Icon
                icon="solar:diploma-bold-duotone"
                className="text-blue-600 text-4xl mb-3"
              />
              <h3 className="text-4xl font-bold text-blue-600 mb-2">
                <Counter target={metrics.promotions} />
              </h3>
              <p className="text-sm text-gray-600 font-medium">Promotions</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <Icon
                icon="solar:book-bookmark-bold-duotone"
                className="text-green-600 text-4xl mb-3"
              />
              <h3 className="text-4xl font-bold text-green-600 mb-2">
                <Counter target={metrics.unites} />
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Cours (Unités)
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <Icon
                icon="solar:document-text-bold-duotone"
                className="text-purple-600 text-4xl mb-3"
              />
              <h3 className="text-4xl font-bold text-purple-600 mb-2">
                <Counter target={metrics.sujets} />
              </h3>
              <p className="text-sm text-gray-600 font-medium">Sujets</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
              <Icon
                icon="solar:case-round-bold-duotone"
                className="text-orange-600 text-4xl mb-3"
              />
              <h3 className="text-4xl font-bold text-orange-600 mb-2">
                <Counter target={metrics.stages} />
              </h3>
              <p className="text-sm text-gray-600 font-medium">Stages</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-center mt-12">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              <Icon icon="material-symbols:close" width={20} height={20} />
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || uploadingImage}
              className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {isLoading ? (
                <Icon icon="eos-icons:loading" width={20} height={20} />
              ) : (
                <Icon icon="material-symbols:check" width={20} height={20} />
              )}
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default SloganSection;
