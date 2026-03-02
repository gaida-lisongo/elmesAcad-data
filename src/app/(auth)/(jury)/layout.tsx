import { fetchAnnees, fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchAllPromotionsForJury } from "@/app/actions/jury.actions";
import JurySidebar from "@/app/components/JurySidebar";

export default async function JuryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [anneesRes, anneeActiveRes, promotionsRes] = await Promise.all([
    fetchAnnees(),
    fetchAnneeActive(),
    fetchAllPromotionsForJury(),
  ]);

  const annees = anneesRes.success ? anneesRes.data || [] : [];
  const anneeActive = anneeActiveRes.success ? anneeActiveRes.data : null;
  const promotions = promotionsRes.success ? promotionsRes.data || [] : [];

  return (
    <div className="-mx-6 -my-6 flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <JurySidebar
        annees={annees}
        promotions={promotions}
        initialAnneeId={anneeActive?._id}
      />
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
