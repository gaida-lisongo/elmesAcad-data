"use server";

import { connectDB } from "@/lib/mongoose";
import Recette from "@/lib/models/Recette";
import { Etudiant } from "@/lib/models/User";
import mongoose from "mongoose";

export type ProduitType = "enrollement" | "stage" | "sujet" | "document";
export type CommandeStatus = "pending" | "ok" | "failed" | "paid";

/* ─────────────────────────────────────── */
/*  Config map                             */
/* ─────────────────────────────────────── */
function getConfig(type: ProduitType) {
  const map = {
    enrollement: {
      commandeModel: Recette.EnrollementCommande,
      produitModel: Recette.Enrollement,
      produitField: "enrollementId",
    },
    stage: {
      commandeModel: Recette.StageCommande,
      produitModel: Recette.Stage,
      produitField: "stageId",
    },
    sujet: {
      commandeModel: Recette.SujetCommande,
      produitModel: Recette.Sujet,
      produitField: "sujetId",
    },
    document: {
      commandeModel: Recette.DocumentCommande,
      produitModel: Recette.Documment,
      produitField: "docummentId",
    },
  };
  return map[type];
}

/* ─────────────────────────────────────── */
/*  Fetch commandes for one produit        */
/* ─────────────────────────────────────── */
export async function fetchCommandesByProduit(
  type: ProduitType,
  produitId: string,
  status?: CommandeStatus,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();
    void Etudiant; // ensure model is registered

    const { commandeModel, produitField } = getConfig(type);

    const query: Record<string, any> = {
      [produitField]: new mongoose.Types.ObjectId(produitId),
    };
    if (status) query.status = status;

    const commandes = await (commandeModel as any)
      .find(query)
      .populate({
        path: "etudiantId",
        model: Etudiant,
        select: "nomComplet matricule grade telephone",
      })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(commandes)) };
  } catch (err: any) {
    console.error("fetchCommandesByProduit error:", err);
    return { success: false, error: err.message || "Erreur serveur" };
  }
}

/* ─────────────────────────────────────── */
/*  Update commande status                 */
/* ─────────────────────────────────────── */
export async function updateCommandeStatus(
  type: ProduitType,
  commandeId: string,
  status: CommandeStatus,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    const { commandeModel } = getConfig(type);

    await (commandeModel as any).findByIdAndUpdate(commandeId, {
      $set: { status },
    });
    return { success: true };
  } catch (err: any) {
    console.error("updateCommandeStatus error:", err);
    return { success: false, error: err.message || "Erreur serveur" };
  }
}

/* ─────────────────────────────────────── */
/*  Global metrics for a promotion         */
/* ─────────────────────────────────────── */
export async function fetchCommandesMetrics(
  type: ProduitType,
  anneeId: string,
  promotionId: string,
): Promise<{
  success: boolean;
  data?: { total: number; caReel: number; caEnAttente: number };
  error?: string;
}> {
  try {
    await connectDB();
    const { commandeModel, produitModel, produitField } = getConfig(type);

    // 1. Get all produits for this promotion
    const produits = await (produitModel as any)
      .find({
        anneeId: new mongoose.Types.ObjectId(anneeId),
        promotionId: new mongoose.Types.ObjectId(promotionId),
      })
      .select("_id prix")
      .lean();

    if (produits.length === 0) {
      return { success: true, data: { total: 0, caReel: 0, caEnAttente: 0 } };
    }

    const produitIds = produits.map((p: any) => p._id);
    const prixMap = new Map<string, number>(
      produits.map((p: any) => [String(p._id), Number(p.prix)]),
    );

    // 2. Get all commandes for those produits
    const commandes = await (commandeModel as any)
      .find({ [produitField]: { $in: produitIds } })
      .select(`status ${produitField}`)
      .lean();

    let caReel = 0;
    let caEnAttente = 0;

    for (const cmd of commandes as any[]) {
      const prix = prixMap.get(String(cmd[produitField])) ?? 0;
      if (cmd.status === "ok") caReel += prix;
      if (cmd.status === "pending") caEnAttente += prix;
    }

    return {
      success: true,
      data: { total: commandes.length, caReel, caEnAttente },
    };
  } catch (err: any) {
    console.error("fetchCommandesMetrics error:", err);
    return { success: false, error: err.message || "Erreur serveur" };
  }
}
