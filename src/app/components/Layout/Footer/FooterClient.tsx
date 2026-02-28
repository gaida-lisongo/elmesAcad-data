"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "../Header/Logo";
import { Icon } from "@iconify/react/dist/iconify.js";

type FiliereLink = {
  _id: string;
  sigle?: string;
  designation?: string;
};

type CalendrierItem = {
  _id?: string;
  photo?: string;
  from?: string;
  to?: string;
  title?: string;
  description?: string[];
  items?: string[];
};

type ContactData = {
  adresse?: string;
  email?: string;
  phone?: string;
} | null;

export default function FooterClient({
  promesse,
  filieres,
  contact,
  calendrier,
}: {
  promesse: string;
  filieres: FiliereLink[];
  contact: ContactData;
  calendrier: CalendrierItem[];
}) {
  const [openCalendrier, setOpenCalendrier] = useState(false);

  const sortedCalendrier = useMemo(() => {
    return [...(calendrier || [])].sort((a, b) => {
      const aDate = new Date(a.from || "").getTime();
      const bDate = new Date(b.from || "").getTime();
      return aDate - bDate;
    });
  }, [calendrier]);

  const renderDescription = () => {
    return (
      <div className="col-span-12 lg:col-span-4">
        <div className="mb-6">
          <Logo />
        </div>
        <p className="text-black/70 leading-7 text-base max-w-md">
          {promesse ||
            "ElmesAcad accompagne les étudiants avec des parcours structurés, un suivi rigoureux et une pédagogie orientée résultats."}
        </p>
      </div>
    );
  };

  const renderLinks = () => {
    return (
      <div className="col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div>
          <p className="text-black text-xl font-semibold mb-6">Filières</p>
          <ul className="space-y-3 max-h-56 overflow-y-auto pr-2">
            {filieres.length > 0 ? (
              filieres.map((filiere) => (
                <li key={filiere._id}>
                  <Link
                    href={`/filiere/${filiere._id}`}
                    className="text-black/60 hover:text-primary text-base transition-colors"
                  >
                    {filiere.sigle || filiere.designation || "Filière"}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-black/50 text-sm">Aucune filière disponible</li>
            )}
          </ul>
        </div>

        <div>
          <p className="text-black text-xl font-semibold mb-6">Accès rapides</p>
          <ul className="space-y-3">
            <li>
              <Link
                href="/programmes"
                className="text-black/60 hover:text-primary text-base transition-colors"
              >
                Programmes
              </Link>
            </li>
            <li>
              <button
                onClick={() => setOpenCalendrier(true)}
                className="text-black/60 hover:text-primary text-base transition-colors"
              >
                Calendrier
              </button>
            </li>
            <li>
              <Link
                href="/about"
                className="text-black/60 hover:text-primary text-base transition-colors"
              >
                À propos
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-black/60 hover:text-primary text-base transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    return (
      <div className="col-span-12 lg:col-span-3">
        <p className="text-black text-xl font-semibold mb-6">Coordonnées</p>
        <div className="flex flex-col gap-5">
          <div className="flex items-start">
            <Icon
              icon="solar:point-on-map-perspective-bold"
              className="text-primary text-2xl inline-block me-2 mt-0.5"
            />
            <p className="text-black/70 text-base">
              {contact?.adresse || "Adresse non définie"}
            </p>
          </div>

          <Link
            href={contact?.phone ? `tel:${contact.phone}` : "#"}
            className="flex items-center w-fit"
          >
            <Icon
              icon="solar:phone-bold"
              className="text-primary text-2xl inline-block me-2"
            />
            <p className="text-black/70 hover:text-primary text-base transition-colors">
              {contact?.phone || "Téléphone non défini"}
            </p>
          </Link>

          <Link
            href={contact?.email ? `mailto:${contact.email}` : "#"}
            className="flex items-center w-fit"
          >
            <Icon
              icon="solar:mailbox-bold"
              className="text-primary text-2xl inline-block me-2"
            />
            <p className="text-black/70 hover:text-primary text-base transition-colors">
              {contact?.email || "Email non défini"}
            </p>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      <footer className="bg-deep-slate pt-12">
        <div className="container">
          <div className="grid grid-cols-12 gap-10 pb-12">
            {renderDescription()}
            {renderLinks()}
            {renderContact()}
          </div>

          <div className="lg:flex items-center justify-between border-t border-black/10 py-6">
            <p className="text-black/60 text-sm text-center lg:text-start font-normal">
              © {new Date().getFullYear()} ElmesAcad. Réalisé à partir d’un template de{" "}
              <Link
                href="https://getnextjstemplates.com/"
                target="_blank"
                className="hover:text-primary hover:underline"
              >
                GetNextJsTemplates.com
              </Link>
              .
            </p>

            <div className="flex items-center gap-4 mt-4 lg:mt-0 justify-center lg:justify-start">
              <Link
                href="https://facebook.com"
                target="_blank"
                className="hover:text-primary text-black text-2xl transition-colors"
              >
                <Icon icon="tabler:brand-facebook" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="hover:text-primary text-black text-2xl transition-colors"
              >
                <Icon icon="tabler:brand-twitter" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="hover:text-primary text-black text-2xl transition-colors"
              >
                <Icon icon="tabler:brand-instagram" />
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {openCalendrier && (
        <div className="fixed inset-0 z-[999] bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-midnight_text">
                Calendrier de l’année courante
              </h3>
              <button
                onClick={() => setOpenCalendrier(false)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                <Icon icon="material-symbols:close-rounded" width={28} height={28} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-4">
              {sortedCalendrier.length > 0 ? (
                sortedCalendrier.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="border border-gray-200 rounded-xl p-5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                      <h4 className="text-lg font-semibold text-midnight_text">
                        {item.title || "Activité"}
                      </h4>
                      <span className="text-sm text-primary bg-primary/10 rounded-full px-3 py-1">
                        {item.from || "-"} → {item.to || "-"}
                      </span>
                    </div>

                    {Array.isArray(item.description) && item.description.length > 0 && (
                      <ul className="list-disc ps-5 space-y-1 text-black/70 mb-3">
                        {item.description.map((desc, i) => (
                          <li key={i}>{desc}</li>
                        ))}
                      </ul>
                    )}

                    {Array.isArray(item.items) && item.items.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.items.map((detail, i) => (
                          <span
                            key={i}
                            className="text-xs px-3 py-1 rounded-full bg-slate-gray text-black/70"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-black/60">Aucune activité enregistrée pour cette année.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
