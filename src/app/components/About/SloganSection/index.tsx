"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuthStore } from "@/store/auth.store";
import { updateSlogan, createSlogan } from "@/app/actions/slogan.actions";

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
  const { isAuthenticated, hydrated } = useAuthStore();
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
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append("upload_preset", "ml_default");

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formDataUpload,
        },
      );

      const data = await response.json();
      setFormData((prev) => ({ ...prev, photo: data.secure_url }));
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
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            {isEditing && mounted && hydrated && isAuthenticated() ? (
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

          {/* Content Section */}
          <div className="space-y-8">
            {/* Edit Button */}
            {mounted && hydrated && isAuthenticated() && !isEditing && (
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
            )}

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

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon="solar:diploma-bold-duotone"
                    className="text-blue-600 text-3xl"
                  />
                  <h3 className="text-3xl font-bold text-blue-600">
                    {metrics.promotions}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">Promotions</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon="solar:book-bookmark-bold-duotone"
                    className="text-green-600 text-3xl"
                  />
                  <h3 className="text-3xl font-bold text-green-600">
                    {metrics.unites}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Cours (Unités)
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon="solar:document-text-bold-duotone"
                    className="text-purple-600 text-3xl"
                  />
                  <h3 className="text-3xl font-bold text-purple-600">
                    {metrics.sujets}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">Sujets</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Icon
                    icon="solar:case-round-bold-duotone"
                    className="text-orange-600 text-3xl"
                  />
                  <h3 className="text-3xl font-bold text-orange-600">
                    {metrics.stages}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 font-medium">Stages</p>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
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
                    <Icon
                      icon="material-symbols:check"
                      width={20}
                      height={20}
                    />
                  )}
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SloganSection;
