"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ElementType } from "@/app/(auth)/(titulaire)/layout";
import { useState } from "react";

interface TitulaireSidebarProps {
  elements: ElementType[];
}

export const TitulaireSidebar = ({ elements }: TitulaireSidebarProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (elementId: string) => {
    return pathname.includes(elementId);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-md"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static left-0 top-0 h-screen md:h-auto w-64 bg-slate-100 dark:bg-slate-900 overflow-y-auto transition-transform duration-300 z-40 pt-16 md:pt-0`}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-6 text-black dark:text-white">
            Éléments Constitutifs
          </h2>

          <div className="space-y-2">
            {elements.length > 0 ? (
              elements.map((element) => {
                const isActiveElement = isActive(element._id);
                return (
                  <Link
                    key={element._id}
                    href={`/charge-horaire/${element._id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 rounded-md transition-colors ${
                      isActiveElement
                        ? "bg-primary text-white font-semibold"
                        : "text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-medium">{element.code}</div>
                    <div className="text-sm truncate">
                      {element.designation}
                    </div>
                    <div className="text-xs opacity-75">
                      {element.credit} crédits
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">Aucun élément trouvé</p>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 top-0 left-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
