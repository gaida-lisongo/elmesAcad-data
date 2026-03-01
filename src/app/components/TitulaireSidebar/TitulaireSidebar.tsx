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

  const isActive = () => {
    return pathname.includes("/charge-horaire");
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
            Gestion Pédagogique
          </h2>

          <div className="space-y-3">
            <Link
              href="/charge-horaire"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                isActive()
                  ? "bg-primary text-white font-semibold"
                  : "text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">📋</span>
              <span>Dashboard Pédagogique</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-300 dark:border-slate-700">
            <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-400 uppercase">
              Vos Éléments
            </h3>

            <div className="space-y-2">
              {elements.length > 0 ? (
                elements.map((element) => (
                  <div
                    key={element._id}
                    className="p-3 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-colors"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {element.code}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                      {element.designation}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {element.credit} crédits
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucun élément trouvé</p>
              )}
            </div>
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
