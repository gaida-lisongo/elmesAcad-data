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

  const isActiveDashboard = () => {
    return pathname === "/charge-horaire";
  };

  const isActiveElement = (elementId: string) => {
    return pathname.includes(`/charge-horaire/${elementId}`);
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

          {/* Dashboard Link */}
          <div className="space-y-3 mb-8">
            <Link
              href="/charge-horaire"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                isActiveDashboard()
                  ? "bg-primary text-white font-semibold"
                  : "text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Elements Section */}
          <div className="border-t border-gray-300 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-400 uppercase">
              Éléments Constitutifs
            </h3>

            <div className="space-y-2">
              {elements.length > 0 ? (
                elements.map((element) => (
                  <Link
                    key={element._id}
                    href={`/charge-horaire/${element._id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block p-3 rounded-md transition-colors ${
                      isActiveElement(element._id)
                        ? "bg-primary text-white font-semibold"
                        : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-md"
                    }`}
                  >
                    <div className="font-semibold text-sm">{element.code}</div>
                    <div className="text-xs opacity-75 truncate mt-1">
                      {element.designation}
                    </div>
                    <div className="text-xs opacity-60 mt-2">
                      {element.credit} crédits
                    </div>
                  </Link>
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
