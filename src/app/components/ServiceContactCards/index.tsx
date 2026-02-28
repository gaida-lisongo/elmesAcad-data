"use client";

import { Icon } from "@iconify/react";

interface Service {
  _id: string;
  titre: string;
  description: string;
  contacts: {
    email: string;
    phone: string;
  };
}

interface ServiceContactCardsProps {
  services: Service[];
}

export default function ServiceContactCards({
  services,
}: ServiceContactCardsProps) {
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-midnight_text mb-3">
            Nos Services
          </h2>
          <p className="text-lg text-gray-600">
            Contactez directement le service concerné
          </p>
        </div>

        {/* Service Cards */}
        <div className="space-y-6 max-w-7xl mx-auto">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Column 1: Service Title */}
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon
                      icon="solar:widget-4-bold-duotone"
                      className="text-primary text-3xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-midnight_text mb-2">
                      {service.titre}
                    </h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                </div>

                {/* Column 2: Description */}
                <div className="lg:col-span-1">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="solar:document-text-bold-duotone"
                      className="text-gray-400 text-2xl mt-1 flex-shrink-0"
                    />
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Column 3: Contact Info */}
                <div className="space-y-4">
                  {/* Email */}
                  {service.contacts?.email && (
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                        <Icon
                          icon="solar:letter-bold-duotone"
                          className="text-green-600 text-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                          Email
                        </p>
                        <a
                          href={`mailto:${service.contacts.email}`}
                          className="text-gray-700 hover:text-primary transition-colors font-medium truncate block"
                        >
                          {service.contacts.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {service.contacts?.phone && (
                    <div className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Icon
                          icon="solar:phone-bold-duotone"
                          className="text-blue-600 text-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">
                          Téléphone
                        </p>
                        <a
                          href={`tel:${service.contacts.phone}`}
                          className="text-gray-700 hover:text-primary transition-colors font-medium truncate block"
                        >
                          {service.contacts.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* No contact info */}
                  {!service.contacts?.email && !service.contacts?.phone && (
                    <p className="text-sm text-gray-400 italic">
                      Aucune information de contact disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
