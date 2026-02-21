"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import { Section, Element } from "@/lib/models/Section";
import { Annee } from "@/lib/models/Annee";
import { Etudiant } from "@/lib/models/User";
import mongoose from "mongoose";
import crypto from "crypto";

export type ProduitType = "enrollement" | "stage" | "sujet";

/* ─────────────────────────────────────────────────────────── */
/*  Helper: resolve promotion name from sections               */
/* ─────────────────────────────────────────────────────────── */
async function resolvePromotion(promotionId: string): Promise<{
  promotionName: string;
  sectionName: string;
  filiereName: string;
}> {
  const sections: any[] = await Section.find().lean();
  for (const sec of sections) {
    for (const fil of sec.filieres || []) {
      for (const prog of fil.programmes || []) {
        if (String(prog._id) === promotionId) {
          return {
            promotionName: `${prog.niveau} - ${prog.designation}`,
            sectionName: sec.designation,
            filiereName: fil.designation,
          };
        }
      }
    }
  }
  return { promotionName: "—", sectionName: "—", filiereName: "—" };
}

const MODEL: Record<ProduitType, any> = {
  enrollement: RecetteModels.Enrollement,
  stage: RecetteModels.Stage,
  sujet: RecetteModels.Sujet,
};

const COMMANDE_MODEL: Record<ProduitType, any> = {
  enrollement: RecetteModels.EnrollementCommande,
  stage: RecetteModels.StageCommande,
  sujet: RecetteModels.SujetCommande,
};

/* ─────────────────────────────────────────────────────────── */
/*  Fetch a single produit with resolved metadata              */
/* ─────────────────────────────────────────────────────────── */
export async function fetchProduitById(
  type: ProduitType,
  id: string,
): Promise<{
  success: boolean;
  data?: {
    produit: any;
    annee: { _id: string; debut: string; fin: string } | null;
    promotionName: string;
    sectionName: string;
    filiereName: string;
  };
  error?: string;
}> {
  try {
    if (!id || id.length !== 24)
      return { success: false, error: "ID invalide" };
    await connectDB();
    const request =
      type == "enrollement"
        ? MODEL[type]
            .findById(id)
            .populate({ path: "matieres.matiereId", model: Element })
            .lean()
        : MODEL[type].findById(id).lean();
    const produit = await request;
    if (!produit) return { success: false, error: "Produit non trouvé" };

    const p: any = produit;

    // Fetch annee
    let annee: any = null;
    if (p.anneeId) {
      const anneeDoc = await Annee.findById(p.anneeId)
        .select("debut fin")
        .lean();
      if (anneeDoc) annee = JSON.parse(JSON.stringify(anneeDoc));
    }

    const meta = await resolvePromotion(String(p.promotionId));

    return {
      success: true,
      data: {
        produit: JSON.parse(JSON.stringify(produit)),
        annee,
        ...meta,
      },
    };
  } catch (err) {
    console.error("fetchProduitById error:", err);
    return { success: false, error: "Erreur serveur" };
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  Fetch student by matricule                                 */
/* ─────────────────────────────────────────────────────────── */
export async function fetchStudentByMatricule(matricule: string): Promise<{
  success: boolean;
  data?: { _id: string; nomComplet: string; email: string; matricule: string };
  error?: string;
}> {
  try {
    await connectDB();
    const student = await Etudiant.findOne({ matricule: matricule.trim() })
      .select("_id nomComplet email matricule")
      .lean();
    if (!student) return { success: false, error: "Étudiant introuvable" };
    return { success: true, data: JSON.parse(JSON.stringify(student)) };
  } catch (err) {
    return { success: false, error: "Erreur serveur" };
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  Step 1 – Init commande (status: pending)                   */
/* ─────────────────────────────────────────────────────────── */
export async function initCommande(
  type: ProduitType,
  data: { produitId: string; etudiantId: string; telephone: string },
): Promise<{
  success: boolean;
  data?: { commandeId: string; orderNumber: string };
  error?: string;
}> {
  try {
    await connectDB();

    const orderNumber = `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const reference = crypto.randomBytes(8).toString("hex").toUpperCase();

    const idField: Record<ProduitType, string> = {
      enrollement: "enrollementId",
      stage: "stageId",
      sujet: "sujetId",
    };

    const commande = await COMMANDE_MODEL[type].create({
      etudiantId: new mongoose.Types.ObjectId(data.etudiantId),
      phoneNumber: data.telephone,
      orderNumber,
      reference,
      status: "pending",
      [idField[type]]: new mongoose.Types.ObjectId(data.produitId),
    });

    return {
      success: true,
      data: { commandeId: String(commande._id), orderNumber },
    };
  } catch (err) {
    console.error("initCommande error:", err);
    return {
      success: false,
      error: "Erreur lors de la création de la commande",
    };
  }
}

/* ─────────────────────────────────────────────────────────── */
/*  Step 2 – Finalize commande (status: ok + config fields)    */
/* ─────────────────────────────────────────────────────────── */
export async function finalizeCommande(
  type: ProduitType,
  commandeId: string,
  config: Partial<{
    // stage
    rapport: string;
    entreprise: { nom: string; adresse?: string; contact: string };
    lettre_destinataire: string;
    lettre_quality: string;
    lettre_sexe: string;
    // sujet
    protocole: string;
    // note valide pour tous
    note: number;
  }>,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    await COMMANDE_MODEL[type].findByIdAndUpdate(commandeId, {
      $set: { ...config, status: "ok" },
    });
    return { success: true };
  } catch (err) {
    console.error("finalizeCommande error:", err);
    return { success: false, error: "Erreur lors de la finalisation" };
  }
}
