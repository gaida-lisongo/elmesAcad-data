"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import type { ProduitType } from "@/app/actions/produit.actions";
import RelevePDF from "@/utils/pdfs/RelevePDF";
import ValidationPDF from "@/utils/pdfs/ValidationPDF";

const STATUS_STYLE: Record<
  "pending" | "paid" | "failed" | "ok",
  {
    label: string;
    icon: string;
    box: string;
    text: string;
  }
> = {
  pending: {
    label: "En attente",
    icon: "material-symbols:hourglass-empty",
    box: "border-yellow-200 bg-yellow-50",
    text: "text-yellow-700",
  },
  paid: {
    label: "Paiement en traitement",
    icon: "material-symbols:payments-outline",
    box: "border-blue-200 bg-blue-50",
    text: "text-blue-700",
  },
  failed: {
    label: "Échoué",
    icon: "material-symbols:error-outline",
    box: "border-red-200 bg-red-50",
    text: "text-red-700",
  },
  ok: {
    label: "Payée",
    icon: "material-symbols:check-circle-outline",
    box: "border-green-200 bg-green-50",
    text: "text-green-700",
  },
};

const TYPE_LABEL: Record<ProduitType, string> = {
  enrollement: "Inscription",
  stage: "Stage",
  sujet: "Sujet",
  document: "Document",
};

interface CheckCmdClientProps {
  type: ProduitType;
  verification: {
    commande: any;
    produit: any;
    isPaid: boolean;
    status: "pending" | "paid" | "failed" | "ok";
  };
  deliverable?: {
    kind: "releve" | "validation";
    payload: any;
    fileName: string;
  };
  deliveryError?: string;
}

export default function CheckCmdClient({
  type,
  verification,
  deliverable,
  deliveryError,
}: CheckCmdClientProps) {
  const [downloading, setDownloading] = useState(false);
  const statusCfg = STATUS_STYLE[verification.status];
  const student = verification.commande?.etudiantId;
  const isPending = verification.status === "pending";
  const isFailed = verification.status === "failed";
  const canDeliverDocument = type === "document" && !isPending && !isFailed;

  const handleDownload = async () => {
    if (!deliverable) return;

    setDownloading(true);
    try {
      if (deliverable.kind === "validation") {
        const pdf = new ValidationPDF(deliverable.payload);
        await pdf.render(deliverable.fileName, {
          reference: verification.commande?.reference,
        });
      } else {
        const pdf = new RelevePDF(deliverable.payload);
        await pdf.render(deliverable.fileName, {
          reference: verification.commande?.reference,
        });
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container py-20">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-2xl border border-stroke bg-white p-6 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {TYPE_LABEL[type]}
            </span>
            <span className="text-xs text-bodydark">
              Commande: {verification.commande?.orderNumber || "-"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-black">
            Vérification de commande
          </h1>

          <p className="mt-1 text-sm text-bodydark">
            Référence: {verification.commande?.reference || "-"}
          </p>

          <div
            className={`mt-5 rounded-xl border p-4 ${statusCfg.box} ${statusCfg.text}`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon icon={statusCfg.icon} className="text-xl" />
              Statut: {statusCfg.label}
            </div>
          </div>

          {student && (
            <div className="mt-4 rounded-xl bg-gray-2 p-4">
              <p className="text-xs uppercase tracking-wide text-bodydark">
                Étudiant
              </p>
              <p className="text-sm font-semibold text-black">
                {student.nomComplet || "-"}
              </p>
              <p className="text-xs text-bodydark">
                {student.matricule || "-"}
              </p>
            </div>
          )}

          {isPending && (
            <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              Votre commande est en attente de confirmation. Revenez plus tard
              pour vérifier la mise à jour du paiement.
            </div>
          )}

          {isFailed && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Le paiement a échoué. Veuillez régulariser votre facture avant
              toute délivrance de document.
            </div>
          )}

          {!isPending && !isFailed && type !== "document" && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Paiement confirmé. La commande est valide.
            </div>
          )}

          {canDeliverDocument && (
            <div className="mt-4 space-y-3">
              {deliverable && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-700">
                    Statut confirmé. Votre document est prêt.
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {downloading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Icon
                        icon="material-symbols:download"
                        className="text-lg"
                      />
                    )}
                    Télécharger{" "}
                    {deliverable.kind === "validation"
                      ? "la fiche de validation"
                      : "le relevé"}
                  </button>
                </div>
              )}

              {!deliverable && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                  {deliveryError ||
                    "Le document ne peut pas encore être délivré."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
