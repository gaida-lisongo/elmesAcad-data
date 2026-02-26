"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import { Section, Element } from "@/lib/models/Section";
import { Annee } from "@/lib/models/Annee";
import { Etudiant } from "@/lib/models/User";
import mongoose from "mongoose";
import crypto from "crypto";

export type ProduitType = "enrollement" | "stage" | "sujet";

const apiKey = process.env.API_KEY || "default";
const secretKey = process.env.SECRET_KEY || "default";
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
  data: {
    produitId: string;
    etudiantId: string;
    telephone: string;
    amount: number;
    reference: string;
  },
): Promise<{
  success: boolean;
  data?: { commandeId: string; orderNumber: string };
  error?: string;
}> {
  try {
    await connectDB();

    const payload = {
      amount: data.amount - data.amount * 0.024, // Apply 5% discount
      reference: data.reference,
      phone: data.telephone,
    };

    const paymentRes = await fetch(`${process.env.BASE_URL}/flexpay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!paymentRes.ok) {
      const errorData = await paymentRes.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Payment initiation failed with status ${paymentRes.status}`,
      );
    }

    const paymentData = await paymentRes.json();

    const { success, message } = paymentData;

    if (!success) {
      throw new Error(message || "Payment initiation failed");
    }

    const { orderNumber } = paymentData?.data || {
      orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    };

    console.log("Payment initiation response:", paymentData);

    const reference = `${data.reference} - ${orderNumber}`;

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
  data: {
    category: string;
    student: string;
    classe: string;
    amount: number;
    phone: string;
    reference: string;
    orderNumber: string;
    description?: string;
  },
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
    //Checking Payment status from FlexPay
    const paymentStatusReq = await fetch(
      `${process.env.BASE_URL}/flexpay?orderNumber=${data.orderNumber}`,
    );
    if (!paymentStatusReq.ok) {
      const errorData = await paymentStatusReq.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Payment status check failed with status ${paymentStatusReq.status}`,
      );
    }

    const paymentStatusRes = await paymentStatusReq.json();
    const { success, message } = paymentStatusRes;

    if (!success) {
      throw new Error(message || "Payment verification failed");
    }

    const paymentInfo = paymentStatusRes?.data;

    console.log("Payment status response:", paymentStatusRes);

    //Persist commande in control-plane
    const payload = {
      category: data.category,
      student: data.student,
      classe: data.classe,
      amount: data.amount,
      phone: data.phone,
      reference: data.reference,
      description: data.description,
      status: paymentInfo?.status == "0" ? "complete" : "pending",
    };

    const recordReq = await fetch(`${process.env.BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-api-secret": secretKey,
      },
      body: JSON.stringify(payload),
    });

    if (!recordReq.ok) {
      const errorData = await recordReq.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Transaction recording failed with status ${recordReq.status}`,
      );
    }

    const recordRes = await recordReq.json();
    const { success: recordSuccess, message: recordMessage } = recordRes;

    if (!recordSuccess) {
      throw new Error(recordMessage || "Transaction recording failed");
    }

    const recordData = recordRes?.data;

    console.log("Transaction recording response:", recordRes);

    await COMMANDE_MODEL[type].findByIdAndUpdate(commandeId, {
      $set: { ...config, status: paymentInfo?.status == "0" ? "ok" : "paid" },
    });
    return { success: true };
  } catch (err) {
    console.error("finalizeCommande error:", err);
    return { success: false, error: "Erreur lors de la finalisation" };
  }
}
