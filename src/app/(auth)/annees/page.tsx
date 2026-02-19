import { fetchAnnees } from "@/app/actions/annee.actions";
import AnneeDataTable from "@/app/components/AnneeDataTable";

const AnneesPage = async () => {
  const result = await fetchAnnees();
  const annees = result.success && result.data ? result.data : [];

  return <AnneeDataTable initialAnnees={annees} />;
};

export default AnneesPage;
