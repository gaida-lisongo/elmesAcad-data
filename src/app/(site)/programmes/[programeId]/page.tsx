import Image from "next/image";
import { Icon } from "@iconify/react";
import { fetchPromotionById } from "@/app/actions/promotion.actions";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchHoraires } from "@/app/actions/horaire.actions";
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
      <div className="relative w-full h-[400px]">
        <Image
          src="/images/banner/1.jpg"
          alt="Banner"
          width={1920}
          height={400}
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-primary/90 flex items-center justify-center">
          <div className="container text-white px-4">
            {/* Profile Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                {programme.niveau?.charAt(0) || "P"}
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {programme.designation}
                </h1>
                <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start text-sm mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {programme.niveau}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon icon="solar:buildings-outline" width={18} />
                    {filiere.designation}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon
                      icon="solar:notebook-minimalistic-outline"
                      width={18}
                    />
                    {totalSemestres} Semestres
                  </span>
                </div>
                <p className="text-base opacity-90 max-w-2xl whitespace-pre-line">
                  {Array.isArray(programme.description)
                    ? programme.description.join("\n")
                    : programme.description}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center md:text-left">
              <button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold shadow-lg transition flex items-center gap-2 mx-auto md:mx-0">
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
          totalSemestres={totalSemestres}
          totalCredits={totalCredits}
          totalUnites={totalUnites}
        />
      </main>
    </>
  );
}
