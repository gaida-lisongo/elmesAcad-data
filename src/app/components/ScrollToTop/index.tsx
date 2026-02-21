"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import { useAuthStore } from "@/store/auth.store";
import { Icon } from "@iconify/react";

interface NavMenuItem {
  label: string;
  href?: string;
  action?: () => void;
  icon: ReactNode;
  pack: "basic" | "pro" | "elite";
}

interface NavMenu {
  category: string;
  items: NavMenuItem[];
}

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const currentPack = process.env.NEXT_PUBLIC_PACK || "basic"; // Récupérer le pack de l'utilisateur depuis les variables d'environnement ou le store

  const navMenu: NavMenu[] = [
    {
      category: "SUPER-ADMIN",
      items: [
        {
          label: "Années académiques",
          href: "/annees",
          icon: (
            <Icon
              icon="material-symbols:calendar-month-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Paramètres",
          href: "/settings",
          icon: (
            <Icon
              icon="material-symbols:settings-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
      ],
    },
    {
      category: "ADMIN",
      items: [
        {
          label: "Gestion des utilisateurs",
          href: "/users",
          icon: (
            <Icon
              icon="material-symbols:manage-accounts-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Gestion des étudiants",
          href: "/students",
          icon: (
            <Icon
              icon="material-symbols:school-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Gestion des inscriptions",
          href: "/subscriptions",
          icon: (
            <Icon
              icon="material-symbols:assignment-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
      ],
    },
    {
      category: "ENSEIGNEMENT",
      items: [
        {
          label: "Gestion des cours",
          href: "/cours",
          icon: (
            <Icon
              icon="material-symbols:school-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Gestion des enrollements",
          href: "/enrollements",
          icon: (
            <Icon
              icon="material-symbols:book-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
      ],
    },
    {
      category: "FINANCE",
      items: [
        {
          label: "Paiements Stages",
          href: "/finance/stages",
          icon: (
            <Icon
              icon="material-symbols:attach-money"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Paiements Sujets",
          href: "/finance/sujets",
          icon: (
            <Icon
              icon="material-symbols:attach-money"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Paiements Enrollements",
          href: "/finance/enrollements",
          icon: (
            <Icon
              icon="material-symbols:attach-money"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
      ],
    },
    {
      category: "RECHERCHE",
      items: [
        {
          label: "Gestion des stages",
          href: "/stages",
          icon: (
            <Icon
              icon="material-symbols:work-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
        {
          label: "Gestion des sujets de recherche",
          href: "/sujets",
          icon: (
            <Icon
              icon="material-symbols:science-outline"
              width={24}
              height={24}
              className="text-primary"
            />
          ),
          pack: "basic",
        },
      ],
    },
  ];

  console.log("User autorisations:", user?.autorisations);
  //Save menu user in useMemo to avoid re-rendering the menu on every render
  const filteredNavMenu = user?.autorisations
    ? navMenu.filter((menu) => user?.autorisations.includes(menu.category))
    : [];

  // Top: 0 takes us all the way back to the top of the page
  // Behavior: smooth keeps it smooth!
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      drawerRef.current &&
      !drawerRef.current.contains(event.target as Node) &&
      isDrawerOpen
    ) {
      setIsDrawerOpen(false);
    }
  };

  useEffect(() => {
    // Button is displayed after scrolling for 500 pixels
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isDrawerOpen]);

  return (
    <>
      <div className="fixed bottom-8 right-8 z-999">
        <div className="flex items-center gap-2.5">
          {isAuthenticated() && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-primary text-white hover:bg-primary/15 hover:text-primary text-sm font-medium px-4 py-3.5 leading-none rounded-lg text-nowrap transition duration-300 ease-in-out"
            >
              {user?.matricule || "Mon compte"}
            </button>
          )}
          {isVisible && (
            <div
              onClick={scrollToTop}
              aria-label="scroll to top"
              className="back-to-top flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-primary text-white shadow-md transition duration-300 ease-in-out hover:bg-dark"
            >
              <span className="mt-[6px] h-3 w-3 rotate-45 border-l border-t border-white"></span>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isDrawerOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 z-[998]" />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-sm ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } z-[999]`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-black">Menu</h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="hover:cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition"
            aria-label="Close drawer"
          >
            <Icon
              icon="material-symbols:close-rounded"
              width={24}
              height={24}
              className="text-black hover:text-primary"
            />
          </button>
        </div>

        <nav className="flex flex-col p-6">
          <div className="space-y-4">
            <div className="pb-4 border-b">
              <p className="text-sm text-gray-500 mb-2">Utilisateur connecté</p>
              <p className="font-medium text-black">
                {user?.nomComplet || "User"}
              </p>
              <p className="text-sm text-gray-600">{user?.email || ""}</p>
            </div>

            {filteredNavMenu.map((menu, index) => (
              <div key={index} className="mt-6">
                <p className="text-sm text-gray-500 mb-2">{menu.category}</p>
                <div className="flex flex-col gap-2">
                  {menu.items.map((item, idx) =>
                    item.href ? (
                      <a
                        key={idx}
                        href={item.href}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        {item.icon}
                        <span className="text-black font-medium">
                          {item.label}
                        </span>
                      </a>
                    ) : (
                      <button
                        key={idx}
                        onClick={item.action}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition w-full text-left"
                      >
                        {item.icon}
                        <span className="text-black font-medium">
                          {item.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>
            ))}

            {[
              {
                label: "Profile",
                href: "/profile",
                icon: (
                  <Icon
                    icon="material-symbols:person-outline"
                    width={24}
                    height={24}
                    className="text-primary"
                  />
                ),
              },
              {
                label: "Déconnexion",
                action: () => {
                  logout();
                  setIsDrawerOpen(false);
                },
                icon: (
                  <Icon
                    icon="material-symbols:logout"
                    width={24}
                    height={24}
                    className="text-red-500"
                  />
                ),
              },
            ].map((item, idx) =>
              item.href ? (
                <a
                  key={idx}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  {item.icon}
                  <span className="text-black font-medium">{item.label}</span>
                </a>
              ) : (
                <button
                  key={idx}
                  onClick={item.action}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition w-full text-left"
                >
                  {item.icon}
                  <span className="text-black font-medium">{item.label}</span>
                </button>
              ),
            )}

            {!isAuthenticated() && (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  // Ici on pourrait appeler login()
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition w-full text-left mt-4"
              >
                <Icon
                  icon="material-symbols:login"
                  width={24}
                  height={24}
                  className="text-primary"
                />
                <span className="text-primary font-medium">Connexion</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
