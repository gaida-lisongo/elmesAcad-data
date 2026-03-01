"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuthStore } from "@/store/auth.store";
import {
  updateStructure,
  createStructure,
} from "@/app/actions/structure.actions";
import {
  createService,
  updateService,
  deleteService,
} from "@/app/actions/service.actions";

interface Service {
  _id: string;
  titre: string;
  description: string;
  contacts: {
    email: string;
    phone: string;
  };
}

interface StructureSectionProps {
  structure: {
    _id: string;
    description: string;
    services: Service[];
    anneeId: string;
  } | null;
  anneeId: string;
}

const StructureSection = ({
  structure: initialStructure,
  anneeId,
}: StructureSectionProps) => {
  const { isAuthenticated, hydrated, isSuperAdmin } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: initialStructure?.description || "",
    services: initialStructure?.services || [],
  });

  const [newService, setNewService] = useState({
    titre: "",
    description: "",
    contacts: { email: "", phone: "" },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialStructure) {
      setFormData({
        description: initialStructure.description || "",
        services: initialStructure.services || [],
      });
    }
  }, [initialStructure]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleAddService = async () => {
    if (!newService.titre || !newService.description) {
      alert("Le titre et la description du service sont requis");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createService(newService);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, result.data],
      }));

      setNewService({
        titre: "",
        description: "",
        contacts: { email: "", phone: "" },
      });
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateService = async (
    serviceId: string,
    data: Partial<Service>,
  ) => {
    setIsLoading(true);
    try {
      const result = await updateService(serviceId, data);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        services: prev.services.map((s) =>
          s._id === serviceId ? { ...s, ...result.data } : s,
        ),
      }));
      setEditingServiceId(null);
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) return;

    setIsLoading(true);
    try {
      const result = await deleteService(serviceId);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((s) => s._id !== serviceId),
      }));
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.description) {
      alert("La description est requise");
      return;
    }

    setIsLoading(true);
    try {
      const serviceIds = formData.services.map((s) => s._id);

      let result;
      if (initialStructure?._id) {
        result = await updateStructure(initialStructure._id, {
          description: formData.description,
          services: serviceIds,
        });
      } else {
        result = await createStructure({
          anneeId,
          description: formData.description,
          services: serviceIds,
        });
      }

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setIsEditing(false);
      alert(
        `Structure ${initialStructure?._id ? "modifiée" : "créée"} avec succès`,
      );
    } catch (error) {
      console.error("Error saving structure:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      description: initialStructure?.description || "",
      services: initialStructure?.services || [],
    });
    setIsEditing(false);
    setEditingServiceId(null);
  };

  return (
    <section className="bg-slate-gray py-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center mb-16">
          {/* Title and Description in center of section */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-midnight_text">
              Notre Structure
            </h2>

            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={5}
                className="w-full text-lg text-gray-600 border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:border-primary disabled:opacity-50 resize-none"
                placeholder="Description de la structure organisationnelle"
              />
            ) : (
              <p className="text-lg text-gray-600 whitespace-pre-line">
                {formData.description || "Description non définie"}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <div className="flex justify-start lg:justify-end items-start">
            {mounted && hydrated && isSuperAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition shadow-md"
              >
                <Icon
                  icon="material-symbols:edit-outline"
                  width={20}
                  height={20}
                />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          <h3 className="text-3xl font-semibold text-midnight_text text-center">
            Nos Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formData.services.map((service) => (
              <div
                key={service._id}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
              >
                {editingServiceId === service._id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={service.titre}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          services: prev.services.map((s) =>
                            s._id === service._id
                              ? { ...s, titre: e.target.value }
                              : s,
                          ),
                        }))
                      }
                      className="w-full text-xl font-semibold border-2 border-primary rounded-lg p-3"
                      placeholder="Titre du service"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          services: prev.services.map((s) =>
                            s._id === service._id
                              ? { ...s, description: e.target.value }
                              : s,
                          ),
                        }))
                      }
                      rows={3}
                      className="w-full text-gray-600 border-2 border-gray-300 rounded-lg p-3 resize-none"
                      placeholder="Description du service"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        value={service.contacts.email}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            services: prev.services.map((s) =>
                              s._id === service._id
                                ? {
                                    ...s,
                                    contacts: {
                                      ...s.contacts,
                                      email: e.target.value,
                                    },
                                  }
                                : s,
                            ),
                          }))
                        }
                        className="w-full border-2 border-gray-300 rounded-lg p-2"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={service.contacts.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            services: prev.services.map((s) =>
                              s._id === service._id
                                ? {
                                    ...s,
                                    contacts: {
                                      ...s.contacts,
                                      phone: e.target.value,
                                    },
                                  }
                                : s,
                            ),
                          }))
                        }
                        className="w-full border-2 border-gray-300 rounded-lg p-2"
                        placeholder="Téléphone"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleUpdateService(service._id, service)
                        }
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        <Icon
                          icon="material-symbols:check"
                          width={18}
                          height={18}
                        />
                        Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingServiceId(null)}
                        className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="solar:case-round-bold-duotone"
                          className="text-primary text-3xl"
                        />
                        <h4 className="text-xl font-semibold text-midnight_text">
                          {service.titre}
                        </h4>
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingServiceId(service._id)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <Icon
                              icon="material-symbols:edit"
                              width={20}
                              height={20}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service._id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 p-1 disabled:opacity-50"
                          >
                            <Icon
                              icon="material-symbols:delete"
                              width={20}
                              height={20}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 whitespace-pre-line">
                      {service.description}
                    </p>
                    {(service.contacts.email || service.contacts.phone) && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {service.contacts.email && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Icon
                              icon="solar:letter-bold"
                              width={18}
                              height={18}
                            />
                            {service.contacts.email}
                          </div>
                        )}
                        {service.contacts.phone && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Icon
                              icon="solar:phone-bold"
                              width={18}
                              height={18}
                            />
                            {service.contacts.phone}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add New Service */}
          {isEditing && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-dashed border-blue-300">
                <h4 className="text-lg font-semibold text-midnight_text mb-4">
                  Ajouter un service
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newService.titre}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        titre: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-gray-300 rounded-lg p-3"
                    placeholder="Titre du service"
                  />
                  <textarea
                    value={newService.description}
                    onChange={(e) =>
                      setNewService((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full border-2 border-gray-300 rounded-lg p-3 resize-none"
                    placeholder="Description du service"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      value={newService.contacts.email}
                      onChange={(e) =>
                        setNewService((prev) => ({
                          ...prev,
                          contacts: {
                            ...prev.contacts,
                            email: e.target.value,
                          },
                        }))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg p-2"
                      placeholder="Email (optionnel)"
                    />
                    <input
                      type="tel"
                      value={newService.contacts.phone}
                      onChange={(e) =>
                        setNewService((prev) => ({
                          ...prev,
                          contacts: {
                            ...prev.contacts,
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg p-2"
                      placeholder="Téléphone (optionnel)"
                    />
                  </div>
                  <button
                    onClick={handleAddService}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Icon
                      icon="material-symbols:add-circle-outline"
                      width={20}
                      height={20}
                    />
                    Ajouter le service
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-center gap-3 mt-12">
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
};

export default StructureSection;
