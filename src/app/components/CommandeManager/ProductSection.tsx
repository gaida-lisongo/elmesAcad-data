"use client";

import { Icon } from "@iconify/react";
import type { ProduitType } from "@/app/actions/produit.actions";

interface ProductSectionProps {
  type: ProduitType;
  produit: any;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ── Enrollement: liste des matières + horaires ─────────── */
function EnrollementSection({ produit }: { produit: any }) {
    console.log("produit enro detail : ", produit);
  const matieres: any[] = produit.matieres ?? [];
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          icon="material-symbols:calendar-today-outline"
          className="text-2xl text-primary"
        />
        <h2 className="text-lg font-bold text-black dark:text-white">
          Horaire de la session
        </h2>
        {produit.debut && produit.fin && (
          <span className="ml-auto rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
            {formatDate(produit.debut)} → {formatDate(produit.fin)}
          </span>
        )}
      </div>

      {matieres.length === 0 ? (
        <p className="text-sm text-bodydark">Aucune matière planifiée.</p>
      ) : (
        <div className="space-y-2">
          {matieres.map((m: any, i: number) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl bg-gray-2 px-4 py-3 dark:bg-boxdark-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {i + 1}
                </div>
                <span className="text-sm font-medium text-black dark:text-white">
                  {m.matiereId?.designation ?? `Matière ${i + 1}`}
                </span>
              </div>
              {m.date_epreuve && (
                <span className="rounded-lg bg-white px-2 py-1 text-xs text-bodydark shadow-sm dark:bg-boxdark">
                  {formatDate(m.date_epreuve)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Stage: entreprises disponibles ─────────────────────── */
function StageSection({ produit }: { produit: any }) {
  const entreprises: any[] = produit.entreprises ?? [];
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          icon="material-symbols:business-outline"
          className="text-2xl text-primary"
        />
        <h2 className="text-lg font-bold text-black dark:text-white">
          Entreprises disponibles
        </h2>
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
          {entreprises.length} partenaire{entreprises.length !== 1 ? "s" : ""}
        </span>
      </div>

      {entreprises.length === 0 ? (
        <p className="text-sm text-bodydark">
          Aucune entreprise partenaire renseignée.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {entreprises.map((e: any, i: number) => (
            <div
              key={i}
              className="rounded-xl border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-boxdark-2"
            >
              <p className="font-semibold text-black dark:text-white">
                {e.nom}
              </p>
              {e.adresse && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-bodydark">
                  <Icon
                    icon="material-symbols:location-on-outline"
                    className="text-sm"
                  />
                  {e.adresse}
                </p>
              )}
              <p className="mt-0.5 flex items-center gap-1 text-xs text-bodydark">
                <Icon
                  icon="material-symbols:phone-outline"
                  className="text-sm"
                />
                {e.contact}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sujet: critères d'évaluation ─────────────────────── */
function SujetSection({ produit }: { produit: any }) {
  const criteres: any[] = produit.criteres ?? [];
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          icon="material-symbols:checklist-outline"
          className="text-2xl text-primary"
        />
        <h2 className="text-lg font-bold text-black dark:text-white">
          Critères d'un bon sujet
        </h2>
      </div>

      {criteres.length === 0 ? (
        <p className="text-sm text-bodydark">Aucun critère défini.</p>
      ) : (
        <div className="space-y-2">
          {criteres.map((c: any, i: number) => (
            <div key={i} className="rounded-xl bg-gray-2 p-3 dark:bg-boxdark-2">
              <p className="text-sm font-semibold text-black dark:text-white">
                {c.critere}
              </p>
              {c.description && (
                <p className="mt-1 text-xs text-bodydark">{c.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Export: branching by type ──────────────────────────── */
export default function ProductSection({ type, produit }: ProductSectionProps) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6 dark:bg-boxdark">
      {type === "enrollement" && <EnrollementSection produit={produit} />}
      {type === "stage" && <StageSection produit={produit} />}
      {type === "sujet" && <SujetSection produit={produit} />}
    </div>
  );
}
