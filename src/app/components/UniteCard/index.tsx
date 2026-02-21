"use client";

import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";

interface UniteCardProps {
  unite: any;
  onEdit?: (unite: any) => void;
  onDelete?: (unite: any) => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

const UniteCard = ({
  unite,
  onEdit,
  onDelete,
  isSubmitting = false,
  showActions = true,
}: UniteCardProps) => {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Code + Icon */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon
                icon="solar:notebook-minimalistic-outline"
                className="text-primary text-2xl"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-semibold text-midnight_text">
                    {String(unite.designation)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Code: {String(unite.code)}
                  </p>
                </div>
                <span className="flex-shrink-0 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  {String(unite.credit)} Crédits
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-sm text-gray-600 ${isExpanded ? "" : "line-clamp-2"}`}
              >
                {Array.isArray(unite.description)
                  ? unite.description.join(" ")
                  : String(unite.description)}
              </p>

              {/* Competences */}
              {unite.competences && unite.competences.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {unite.competences
                    .slice(0, isExpanded ? undefined : 3)
                    .map((comp: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {comp}
                      </span>
                    ))}
                  {!isExpanded && unite.competences.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{unite.competences.length - 3} autres
                    </span>
                  )}
                </div>
              )}

              {/* Actions Row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Icon
                    icon={
                      isExpanded
                        ? "solar:alt-arrow-up-outline"
                        : "solar:alt-arrow-down-outline"
                    }
                    width={14}
                  />
                  {isExpanded ? "Voir moins" : "Voir plus"}
                </button>

                {mounted &&
                  hydrated &&
                  isAuthenticated() &&
                  showActions &&
                  onEdit &&
                  onDelete && (
                    <>
                      <button
                        onClick={() => onEdit(unite)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <Icon icon="material-symbols:edit" width={14} />
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(unite)}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                        disabled={isSubmitting}
                      >
                        <Icon icon="material-symbols:delete" width={14} />
                        Supprimer
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniteCard;
