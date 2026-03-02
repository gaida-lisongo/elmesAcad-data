import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchResultatsByAnnee } from "@/app/actions/jury.actions";
import { fetchAllPromotionsForJury } from "@/app/actions/jury.actions";
import ResultatManagerClient from "@/app/components/JuryComponents/ResultatManagerClient";

export default async function DashboardGrilleDeliberationPage() {
  const anneeRes = await fetchAnneeActive();

  if (!anneeRes.success || !anneeRes.data) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Tableau de bord - Bureau du Jury
        </h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-yellow-600 dark:text-yellow-400">
            Aucune année académique active. Veuillez configurer une année
            active.
          </p>
        </div>
      </div>
    );
  }

  const annee = anneeRes.data;

  const [resultatsRes, promotionsRes] = await Promise.all([
    fetchResultatsByAnnee(annee._id),
    fetchAllPromotionsForJury(),
  ]);

  const resultats = resultatsRes.success ? resultatsRes.data || [] : [];
  const promotions = promotionsRes.success ? promotionsRes.data || [] : [];

  return (
    <ResultatManagerClient
      annee={annee}
      initialResultats={resultats}
      promotions={promotions}
    />
  );
}
