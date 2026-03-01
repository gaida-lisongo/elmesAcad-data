"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import { createContact, updateContact } from "@/app/actions/contact.actions";

interface CoordonneesContactProps {
  contact: {
    _id?: string;
    adresse: string;
    email: string;
    phone: string;
  } | null;
  anneeId: string;
}

export default function CoordonneesContact({
  contact,
  anneeId,
}: CoordonneesContactProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { isAuthenticated, isSuperAdmin } = useAuthStore();

  const [formData, setFormData] = useState({
    adresse: contact?.adresse || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
  });

  useEffect(() => {
    setMounted(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (contact) {
      setFormData({
        adresse: contact.adresse,
        email: contact.email,
        phone: contact.phone,
      });
    }
  }, [contact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (contact?._id) {
        await updateContact(contact._id, formData);
      } else {
        await createContact({
          anneeId,
          ...formData,
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Échec de la sauvegarde des coordonnées");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (contact) {
      setFormData({
        adresse: contact.adresse,
        email: contact.email,
        phone: contact.phone,
      });
    }
    setIsEditing(false);
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
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

        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-midnight_text mb-3">
            Coordonnées de Contact
          </h2>
          <p className="text-lg text-gray-600">
            Retrouvez toutes nos informations de contact
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Adresse Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:map-point-bold-duotone"
                  className="text-blue-600 text-3xl"
                />
              </div>
              <h3 className="text-xl font-bold text-midnight_text mb-3">
                Adresse
              </h3>
              {isEditing && isSuperAdmin ? (
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary disabled:opacity-50 text-center"
                  placeholder="Adresse complète"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {formData.adresse || "Non renseignée"}
                </p>
              )}
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:letter-bold-duotone"
                  className="text-green-600 text-3xl"
                />
              </div>
              <h3 className="text-xl font-bold text-midnight_text mb-3">
                Email
              </h3>
              {isEditing && isSuperAdmin ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary disabled:opacity-50 text-center"
                  placeholder="email@example.com"
                />
              ) : (
                <a
                  href={`mailto:${formData.email}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {formData.email || "Non renseigné"}
                </a>
              )}
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:phone-bold-duotone"
                  className="text-purple-600 text-3xl"
                />
              </div>
              <h3 className="text-xl font-bold text-midnight_text mb-3">
                Téléphone
              </h3>
              {isEditing && isSuperAdmin ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full text-gray-600 border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary disabled:opacity-50 text-center"
                  placeholder="+243 XXX XXX XXX"
                />
              ) : (
                <a
                  href={`tel:${formData.phone}`}
                  className="text-gray-600 hover:text-primary transition-colors"
                >
                  {formData.phone || "Non renseigné"}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && isSuperAdmin && (
          <div className="flex gap-3 justify-center mt-8">
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
              disabled={isLoading}
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
}
