import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchFiliereById } from "@/app/actions/filiere.actions";
import Icon from "@/app/components/Icon";
import Link from "next/link";
import PromotionCard from "@/app/components/PromotionCard";

export const metadata: Metadata = {
  title: "Filière | eLearning",
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function FilierePage({ params }: PageProps) {
  const { id } = params;
  const result = await fetchFiliereById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const filiere = result.data;

  // Calculate metrics
  const totalProgrammes = filiere.programmes?.length || 0;

  const totalSemestres =
    filiere.programmes?.reduce(
      (total: number, prog: any) => total + (prog.semestres?.length || 0),
      0,
    ) || 0;

  const totalCredits =
    filiere.programmes?.reduce((total: number, prog: any) => {
      const credits =
        prog.semestres?.reduce(
          (sum: number, sem: any) => sum + (sem.credit || 0),
          0,
        ) || 0;
      return total + credits;
    }, 0) || 0;

  const totalUnites =
    filiere.programmes?.reduce((total: number, prog: any) => {
      const unites =
        prog.semestres?.reduce(
          (sum: number, sem: any) => sum + (sem.unites?.length || 0),
          0,
        ) || 0;
      return total + unites;
    }, 0) || 0;

  return (
    <main className="min-h-screen bg-slate-gray">
      {/* Cover Photo / Banner */}
      <div className="relative h-[400px] bg-gradient-to-r from-primary to-secondary">
        <img
          src={"/images/banner/1.jpg"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      {/* Profile Section */}
      <div className="container relative">
        <div className="bg-white rounded-b-2xl shadow-lg -mt-24 relative z-10">
          <div className="px-8 pt-6 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Sigle Circle (Profile Picture) */}
              <div className="flex-shrink-0 -mt-20">
                <div className="w-40 h-40 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">
                      {filiere.sigle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Designation & Description */}
              <div className="flex-1 md:pb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-midnight_text mb-3">
                  {filiere.designation}
                </h1>
                <p className="text-base text-gray-600 max-w-3xl whitespace-pre-line">
                  {filiere.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Icon
                      icon="material-symbols:school"
                      className="text-primary"
                    />
                    {totalProgrammes} programme{totalProgrammes > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon
                      icon="material-symbols:group"
                      className="text-primary"
                    />
                    Section: {filiere.sectionName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Metrics (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Metrics Cards */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-midnight_text mb-4 flex items-center gap-2">
                <Icon
                  icon="material-symbols:analytics"
                  className="text-primary text-2xl"
                />
                Statistiques
              </h2>

              <div className="space-y-4">
                {/* Total Programmes */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Icon
                        icon="material-symbols:school"
                        className="text-white text-2xl"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Programmes</p>
                      <p className="text-2xl font-bold text-midnight_text">
                        {totalProgrammes}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Semestres */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                      <Icon
                        icon="material-symbols:calendar-month"
                        className="text-white text-2xl"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Semestres</p>
                      <p className="text-2xl font-bold text-midnight_text">
                        {totalSemestres}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Credits */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                      <Icon
                        icon="material-symbols:star"
                        className="text-white text-2xl"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Crédits</p>
                      <p className="text-2xl font-bold text-midnight_text">
                        {totalCredits}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Unites */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                      <Icon
                        icon="material-symbols:book"
                        className="text-white text-2xl"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Unités</p>
                      <p className="text-2xl font-bold text-midnight_text">
                        {totalUnites}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            {/* <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-midnight_text mb-3">
                À propos de cette filière
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="text-primary text-xl flex-shrink-0 mt-0.5"
                  />
                  <p>Formation complète et structurée</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="text-primary text-xl flex-shrink-0 mt-0.5"
                  />
                  <p>Programmes accrédités</p>
                </div>
                <div className="flex items-start gap-2">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="text-primary text-xl flex-shrink-0 mt-0.5"
                  />
                  <p>Enseignants qualifiés</p>
                </div>
              </div>
            </div> */}
          </div>

          {/* Right Column - Programmes (3/5) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-midnight_text mb-6 flex items-center gap-2">
                <Icon
                  icon="material-symbols:school"
                  className="text-primary text-2xl"
                />
                Programmes disponibles ({totalProgrammes})
              </h2>

              {filiere.programmes && filiere.programmes.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filiere.programmes.map((programme: any, index: number) => (
                    <PromotionCard
                      key={programme._id || index}
                      promotion={{
                        ...programme,
                        filiere: filiere.designation,
                        filiereName: filiere.designation,
                      }}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icon
                    icon="material-symbols:school-outline"
                    className="text-gray-300 text-6xl mx-auto mb-4"
                  />
                  <p className="text-gray-500">
                    Aucun programme disponible pour cette filière
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {/* <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-xl p-8 mb-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Intéressé par cette filière ?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Contactez-nous pour plus d'informations ou pour commencer votre
            inscription.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            Nous contacter
          </Link>
        </div> */}
      </div>
    </main>
  );
}
