"use client";

import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { SectionType } from "@/app/page";
import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import { updateSection, createSection } from "@/app/actions/section.actions";
import { fetchStudentByMatricule } from "@/app/actions/produit.actions";
import {
  fetchSubscriptionsByStudent,
  SubscriptionType,
} from "@/app/actions/subscription.actions";
import { useClientService } from "@/services/client.service";
import Link from "next/link";

const Hero = ({ section }: { section: SectionType }) => {
  const { isAuthenticated, hydrated, user } = useAuthStore();
  const { client } = useClientService();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    mention: String(section?.mention || ""),
    designation: String(section?.designation || ""),
    mission: String(section?.mission || ""),
    promesses: (section?.promesses || []).map((p) => String(p)),
  });
  const [matricule, setMatricule] = useState("");
  const [isCheckingMatricule, setIsCheckingMatricule] = useState(false);
  const [showMatriculeModal, setShowMatriculeModal] = useState(false);
  const [matriculeResult, setMatriculeResult] = useState<{
    found: boolean;
    student?: {
      _id: string;
      nomComplet: string;
      email: string;
      matricule: string;
    };
    subscriptions?: SubscriptionType[];
    error?: string;
  }>({ found: false });

  useEffect(() => {
    setMounted(true);
    // Debug: check authentication status
    console.log(
      "Hero mounted, hydrated:",
      hydrated,
      "authenticated:",
      isAuthenticated(),
      "user:",
      user,
    );
  }, [hydrated, isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePromesseChange = (index: number, value: string) => {
    const newPromesses = [...formData.promesses];
    newPromesses[index] = value;
    setFormData((prev) => ({ ...prev, promesses: newPromesses }));
  };

  const handleAddPromesse = () => {
    setFormData((prev) => ({ ...prev, promesses: [...prev.promesses, ""] }));
  };

  const handleRemovePromesse = (index: number) => {
    const newPromesses = formData.promesses.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, promesses: newPromesses }));
  };

  const handleSave = async () => {
    if (!formData.mention || !formData.designation || !formData.mission) {
      alert("Tous les champs principaux sont requis");
      return;
    }

    setIsLoading(true);
    try {
      let result;

      // Create new section if no _id exists, otherwise update
      if (!section._id || section._id === "") {
        result = await createSection(formData);
      } else {
        result = await updateSection(section._id, formData);
      }

      if (!result.success) {
        alert(result.error || "Une erreur est survenue");
        return;
      }

      setIsEditing(false);
      const action =
        !section._id || section._id === "" ? "créée" : "mise à jour";
      alert(`Section ${action} avec succès`);
      window.location.reload(); // Reload to show updated data
    } catch (error) {
      console.error("Error saving section:", error);
      alert("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      mention: String(section?.mention || ""),
      designation: String(section?.designation || ""),
      mission: String(section?.mission || ""),
      promesses: (section?.promesses || []).map((p) => String(p)),
    });
    setIsEditing(false);
  };

  const handleCheckMatricule = async () => {
    const cleanMatricule = matricule.trim();
    if (!cleanMatricule) {
      alert("Veuillez saisir un matricule");
      return;
    }

    setIsCheckingMatricule(true);
    try {
      const studentResult = await fetchStudentByMatricule(cleanMatricule);

      if (!studentResult.success || !studentResult.data) {
        setMatriculeResult({
          found: false,
          error:
            studentResult.error || "Aucun compte trouvé pour ce matricule.",
        });
        setShowMatriculeModal(true);
        return;
      }

      const subscriptionsResult = await fetchSubscriptionsByStudent(
        studentResult.data._id,
      );

      console.log("Résultat de la vérification du matricule:", {
        student: studentResult,
        subscriptions: subscriptionsResult,
      });

      setMatriculeResult({
        found: true,
        student: studentResult.data,
        subscriptions: subscriptionsResult.success
          ? subscriptionsResult.data || []
          : [],
      });
      setShowMatriculeModal(true);
    } catch (error) {
      console.error("Erreur vérification matricule:", error);
      setMatriculeResult({
        found: false,
        error: "Une erreur est survenue pendant la vérification.",
      });
      setShowMatriculeModal(true);
    } finally {
      setIsCheckingMatricule(false);
    }
  };

  return (
    <section id="home-section" className="bg-slate-gray">
      <div className="container pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-1 gap-10 items-center">
          <div className="col-span-6 flex flex-col gap-8">
            {/* Mention */}
            <div className="flex gap-2 mx-auto lg:mx-0">
              <Icon
                icon="solar:verified-check-bold"
                className="text-success text-xl inline-block me-2"
              />
              {isEditing ? (
                <input
                  type="text"
                  name="mention"
                  value={formData.mention}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="text-success text-sm font-semibold text-center lg:text-start tracking-widest uppercase border-b-2 border-success focus:outline-none bg-transparent px-2 py-1 disabled:opacity-50"
                  placeholder="Mention"
                />
              ) : (
                <p className="text-success text-sm font-semibold text-center lg:text-start tracking-widest uppercase">
                  {section?.mention || "Mention non définie"}
                </p>
              )}
            </div>

            {/* Designation */}
            {isEditing ? (
              <textarea
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={3}
                className="text-midnight_text lg:text-start text-center font-semibold leading-tight capitalize border-2 border-primary rounded-lg p-4 focus:outline-none focus:border-primary/70 disabled:opacity-50"
                placeholder="Designation"
              />
            ) : (
              <h1 className="text-midnight_text lg:text-start text-center font-semibold leading-tight capitalize">
                {section?.designation || "Designation non définie"}
              </h1>
            )}

            {/* Mission */}
            {isEditing ? (
              <textarea
                name="mission"
                value={formData.mission}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={4}
                className="text-black/70 text-lg lg:text-start text-center max-w-xl capitalize border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="Mission"
              />
            ) : (
              <p className="text-black/70 text-lg lg:text-start text-center max-w-xl capitalize">
                {section?.mission || "Mission non définie"}
              </p>
            )}

            {/* Search Bar - Vérification matricule */}
            <div className="relative rounded-full">
              <input
                type="text"
                name="matricule"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCheckMatricule();
                  }
                }}
                className="py-4 pl-8 pr-20 text-lg w-full text-black rounded-full border border-black/10 focus:outline-hidden focus:border-primary duration-300 shadow-input-shadow"
                placeholder="Entrez votre matricule pour vérifier votre compte"
                autoComplete="off"
              />
              <button
                onClick={handleCheckMatricule}
                disabled={isCheckingMatricule}
                className="group border border-secondary bg-secondary hover:bg-transparent p-3 rounded-full absolute right-2 top-1.5 duration-300 hover:cursor-pointer disabled:opacity-50"
              >
                <Icon
                  icon={
                    isCheckingMatricule
                      ? "eos-icons:loading"
                      : "solar:magnifer-linear"
                  }
                  className="text-white group-hover:text-primary text-2xl inline-block duration-300"
                />
              </button>
            </div>

            {/* Promesses */}
            <div className="flex items-center justify-between pt-10 lg:pt-4 flex-wrap gap-4">
              {isEditing ? (
                <div className="w-full space-y-3">
                  {formData.promesses.map((promesse, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Image
                        src="/images/banner/check-circle.svg"
                        alt="check-image"
                        width={30}
                        height={30}
                        className="smallImage"
                      />
                      <input
                        type="text"
                        value={promesse}
                        onChange={(e) =>
                          handlePromesseChange(index, e.target.value)
                        }
                        disabled={isLoading}
                        className="flex-1 text-sm sm:text-lg font-normal text-black border-b-2 border-gray-300 focus:outline-none focus:border-primary bg-transparent px-2 py-1 disabled:opacity-50"
                        placeholder="Promesse"
                      />
                      <button
                        onClick={() => handleRemovePromesse(index)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                      >
                        <Icon
                          icon="material-symbols:close"
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddPromesse}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-primary hover:text-primary/70 font-medium text-sm disabled:opacity-50"
                  >
                    <Icon
                      icon="material-symbols:add-circle-outline"
                      width={20}
                      height={20}
                    />
                    Ajouter une promesse
                  </button>
                </div>
              ) : (
                <>
                  {section?.promesses?.map((promesse, index) => (
                    <div key={index} className="flex gap-2">
                      <Image
                        src="/images/banner/check-circle.svg"
                        alt="check-image"
                        width={30}
                        height={30}
                        className="smallImage"
                      />
                      <p className="text-sm sm:text-lg font-normal text-black">
                        {promesse}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="col-span-6 flex justify-center relative">
            {/* Edit Button - Only for authenticated users */}
            {mounted && hydrated && isAuthenticated() && (
              <div className="absolute top-4 right-4 z-10">
                {!isEditing ? (
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
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      <Icon
                        icon="material-symbols:close"
                        width={20}
                        height={20}
                      />
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
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
            )}

            <Image
              src={client?.logo || "/images/banner/mahila.webp"}
              alt="nothing"
              width={1000}
              height={805}
            />
          </div>
        </div>
      </div>

      {showMatriculeModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-midnight_text">
                Vérification du matricule
              </h3>
              <button
                onClick={() => setShowMatriculeModal(false)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Icon
                  icon="material-symbols:close-rounded"
                  width={28}
                  height={28}
                />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {matriculeResult.found && matriculeResult.student ? (
                <div className="space-y-5">
                  <div className="rounded-xl bg-green-50 border border-green-300 px-4 py-3">
                    <p className="text-green-700 font-medium">
                      Compte trouvé pour ce matricule.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500 mb-1">
                        Nom complet
                      </p>
                      <p className="text-black font-medium">
                        {matriculeResult.student.nomComplet}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500 mb-1">
                        Email
                      </p>
                      <p className="text-black font-medium break-all">
                        {matriculeResult.student.email}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-4 sm:col-span-2">
                      <p className="text-xs uppercase text-gray-500 mb-1">
                        Matricule
                      </p>
                      <p className="text-black font-medium">
                        {matriculeResult.student.matricule}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-midnight_text mb-3">
                      Inscriptions ({matriculeResult.subscriptions?.length || 0}
                      )
                    </h4>

                    {(matriculeResult.subscriptions || []).length > 0 ? (
                      <div className="space-y-3">
                        {(matriculeResult.subscriptions || []).map(
                          (subscription) => (
                            <div
                              key={subscription._id}
                              className="border border-gray-200 rounded-xl p-4"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <Link
                                  href={`/promotions/${subscription?.promotion?._id}`}
                                  className="text-sm text-black/70"
                                >
                                  Promotion:{" "}
                                  {subscription?.promotion?.designation ||
                                    "N/A"}{" "}
                                </Link>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    subscription.isValid
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {subscription.isValid
                                    ? "Valide"
                                    : "Non valide"}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mt-2">
                                  Année:{" "}
                                  {subscription?.annee?.debut
                                    ? new Date(
                                        subscription.annee.debut,
                                      ).toLocaleDateString("fr-FR")
                                    : "N/A"}{" "}
                                  -{" "}
                                  {subscription?.annee?.fin
                                    ? new Date(
                                        subscription.annee.fin,
                                      ).toLocaleDateString("fr-FR")
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <p className="text-black/60">
                        Aucune inscription trouvée.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3">
                  <p className="text-red-700 font-medium">
                    {matriculeResult.error ||
                      "Aucun compte trouvé pour ce matricule."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
