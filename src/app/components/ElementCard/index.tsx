"use client";

import { Icon } from "@iconify/react";

export interface ElementCardData {
  _id: string;
  code: string;
  designation: string;
  credit: number;
  objectifs: string[];
  place_ec: string;
  uniteId: string;
  anneeId: string;
  titulaireId?: string;
}

interface ElementCardProps {
  element: ElementCardData;
  onView?: (element: ElementCardData) => void;
  onDelete?: (elementId: string, e: React.MouseEvent) => void;
  deletingId?: string | null;
  showActions?: boolean;
}

export default function ElementCard({
  element,
  onView,
  onDelete,
  deletingId,
  showActions = true,
}: ElementCardProps) {
  return (
    <div
      onClick={() => onView?.(element)}
      className={`group relative overflow-hidden rounded-2xl border border-stroke bg-white shadow-sm transition-all hover:shadow-xl dark:border-strokedark dark:bg-boxdark ${onView ? "cursor-pointer" : ""}`}
    >
      {/* Card Header with Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="/images/courses/webflow.webp"
          alt={element.designation}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Credit Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-lg">
            <Icon icon="material-symbols:credit-card" className="text-sm" />
            {element.credit} crédits
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Code badge */}
        <div className="mb-2">
          <span className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-bodydark dark:bg-meta-4">
            {element.code}
          </span>
        </div>

        {/* Designation */}
        <h4 className="mb-2 line-clamp-2 text-base font-bold text-black dark:text-white">
          {element.designation}
        </h4>

        {/* Objectifs Preview */}
        {element.objectifs && element.objectifs.length > 0 && (
          <div className="mb-3">
            <p className="mb-0.5 text-xs font-medium text-bodydark">
              Objectifs ({element.objectifs.length})
            </p>
            <p className="line-clamp-2 text-sm text-bodydark">
              {element.objectifs[0]}
              {element.objectifs.length > 1 && "…"}
            </p>
          </div>
        )}

        {/* Place EC Preview */}
        {element.place_ec && (
          <p className="mb-3 line-clamp-2 text-sm text-bodydark">
            {element.place_ec}
          </p>
        )}

        {/* Footer */}
        {showActions && (
          <div className="flex items-center justify-between border-t border-stroke pt-3 dark:border-strokedark">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(element);
              }}
              className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Voir détails
              <Icon icon="material-symbols:arrow-forward" className="text-sm" />
            </button>

            {onDelete && (
              <button
                onClick={(e) => onDelete(element._id, e)}
                disabled={deletingId === element._id}
                className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                title="Supprimer"
              >
                <Icon
                  icon="material-symbols:delete-outline"
                  className="text-lg"
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hover border effect */}
      {onView && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-primary opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}
