import { Metadata } from "next"
import { notFound } from "next/navigation"
import { fetchFiliereById } from "@/app/actions/filiere.actions"
import Icon from "@/app/components/Icon"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Filière | eLearning",
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function FilierePage({ params }: PageProps) {
  const { id } = params
  const result = await fetchFiliereById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const filiere = result.data

  return (
    <main className="min-h-screen bg-slate-gray">
      <div className="container py-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Filière</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon
                icon={filiere.icon || "mdi:home"}
                className="text-primary text-5xl"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-midnight_text capitalize">
                {filiere.designation}
              </h1>
              <p className="text-gray-600 mt-2">Faculté de {filiere.designation}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-midnight_text mb-3">
              Description
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {filiere.description}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon
                icon="material-symbols:school"
                className="text-primary text-3xl"
              />
              <h3 className="text-lg font-semibold text-midnight_text">
                Programmes
              </h3>
            </div>
            <p className="text-gray-600">
              Découvrez les différents programmes offerts dans cette filière.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon
                icon="material-symbols:calendar-month"
                className="text-primary text-3xl"
              />
              <h3 className="text-lg font-semibold text-midnight_text">
                Années académiques
              </h3>
            </div>
            <p className="text-gray-600">
              Consultez les années académiques et les sessions disponibles.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon
                icon="material-symbols:person"
                className="text-primary text-3xl"
              />
              <h3 className="text-lg font-semibold text-midnight_text">
                Enseignants
              </h3>
            </div>
            <p className="text-gray-600">
              Rencontrez notre équipe d'enseignants qualifiés.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary rounded-2xl shadow-xl p-8 mt-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Intéressé par cette filière ?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Contactez-nous pour plus d'informations ou pour commencer votre inscription.
          </p>
          <Link
            href="/#contact"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </main>
  )
}
