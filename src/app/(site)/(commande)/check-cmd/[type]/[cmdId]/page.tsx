import { notFound } from "next/navigation";
import type { ProduitType } from "@/app/actions/produit.actions";
import { verifyCommandeForCheck } from "@/app/actions/produit.actions";
import { fetchPromotionById } from "@/app/actions/promotion.actions";
import {
  generateDocumentReleve,
  generateDocumentValidation,
} from "@/app/actions/documment.actions";
import CheckCmdClient from "./client";

const ALLOWED_TYPES: ProduitType[] = [
  "enrollement",
  "stage",
  "sujet",
  "document",
];

export default async function CheckCommandePage({
  params,
}: {
  params: Promise<{ type: string; cmdId: string }>;
}) {
  const { type, cmdId } = await params;

  if (!ALLOWED_TYPES.includes(type as ProduitType)) {
    notFound();
  }

  const verification = await verifyCommandeForCheck(type as ProduitType, cmdId);

  if (!verification.success || !verification.data) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-700">
            Vérification impossible
          </h1>
          <p className="mt-2 text-sm text-red-600">
            {verification.error || "La commande est introuvable ou invalide."}
          </p>
        </div>
      </div>
    );
  }

  let deliverable:
    | {
        kind: "releve" | "validation";
        payload: any;
        fileName: string;
      }
    | undefined;
  let deliveryError = "";

  const canAttemptDelivery =
    type === "document" &&
    verification.data.status !== "pending" &&
    verification.data.status !== "failed";

  if (canAttemptDelivery) {
    const document = verification.data.produit;
    const promotionId = String(document?.promotionId || "");

    if (promotionId.length === 24) {
      const promotionRes = await fetchPromotionById(promotionId);
      const programme = promotionRes.success
        ? promotionRes.data?.programme
        : null;

      if (programme) {
        const isValidation = /validation/i.test(
          `${document?.category || ""} ${document?.designation || ""}`,
        );

        const generated = isValidation
          ? await generateDocumentValidation(cmdId, programme)
          : await generateDocumentReleve(cmdId, programme);

        if (generated.success && generated.data) {
          deliverable = {
            kind: isValidation ? "validation" : "releve",
            payload: generated.data,
            fileName: generated.fileName || `document_${cmdId}.pdf`,
          };
        } else {
          deliveryError =
            generated.error ||
            "Le document est payé mais la génération du fichier a échoué.";
        }
      } else {
        deliveryError =
          "Impossible de résoudre la promotion liée à ce document.";
      }
    } else {
      deliveryError = "Promotion du document invalide.";
    }
  }

  return (
    <CheckCmdClient
      type={type as ProduitType}
      verification={verification.data}
      deliverable={deliverable}
      deliveryError={deliveryError}
    />
  );
}
