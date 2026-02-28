"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuthStore } from "@/store/auth.store";
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/app/actions/team.actions";
import { fetchUsers } from "@/app/actions/user.actions";

interface User {
  _id: string;
  nomComplet: string;
  photo?: string;
  fonction?: string;
  email: string;
}

interface Service {
  _id: string;
  titre: string;
}

interface TeamMember {
  _id: string;
  userId: User;
  serviceId: Service;
}

interface TeamSectionProps {
  team: TeamMember[];
  services: Service[];
  anneeId: string;
}

const TeamSection = ({
  team: initialTeam,
  services,
  anneeId,
}: TeamSectionProps) => {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const [teamMembers, setTeamMembers] = useState(initialTeam);

  const [newMember, setNewMember] = useState({
    userId: "",
    serviceId: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTeamMembers(initialTeam);
  }, [initialTeam]);

  useEffect(() => {
    if (isEditing) {
      loadAvailableUsers();
    }
  }, [isEditing]);

  const loadAvailableUsers = async () => {
    try {
      const result = await fetchUsers();
      if (result.success && result.data) {
        setAvailableUsers(result.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.userId || !newMember.serviceId) {
      alert("Veuillez sélectionner un utilisateur et un service");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTeamMember({
        anneeId,
        userId: newMember.userId,
        serviceId: newMember.serviceId,
      });

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      // Reload the page to get updated data with populated fields
      window.location.reload();
    } catch (error) {
      console.error("Error adding team member:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (memberId: string, serviceId: string) => {
    setIsLoading(true);
    try {
      const result = await updateTeamMember(memberId, { serviceId });

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Error updating team member:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre de l'équipe ?"))
      return;

    setIsLoading(true);
    try {
      const result = await deleteTeamMember(memberId);

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setTeamMembers((prev) => prev.filter((m) => m._id !== memberId));
    } catch (error) {
      console.error("Error deleting team member:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-4xl font-bold text-midnight_text">
              Notre Équipe
            </h2>
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
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Rencontrez les personnes dévouées qui font vivre notre institution
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {teamMembers.map((member) => (
            <div
              key={member._id}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
            >
              {/* Delete Button */}
              {isEditing && (
                <button
                  onClick={() => handleDeleteMember(member._id)}
                  disabled={isLoading}
                  className="absolute top-3 right-3 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition disabled:opacity-50 shadow-md"
                >
                  <Icon icon="material-symbols:close" width={20} height={20} />
                </button>
              )}

              {/* Photo */}
              <div className="relative h-80 bg-gradient-to-b from-primary/10 to-transparent">
                <Image
                  src={member.userId?.photo || "/images/mentor/user1.webp"}
                  alt={member.userId?.nomComplet || "Team Member"}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                <h3 className="text-2xl font-bold text-midnight_text">
                  {member.userId?.nomComplet || "Nom non défini"}
                </h3>

                <div className="flex items-center gap-2 text-primary">
                  <Icon icon="solar:case-round-bold" width={20} height={20} />
                  <p className="font-semibold">
                    {member.userId?.fonction || "Fonction non définie"}
                  </p>
                </div>

                {isEditing ? (
                  <select
                    value={member.serviceId?._id || ""}
                    onChange={(e) =>
                      handleUpdateMember(member._id, e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full border-2 border-primary rounded-lg p-2 focus:outline-none focus:border-primary/70 disabled:opacity-50"
                  >
                    <option value="">Sélectionner un service</option>
                    {services.map((service) => (
                      <option key={service._id} value={service._id}>
                        {service.titre}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Icon
                      icon="solar:buildings-2-bold"
                      width={20}
                      height={20}
                    />
                    <p className="text-sm">
                      {member.serviceId?.titre || "Service non défini"}
                    </p>
                  </div>
                )}

                {member.userId?.email && (
                  <div className="flex items-center gap-2 text-gray-500 text-sm pt-2 border-t">
                    <Icon icon="solar:letter-bold" width={18} height={18} />
                    <p className="truncate">{member.userId.email}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Member */}
        {isEditing && (
          <div className="max-w-2xl mx-auto">
            {showAddMember ? (
              <div className="bg-blue-50 p-8 rounded-2xl border-2 border-dashed border-blue-300">
                <h3 className="text-2xl font-semibold text-midnight_text mb-6">
                  Ajouter un membre
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner un utilisateur
                    </label>
                    <select
                      value={newMember.userId}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          userId: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Choisir un utilisateur --</option>
                      {availableUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.nomComplet}{" "}
                          {user.fonction ? `- ${user.fonction}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sélectionner un service
                    </label>
                    <select
                      value={newMember.serviceId}
                      onChange={(e) =>
                        setNewMember((prev) => ({
                          ...prev,
                          serviceId: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Choisir un service --</option>
                      {services.map((service) => (
                        <option key={service._id} value={service._id}>
                          {service.titre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAddMember(false);
                        setNewMember({ userId: "", serviceId: "" });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-3 rounded-lg font-medium transition"
                    >
                      <Icon
                        icon="material-symbols:close"
                        width={20}
                        height={20}
                      />
                      Annuler
                    </button>
                    <button
                      onClick={handleAddMember}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Icon icon="eos-icons:loading" width={20} height={20} />
                      ) : (
                        <Icon
                          icon="material-symbols:add"
                          width={20}
                          height={20}
                        />
                      )}
                      {isLoading ? "Ajout..." : "Ajouter"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddMember(true)}
                className="w-full border-2 border-dashed border-primary bg-primary/5 hover:bg-primary/10 text-primary py-8 rounded-2xl font-semibold text-lg transition flex items-center justify-center gap-3"
              >
                <Icon
                  icon="material-symbols:add-circle-outline"
                  width={28}
                  height={28}
                />
                Ajouter un membre à l'équipe
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={() => {
                setIsEditing(false);
                setShowAddMember(false);
                setNewMember({ userId: "", serviceId: "" });
              }}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 px-8 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              <Icon icon="material-symbols:close" width={20} height={20} />
              Terminer
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
