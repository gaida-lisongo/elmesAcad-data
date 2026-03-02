"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export interface AnneeType {
  _id: string;
  debut: string | Date;
  fin: string | Date;
  isActive: boolean;
}

export interface PromotionType {
  _id: string;
  niveau: string;
  designation: string;
  filiere: {
    _id: string;
    sigle: string;
    designation: string;
  };
  section: {
    _id: string;
    mention: string;
    designation: string;
  };
}

interface JurySidebarProps {
  annees: AnneeType[];
  promotions: PromotionType[];
  initialAnneeId?: string;
}

export default function JurySidebar({
  annees,
  promotions,
  initialAnneeId,
}: JurySidebarProps) {
  const pathname = usePathname();
  const [selectedAnneeId, setSelectedAnneeId] = useState<string>(
    initialAnneeId ||
      annees.find((a) => a.isActive)?._id ||
      annees[0]?._id ||
      "",
  );
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [expandedFilieres, setExpandedFilieres] = useState<Set<string>>(
    new Set(),
  );

  const promotionsBySection = promotions.reduce(
    (acc, promo) => {
      const sectionKey = promo.section._id;
      if (!acc[sectionKey]) {
        acc[sectionKey] = {
          ...promo.section,
          filieres: {},
        };
      }
      const filiereKey = promo.filiere._id;
      if (!acc[sectionKey].filieres[filiereKey]) {
        acc[sectionKey].filieres[filiereKey] = {
          ...promo.filiere,
          programmes: [],
        };
      }
      acc[sectionKey].filieres[filiereKey].programmes.push(promo);
      return acc;
    },
    {} as Record<string, any>,
  );

  const sections = Object.values(promotionsBySection);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleFiliere = (filiereId: string) => {
    setExpandedFilieres((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filiereId)) {
        newSet.delete(filiereId);
      } else {
        newSet.add(filiereId);
      }
      return newSet;
    });
  };

  const isPromotionActive = (promotionId: string) => {
    return pathname.includes(`/grille-deliberation/${promotionId}`);
  };

  useEffect(() => {
    const match = pathname.match(/\/grille-deliberation\/([a-f0-9]{24})/);
    if (match) {
      const activePromoId = match[1];
      const activePromo = promotions.find((p) => p._id === activePromoId);
      if (activePromo) {
        setExpandedSections(
          (prev) => new Set([...prev, activePromo.section._id]),
        );
        setExpandedFilieres(
          (prev) => new Set([...prev, activePromo.filiere._id]),
        );
      }
    }
  }, [pathname, promotions]);

  return (
    <div className="w-80 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 overflow-y-auto sticky top-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon
              icon="mdi:gavel"
              className="text-primary"
              width={24}
              height={24}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Bureau du Jury
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Gestion des délibérations
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Année académique
          </label>
          <select
            value={selectedAnneeId}
            onChange={(e) => setSelectedAnneeId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-primary bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            {annees.map((annee) => (
              <option key={annee._id} value={annee._id}>
                {new Date(annee.debut).getFullYear()} -{" "}
                {new Date(annee.fin).getFullYear()}
                {annee.isActive && " (Active)"}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <Link
            href="/grille-deliberation"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === "/grille-deliberation"
                ? "bg-primary text-white"
                : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <Icon icon="mdi:view-dashboard" width={20} height={20} />
            <span className="font-medium">Tableau de bord</span>
          </Link>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Icon icon="mdi:school" width={18} height={18} />
            Promotions
          </h3>

          <div className="space-y-2">
            {sections.map((section: any) => (
              <div key={section._id} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(section._id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                    expandedSections.has(section._id)
                      ? "bg-primary/10 text-primary dark:bg-primary/20"
                      : "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="font-medium text-sm">{section.mention}</span>
                  <Icon
                    icon={
                      expandedSections.has(section._id)
                        ? "mdi:chevron-up"
                        : "mdi:chevron-down"
                    }
                    width={20}
                    height={20}
                  />
                </button>

                {expandedSections.has(section._id) && (
                  <div className="bg-gray-50/50 dark:bg-slate-800/50 py-2">
                    {Object.values(section.filieres).map((filiere: any) => (
                      <div key={filiere._id} className="px-2">
                        <button
                          onClick={() => toggleFiliere(filiere._id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition"
                        >
                          <span className="flex items-center gap-2">
                            <Icon
                              icon="mdi:folder-outline"
                              width={16}
                              height={16}
                            />
                            {filiere.sigle}
                          </span>
                          <Icon
                            icon={
                              expandedFilieres.has(filiere._id)
                                ? "mdi:minus"
                                : "mdi:plus"
                            }
                            width={16}
                            height={16}
                          />
                        </button>

                        {expandedFilieres.has(filiere._id) && (
                          <div className="ml-6 space-y-1 pb-2">
                            {filiere.programmes.map(
                              (programme: PromotionType) => (
                                <Link
                                  key={programme._id}
                                  href={`/grille-deliberation/${programme._id}`}
                                  className={`block px-3 py-2 rounded-md text-sm transition ${
                                    isPromotionActive(programme._id)
                                      ? "bg-primary text-white font-medium"
                                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-primary"
                                  }`}
                                >
                                  <div className="font-medium">
                                    {programme.niveau}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {programme.designation}
                                  </div>
                                </Link>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {sections.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icon
              icon="mdi:information-outline"
              width={32}
              height={32}
              className="mx-auto mb-2 opacity-50"
            />
            <p className="text-sm">Aucune promotion disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
