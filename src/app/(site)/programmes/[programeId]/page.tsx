import Image from "next/image";
import { Icon } from "@iconify/react";
import { fetchPromotionById } from "@/app/actions/promotion.actions";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchHoraires } from "@/app/actions/horaire.actions";
import { fetchStages } from "@/app/actions/stage.actions";
import { fetchSujets } from "@/app/actions/sujet.actions";
import { fetchEnrollements } from "@/app/actions/enrollement.actions";
import { notFound } from "next/navigation";
import ProgrammeClient from "./client";

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ programeId: string }>;
}) {
  const unwrappedParams = await params;
  const { programeId } = unwrappedParams;

  // Fetch promotion data
  const promotionRes = await fetchPromotionById(programeId);
  if (!promotionRes.success || !promotionRes.data) {
    notFound();
  }

  const { programme, filiere, section } = promotionRes.data;

  // Fetch active year
  const anneeRes = await fetchAnneeActive();
  const anneeActive = anneeRes.success ? anneeRes.data : null;

  // Fetch horaires for this promotion and active year
  const horairesRes = await fetchHoraires(
    programeId,
    anneeActive?._id?.toString(),
  );
  const horaires = horairesRes.success ? horairesRes.data : [];

  // Fetch stages
  const stagesRes = await fetchStages(
    anneeActive?._id?.toString() || "",
    programeId,
  );
  const stages = stagesRes.success ? stagesRes.data : [];

  // Fetch sujets
  const sujetsRes = await fetchSujets(
    anneeActive?._id?.toString() || "",
    programeId,
  );
  const sujets = sujetsRes.success ? sujetsRes.data : [];

  // Fetch enrollements
  const enrollementsRes = await fetchEnrollements(
    anneeActive?._id?.toString() || "",
    programeId,
  );
  const enrollements = enrollementsRes.success ? enrollementsRes.data : [];

  // Calculate stats
  const totalSemestres = programme.semestres?.length || 0;
  const totalCredits =
    programme.semestres?.reduce(
      (sum: number, sem: any) => sum + (sem.credit || 0),
      0,
    ) || 0;
  const totalUnites =
    programme.semestres?.reduce(
      (sum: number, sem: any) => sum + (sem.unites?.length || 0),
      0,
    ) || 0;

  return (
    <>
      {/* Bannière avec image et description */}
      <div className="relative w-full h-[500px]">
        <Image
          src="/images/banner/1.jpg"
          alt="Banner"
          width={1920}
          height={500}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60 flex items-center justify-center">
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
              <button className="bg-primary text-white hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold shadow-lg transition flex items-center gap-2">
                <Icon icon="material-symbols:add" width={20} />
                S'inscrire à cette promotion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container py-10">
        <ProgrammeClient
          programme={programme}
          filiere={filiere}
          section={section}
          horaires={horaires}
          anneeActive={anneeActive}
          stages={stages}
          sujets={sujets}
          enrollements={enrollements}
          totalSemestres={totalSemestres}
          totalCredits={totalCredits}
          totalUnites={totalUnites}
        />
      </main>
    </>
  );
}
