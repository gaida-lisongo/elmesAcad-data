import { fetchPromotionById } from "@/app/actions/promotion.actions";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchHoraires } from "@/app/actions/horaire.actions";
import { fetchStages } from "@/app/actions/stage.actions";
import { fetchSujets } from "@/app/actions/sujet.actions";
import { fetchEnrollements } from "@/app/actions/enrollement.actions";
import { getDocumentsByCategory } from "@/app/actions/documment.actions";
import { notFound } from "next/navigation";
import ProgrammeClient from "./client";
import ProgrammeBanner from "./ProgrammeBanner";

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

  const [releveRes, ficheValidationRes] = await Promise.all([
    getDocumentsByCategory(
      "RELEVE",
      programeId,
      anneeActive?._id?.toString() || "",
    ),
    getDocumentsByCategory(
      "FICHE-VALIDATION",
      programeId,
      anneeActive?._id?.toString() || "",
    ),
  ]);

  const documents = [
    ...(releveRes.success && releveRes.data ? releveRes.data : []),
    ...(ficheValidationRes.success && ficheValidationRes.data
      ? ficheValidationRes.data
      : []),
  ];

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
      <ProgrammeBanner
        programme={programme}
        filiere={filiere}
        section={section}
        anneeActive={anneeActive}
        totalSemestres={totalSemestres}
      />

      {/* Content */}
      <main className="container mt-15 py-10">
        <ProgrammeClient
          programme={programme}
          filiere={filiere}
          section={section}
          horaires={horaires}
          anneeActive={anneeActive}
          stages={stages}
          sujets={sujets}
          enrollements={enrollements ?? []}
          documents={documents}
          totalSemestres={totalSemestres}
          totalCredits={totalCredits}
          totalUnites={totalUnites}
        />
      </main>
    </>
  );
}
