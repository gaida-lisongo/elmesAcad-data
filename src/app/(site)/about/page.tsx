import { Metadata } from "next";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchSloganByAnnee } from "@/app/actions/slogan.actions";
import { fetchStructureByAnnee } from "@/app/actions/structure.actions";
import { fetchTeamByAnnee } from "@/app/actions/team.actions";
import { fetchServices } from "@/app/actions/service.actions";
import { fetchMetrics } from "@/app/actions/metrics.actions";
import SloganSection from "@/app/components/About/SloganSection";
import StructureSection from "@/app/components/About/StructureSection";
import TeamSection from "@/app/components/About/TeamSection";

export const metadata: Metadata = {
  title: "À Propos | ElmesAcad",
  description:
    "Découvrez notre institution, notre équipe et notre structure organisationnelle",
};

const AboutPage = async () => {
  // Fetch active année
  const anneeResult = await fetchAnneeActive();
  const annee = anneeResult.data;
  const anneeId = annee?._id || "";

  // Fetch all data in parallel
  const [
    sloganResult,
    structureResult,
    teamResult,
    servicesResult,
    metricsResult,
  ] = await Promise.all([
    fetchSloganByAnnee(anneeId),
    fetchStructureByAnnee(anneeId),
    fetchTeamByAnnee(anneeId),
    fetchServices(),
    fetchMetrics(anneeId),
  ]);

  const slogan = sloganResult.data;
  const structure = structureResult.data;
  const team = teamResult.data || [];
  const services = servicesResult.data || [];
  const metrics = metricsResult.data || {
    promotions: 0,
    unites: 0,
    sujets: 0,
    stages: 0,
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section with Slogan and Metrics */}
      <SloganSection slogan={slogan} metrics={metrics} anneeId={anneeId} />

      {/* Structure Section */}
      <StructureSection structure={structure} anneeId={anneeId} />

      {/* Team Section */}
      <TeamSection team={team} services={services} anneeId={anneeId} />
    </main>
  );
};

export default AboutPage;
