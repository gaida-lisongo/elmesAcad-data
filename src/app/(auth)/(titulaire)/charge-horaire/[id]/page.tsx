"use client";

import { useParams } from "next/navigation";
import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { useState } from "react";
import Link from "next/link";

const TabItem = ({
  label,
  value,
  activeTab,
  onClick,
}: {
  label: string;
  value: string;
  activeTab: string;
  onClick: (value: string) => void;
}) => (
  <button
    onClick={() => onClick(value)}
    className={`px-6 py-3 font-medium transition-colors ${
      activeTab === value
        ? "border-b-2 border-primary text-primary"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
    }`}
  >
    {label}
  </button>
);

export default function ChargeHorairePage() {
  const params = useParams();
  const elementId = params.id as string;
  const [activeTab, setActiveTab] = useState("fiche-cotation");

  const tabs = [
    { label: "Fiche cotation", value: "fiche-cotation" },
    { label: "Activités", value: "activities" },
    { label: "Ressources", value: "ressources" },
    { label: "Recours", value: "recours" }, // Futur
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Charge Horaire
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Élément ID: {elementId}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="px-6 flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <TabItem
              key={tab.value}
              label={tab.label}
              value={tab.value}
              activeTab={activeTab}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "fiche-cotation" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Fiche Cotation</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Contenu de la fiche cotation pour l'élément ID: {elementId}
              </p>
              <Link
                href={`/fiche-cotation/${elementId}`}
                className="text-primary hover:underline mt-4 inline-block"
              >
                Voir la page complète →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "activities" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Activités</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Les activités pour l'élément ID: {elementId}
              </p>
              <Link
                href={`/activities/${elementId}`}
                className="text-primary hover:underline mt-4 inline-block"
              >
                Voir la page complète →
              </Link>
            </div>
          </div>
        )}

        {activeTab === "ressources" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Ressources</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Les ressources pour l'élément ID: {elementId}
              </p>
              <Link
                href={`/ressources/${elementId}`}
                className="text-primary hover:underline mt-4 inline-block"
              >
                Voir la page complète →
              </Link>
            </div>
          </div>
        )}

        {/* Future Recours tab
        {activeTab === "recours" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Recours</h2>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Les recours pour l'élément ID: {elementId}
              </p>
              <Link
                href={`/recours/${elementId}`}
                className="text-primary hover:underline mt-4 inline-block"
              >
                Voir la page complète →
              </Link>
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );
}
