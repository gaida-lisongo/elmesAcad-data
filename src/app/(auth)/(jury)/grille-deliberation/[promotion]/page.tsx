import {
  fetchAllNotesForPromotion,
  fetchPromotionWithSemestres,
} from "@/app/actions/jury.actions";
import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { NoteManager, type ResultatEtudiant } from "@/utils/NoteManager";
import PromotionDeliberationClient from "@/app/components/JuryComponents/PromotionDeliberationClient";

export default async function PromotionGrilleDeliberationPage({
  params,
}: {
  params: Promise<{ promotion: string }>;
}) {
  const { promotion: promotionId } = await params;

  const [anneeRes, promotionRes] = await Promise.all([
    fetchAnneeActive(),
    fetchPromotionWithSemestres(promotionId),
  ]);

  if (!anneeRes.success || !anneeRes.data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Aucune année académique active
          </p>
        </div>
      </div>
    );
  }

  if (!promotionRes.success || !promotionRes.data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Promotion non trouvée
          </p>
        </div>
      </div>
    );
  }

  const annee = anneeRes.data;
  const promotion = promotionRes.data;

  const notesRes = await fetchAllNotesForPromotion(promotionId, annee._id);

  const notesEtudiants = notesRes.success ? notesRes.data || [] : [];

  const resultats: ResultatEtudiant[] =
    NoteManager.calculerResultatsPromotion(notesEtudiants);
  const resultatsClasses = NoteManager.classerParPourcentage(resultats);
  //   console.log("Résultats classés :", resultatsClasses);

  return (
    <PromotionDeliberationClient
      promotion={promotion}
      annee={annee}
      resultats={resultatsClasses}
      promotionId={promotionId}
    />
  );
}
