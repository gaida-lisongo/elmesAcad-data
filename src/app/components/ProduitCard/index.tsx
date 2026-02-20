"use client";

import { Icon } from "@iconify/react";

interface ProduitCardProps {
  designation: string;
  prix: number;
  isActive: boolean;
  dateDebut: string;
  dateFin: string;
  description?: string[];
  metadata?: {
    icon: string;
    label: string;
    value: string | number;
  };
  imageUrl?: string;
  onEdit: () => void;
  onManage: () => void;
  manageLabel: string;
}

export default function ProduitCard({
  designation,
  prix,
  isActive,
  dateDebut,
  dateFin,
  description,
  metadata,
  imageUrl = "/images/courses/mern.webp",
  onEdit,
  onManage,
  manageLabel,
}: ProduitCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:shadow-xl dark:border-strokedark dark:bg-boxdark">
      {/* Card Header with Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={designation}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Status badge */}
        <div className="absolute right-4 top-4 z-10">
          {isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Icon icon="material-symbols:check-circle" />
              Actif
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Icon icon="material-symbols:cancel" />
              Inactif
            </span>
          )}
        </div>

        {/* Price */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-lg">
            <Icon icon="material-symbols:payments" />${prix}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h4 className="mb-3 line-clamp-2 text-lg font-bold text-black dark:text-white">
          {designation}
        </h4>

        {/* Dates */}
        <div className="mb-4 flex items-center gap-4 text-sm text-bodydark">
          <div className="flex items-center gap-1">
            <Icon icon="material-symbols:calendar-today" />
            {formatDate(dateDebut)}
          </div>
          <span>→</span>
          <div className="flex items-center gap-1">
            <Icon icon="material-symbols:event" />
            {formatDate(dateFin)}
          </div>
        </div>

        {/* Description Preview */}
        {description && description.length > 0 && (
          <div className="mb-4">
            <p className="mb-1 text-xs font-medium text-bodydark">
              Description ({description.length} points)
            </p>
            <div className="line-clamp-2 text-sm text-bodydark">
              • {description[0]}
            </div>
          </div>
        )}

        {/* Metadata (flexible) */}
        {metadata && (
          <div className="mb-4 flex items-center gap-2">
            <Icon icon={metadata.icon} className="text-xl text-primary" />
            <span className="text-sm font-medium text-bodydark">
              {metadata.value} {metadata.label}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 border-t border-stroke pt-4 dark:border-strokedark">
          <button
            onClick={onManage}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            <Icon icon="material-symbols:settings" />
            {manageLabel}
          </button>

          <button
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Icon icon="material-symbols:edit" />
            Modifier
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary opacity-0 transition-opacity group-hover:opacity-100"></div>
    </div>
  );
}
