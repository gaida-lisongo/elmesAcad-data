"use client";

import Image from "next/image";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderCompetences = () => {
    if (!unite.competences || unite.competences.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {unite.competences.slice(0, 3).map((comp: string, idx: number) => (
          <span
            key={idx}
            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
          >
            {comp}
          </span>
        ))}
        {unite.competences.length > 3 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            +{unite.competences.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white px-3 pt-3 pb-8 shadow-md rounded-lg h-full border border-black/10 group">
      <div className="relative rounded-lg overflow-hidden">
        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 h-40 flex items-center justify-center">
          <Icon
            icon="solar:notebook-minimalistic-outline"
            className="text-primary text-6xl"
          />
        </div>
        <div className="absolute right-2 -bottom-2 bg-green-500 rounded-full px-3 py-1">
          <p className="text-white text-center text-xs font-medium">
            {String(unite.credit)} Crédits
          </p>
        </div>
        {mounted &&
          hydrated &&
          isAuthenticated() &&
          showActions &&
          onEdit &&
          onDelete && (
            <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                onClick={() => onEdit(unite)}
                title="Éditer"
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition"
              >
                <Icon icon="material-symbols:edit" width={20} height={20} />
              </button>
              <button
                onClick={() => onDelete(unite)}
                title="Supprimer"
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                disabled={isSubmitting}
              >
                <Icon icon="material-symbols:delete" width={20} height={20} />
              </button>
            </div>
          )}
      </div>

      <div className="px-3 pt-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-black text-base font-semibold hover:text-primary line-clamp-2 flex-1">
            {String(unite.designation)}
          </h3>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
            {String(unite.code)}
          </span>
        </div>

        <p className="text-sm font-normal text-black/70 line-clamp-3 mb-2">
          {Array.isArray(unite.description)
            ? unite.description.join(" ")
            : String(unite.description)}
        </p>

        {renderCompetences()}

        <div className="flex items-center justify-between pt-3 border-t mt-3 text-xs">
          <div className="flex items-center gap-1 text-primary">
            <Icon icon="solar:book-outline" className="text-base" />
            <p className="font-medium">Unité d'Enseignement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniteCard;
