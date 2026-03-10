"use client";

import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface UniteCardProps {
  item: any;
  type: "unite" | "stage" | "sujet" | "enrollement" | "document";
  showActions?: boolean;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  isSubmitting?: boolean;
}

const UniteCard = ({
  item,
  type,
  showActions = false,
  onEdit,
  onDelete,
  isSubmitting = false,
}: UniteCardProps) => {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration par type
  const config = {
    unite: {
      icon: "solar:notebook-minimalistic-outline",
      labelField: "designation",
      codeField: "code",
      creditField: "credit",
      descriptionField: "description",
      detailUrl: `/unite/${item._id}`,
      creditLabel: "Crédits",
    },
    stage: {
      icon: "material-symbols:business",
      labelField: "designation",
      codeField: null,
      creditField: "prix",
      descriptionField: "description",
      detailUrl: `/produit/stage-${item._id}`,
      creditLabel: "$",
    },
    sujet: {
      icon: "solar:document-text-outline",
      labelField: "designation",
      codeField: null,
      creditField: "prix",
      descriptionField: "description",
      detailUrl: `/produit/sujet-${item._id}`,
      creditLabel: "$",
    },
    enrollement: {
      icon: "solar:calendar-outline",
      labelField: "designation",
      codeField: null,
      creditField: "prix",
      descriptionField: "description",
      detailUrl: `/produit/enrollement-${item._id}`,
      creditLabel: "$",
    },
    document: {
      icon: "material-symbols:description-outline",
      labelField: "designation",
      codeField: null,
      creditField: "prix",
      descriptionField: "description",
      detailUrl: `/produit/document-${item._id}`,
      creditLabel: "$",
    },
  };

  const currentConfig = config[type];

  const getDescription = () => {
    const desc = item[currentConfig.descriptionField];
    return Array.isArray(desc) ? desc.join(" ") : String(desc);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Code + Icon */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon
                icon={currentConfig.icon}
                className="text-primary text-2xl"
              />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-semibold text-midnight_text">
                    {String(item[currentConfig.labelField])}
                  </h3>
                  {currentConfig.codeField && item[currentConfig.codeField] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Code: {String(item[currentConfig.codeField])}
                    </p>
                  )}
                </div>
                {item[currentConfig.creditField] && (
                  <span className="flex-shrink-0 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {type === "unite"
                      ? `${String(item[currentConfig.creditField])} ${currentConfig.creditLabel}`
                      : `${currentConfig.creditLabel}${String(item[currentConfig.creditField])}`}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600">{getDescription()}</p>

              {/* Actions Row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={currentConfig.detailUrl}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  <Icon icon="solar:eye-outline" width={14} />
                  Voir le détail
                </Link>

                {mounted &&
                  hydrated &&
                  isAuthenticated() &&
                  showActions &&
                  onEdit &&
                  onDelete && (
                    <>
                      <button
                        onClick={() => onEdit(item)}
                        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <Icon icon="material-symbols:edit" width={14} />
                        Éditer
                      </button>
                      <button
                        onClick={() => onDelete(item)}
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
