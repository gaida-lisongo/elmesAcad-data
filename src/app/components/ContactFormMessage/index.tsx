"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { createMessage } from "@/app/actions/message.actions";

interface ContactFormProps {
  contactId: string;
}

export default function ContactForm({ contactId }: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = Object.values(formData).every(
      (value) => value.trim() !== "",
    );
    setIsFormValid(isValid);
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const reset = () => {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    try {
      await createMessage({
        contactId,
        from: {
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
        },
        content: formData.message,
      });

      setSubmitted(true);
      setShowThanks(true);
      reset();

      setTimeout(() => {
        setShowThanks(false);
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Échec de l'envoi du message. Veuillez réessayer.");
    } finally {
      setLoader(false);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-midnight_text mb-3">
              Envoyez-nous un message
            </h2>
            <p className="text-lg text-gray-600">
              Nous sommes là pour répondre à toutes vos questions
            </p>
          </div>

          {/* Form */}
          <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 px-8 py-10 rounded-3xl shadow-lg">
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap w-full gap-6"
            >
              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon
                        icon="solar:user-bold-duotone"
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <input
                      id="firstname"
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      placeholder="Jean"
                      className="w-full text-base pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon
                        icon="solar:user-bold-duotone"
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <input
                      id="lastname"
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Dupont"
                      className="w-full text-base pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon
                        icon="solar:letter-bold-duotone"
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jean.dupont@exemple.com"
                      className="w-full text-base pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon
                        icon="solar:phone-bold-duotone"
                        className="text-gray-400 text-xl"
                      />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+243 XXX XXX XXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full text-base pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 transition-all duration-300 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="w-full">
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Message
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <Icon
                      icon="solar:document-text-bold-duotone"
                      className="text-gray-400 text-xl"
                    />
                  </div>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full rounded-xl pl-10 pr-4 py-3 border-2 border-gray-300 transition-all duration-300 focus:border-primary focus:outline-0 focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Décrivez votre demande ou question..."
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="w-full">
                <button
                  type="submit"
                  disabled={!isFormValid || loader}
                  className={`w-full sm:w-auto px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                    !isFormValid || loader
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5"
                  }`}
                >
                  {loader ? (
                    <>
                      <Icon icon="eos-icons:loading" width={24} height={24} />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Icon
                        icon="solar:plain-3-bold-duotone"
                        width={24}
                        height={24}
                      />
                      Envoyer le message
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Success Message */}
            {showThanks && (
              <div className="mt-6 bg-green-50 border-2 border-green-500 text-green-800 rounded-xl px-6 py-4 flex items-center gap-3 animate-slideInUp">
                <Icon
                  icon="solar:check-circle-bold-duotone"
                  className="text-green-500 text-3xl flex-shrink-0"
                />
                <div>
                  <p className="font-semibold">Message envoyé avec succès!</p>
                  <p className="text-sm text-green-700">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
