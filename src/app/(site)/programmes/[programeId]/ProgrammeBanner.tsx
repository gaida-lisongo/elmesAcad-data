"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import InscriptionModal from "@/app/components/Modals/InscriptionModal";

interface ProgrammeBannerProps {
  programme: any;
  filiere: any;
  section: any;
  anneeActive: any;
  totalSemestres: number;
}

export default function ProgrammeBanner({
  programme,
  filiere,
  section,
  anneeActive,
  totalSemestres,
}: ProgrammeBannerProps) {
  const [showInscriptionModal, setShowInscriptionModal] = useState(false);

  return (
    <>
      <div className="relative w-full h-[500px]">
        <Image
          src="/images/banner/1.jpg"
          alt="Banner"
          width={1920}
          height={500}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60 flex items-center justify-center pt-55">
          <div className="container text-gray-900 px-4">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
                {programme.designation}
              </h1>
              <div className="flex flex-wrap items-center gap-3 justify-center text-sm mb-4">
                <span className="bg-primary/20 px-4 py-2 rounded-full backdrop-blur-sm font-medium text-primary">
                  {programme.niveau}
                </span>
                <span className="flex items-center gap-1 bg-gray-900/10 px-4 py-2 rounded-full backdrop-blur-sm text-gray-900">
                  <Icon icon="solar:buildings-outline" width={18} />
                  {filiere.designation}
                </span>
                <span className="flex items-center gap-1 bg-gray-900/10 px-4 py-2 rounded-full backdrop-blur-sm text-gray-900">
                  <Icon icon="solar:notebook-minimalistic-outline" width={18} />
                  {totalSemestres} Semestres
                </span>
              </div>
              <p className="text-lg max-w-3xl whitespace-pre-line mb-6 text-gray-800">
                {Array.isArray(programme.description)
                  ? programme.description.join("\n")
                  : programme.description}
              </p>

              {/* CTA Button */}
              <button
                onClick={() => setShowInscriptionModal(true)}
                className="bg-primary text-white hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold shadow-lg transition flex items-center gap-2"
              >
                <Icon icon="material-symbols:add" width={20} />
                S'inscrire à cette promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inscription Modal */}
      {anneeActive && (
        <InscriptionModal
          isOpen={showInscriptionModal}
          onClose={() => setShowInscriptionModal(false)}
          promotionId={programme._id}
          promotionNom={programme.designation}
          promotionNiveau={programme.niveau}
          anneeId={anneeActive._id}
          anneeDesignation={anneeActive.designation}
          filiereNom={filiere.designation}
          sectionNom={section.designation}
        />
      )}
    </>
  );
}
