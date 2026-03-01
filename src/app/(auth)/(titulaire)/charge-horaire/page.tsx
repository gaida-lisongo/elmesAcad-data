"use client";

import { fetchAnneeActive } from "@/app/actions/annee.actions";
import { fetchElementByTitulaireIdAndAnneeId } from "@/app/actions/unite-element.actions";
import Loader from "@/app/components/Common/Loader";
import { ChargeHoraireDetailsBoard } from "@/app/components/ChargeHoraire/ChargeHoraireDetailsBoard";
import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";

export default function ChargeHoraireMainPage() {
  const { user } = useAuthStore();
  const [currentAnnee, setCurrentAnnee] = useState<any | null>(null);
  const [elements, setElements] = useState<ElementType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch active year
  useEffect(() => {
    fetchAnneeActive()
      .then((res) => {
        if (res?.success && res.data) {
          setCurrentAnnee(res.data);
        } else {
          setCurrentAnnee(null);
        }
      })
      .catch(() => setCurrentAnnee(null));
  }, []);

  // Fetch elements
  useEffect(() => {
    if (currentAnnee && user?._id) {
      setLoading(true);
      fetchElementByTitulaireIdAndAnneeId(user._id, currentAnnee._id)
        .then((res) => {
          if (res?.success && res.data) {
            setElements(res.data);
          } else {
            setElements([]);
          }
        })
        .catch(() => setElements([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentAnnee, user?._id]);

  const handleElementUpdate = (updatedElement: ElementType) => {
    // Update the element in the local state
    setElements((prevElements) =>
      prevElements.map((el) =>
        el._id === updatedElement._id ? updatedElement : el,
      ),
    );
    // Here you can also call an API to save the changes to the backend
    console.log("Element updated:", updatedElement);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestion de la Charge Horaire
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {currentAnnee
            ? `Année académique: ${new Date(currentAnnee.debut).getFullYear()} - ${new Date(currentAnnee.fin).getFullYear()}`
            : "Aucune année académique active"}
        </p>
      </div>

      {/* Content */}
      {elements.length > 0 ? (
        <ChargeHoraireDetailsBoard
          elements={elements}
          onElementUpdate={handleElementUpdate}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Aucun élément constitutif
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas d'éléments constitutifs assignés pour l'année
            académique en cours.
          </p>
        </div>
      )}
    </div>
  );
}
