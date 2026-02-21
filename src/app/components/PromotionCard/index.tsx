"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { useAuthStore } from "@/store/auth.store";
import { useState, useEffect } from "react";
import Link from "next/link";

interface PromotionCardProps {
  promotion: any;
  onEdit?: (promotion: any) => void;
  onDelete?: (promotion: any) => void;
  isSubmitting?: boolean;
  showActions?: boolean;
}

const PromotionCard = ({
  promotion,
  onEdit,
  onDelete,
  isSubmitting = false,
  showActions = true,
}: PromotionCardProps) => {
  const { isAuthenticated, hydrated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculateTotalCredits = (semestres: any[]) => {
    if (!semestres) return 0;
    return semestres.reduce((total, sem) => total + (sem.credit || 0), 0);
  };

  const calculateTotalUnites = (semestres: any[]) => {
    if (!semestres) return 0;
    return semestres.reduce(
      (total, sem) => total + (sem.unites?.length || 0),
      0,
    );
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <div>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Icon
            key={`full-${i}`}
            icon="tabler:star-filled"
            className="text-yellow-500 text-xl inline-block"
          />
        ))}
        {halfStars > 0 && (
          <Icon
            icon="tabler:star-half-filled"
            className="text-yellow-500 text-xl inline-block"
          />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Icon
            key={`empty-${i}`}
            icon="tabler:star-filled"
            className="text-gray-400 text-xl inline-block"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white px-3 pt-3 pb-8 shadow-md rounded-lg h-full border border-black/10 capitalize group">
      <div className="relative rounded-lg overflow-hidden">
        <div className="rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 h-40">
          <Image
            src={`/images/courses/UiUx.webp`}
            alt="programme"
            width={250}
            height={160}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="absolute right-2 -bottom-2 bg-secondary rounded-full p-2">
          <p className="text-white uppercase text-center text-xs font-medium">
            {String(promotion.niveau)}
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
                onClick={() => onEdit(promotion)}
                title="Éditer"
                className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition"
              >
                <Icon icon="material-symbols:edit" width={20} height={20} />
              </button>
              <button
                onClick={() => onDelete(promotion)}
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
        <Link
          href={`/promotions/${promotion._id}`}
          className="text-black text-base font-semibold hover:text-primary line-clamp-2"
        >
          {String(promotion.designation)}
        </Link>
        <p className="text-sm font-normal pt-2 text-black/70 line-clamp-2">
          {String(promotion.filiere || promotion.filiereName || "")}
        </p>
        <div className="flex items-center justify-between py-2 border-b text-xs">
          <div className="flex items-center gap-1">
            <p className="text-red-700 font-medium">
              {promotion.semestres?.length || 0}
            </p>
            <div className="flex scale-75 origin-left">
              {renderStars(promotion.semestres?.length || 0)}
            </div>
          </div>
          <p className="font-medium text-primary">
            {calculateTotalCredits(promotion.semestres)} Crédits
          </p>
        </div>
        <div className="flex justify-between pt-2 text-xs">
          <div className="flex items-center gap-1">
            <Icon
              icon="solar:notebook-minimalistic-outline"
              className="text-primary text-base"
            />
            <p className="font-medium text-black/75">
              {promotion.semestres?.length || 0}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Icon
              icon="solar:users-group-rounded-linear"
              className="text-primary text-base"
            />
            <p className="font-medium text-black/75">
              {calculateTotalUnites(promotion.semestres)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
