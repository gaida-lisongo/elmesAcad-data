/**
 * EXEMPLE D'INTÉGRATION - Signature Management avec Matricule
 *
 * Montrant comment utiliser resolveMatriculeToUser dans vos actions serveur
 */

"use server";

import { resolveMatriculeToUser, ResolvedUser } from "@/lib/utils/resolveUser";
import { Documment } from "@/lib/models/Recette";
import { connectDB } from "@/lib/mongoose";

// ============================================
// EXEMPLE 1 : Ajouter une signature par matricule
// ============================================

export async function addSignatureByMatricule(
  docummentId: string,
  matricule: string,
  fonction: string,
) {
  try {
    await connectDB();

    // ✅ Résoudre matricule → ObjectId + type
    const resolved = await resolveMatriculeToUser(matricule);
    console.log(
      `Signature ajoutée par ${resolved.userType}: ${resolved.data.nomComplet}`,
    );

    // Ajouter la signature avec l'ObjectId résolu
    const updated = await Documment.findByIdAndUpdate(
      docummentId,
      {
        $push: {
          signatures: {
            userId: resolved.userId, // ObjectId reconverti
            fonction: fonction,
          },
        },
      },
      { new: true },
    );

    return {
      success: true,
      data: updated,
      addedBy: {
        type: resolved.userType,
        name: resolved.data.nomComplet,
        fonction: resolved.data.fonction,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// EXEMPLE 2 : Batch import de signatures depuis CSV
// ============================================

export async function importSignaturesFromCSV(
  docummentId: string,
  csvData: string,
) {
  try {
    await connectDB();

    // CSV format: matricule,fonction
    const lines = csvData.trim().split("\n").slice(1); // Skip header
    const signatures = [];

    for (const line of lines) {
      const [matricule, fonction] = line.split(",").map((x) => x.trim());

      if (!matricule || !fonction) continue;

      try {
        // ✅ Résoudre chaque matricule
        const resolved = await resolveMatriculeToUser(matricule);
        signatures.push({
          userId: resolved.userId,
          fonction: fonction,
          resolvedName: resolved.data.nomComplet, // Pour log/audit
        });
      } catch (error: any) {
        console.warn(`❌ Matricule invalide: ${matricule} - ${error.message}`);
      }
    }

    // Remplacer toutes les signatures
    const updated = await Documment.findByIdAndUpdate(
      docummentId,
      {
        signatures: signatures.map((s) => ({
          userId: s.userId,
          fonction: s.fonction,
        })),
      },
      { new: true },
    );

    return {
      success: true,
      imported: signatures.length,
      data: updated,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// EXEMPLE 3 : Afficher signatures avec noms résolus
// ============================================

import { User, Etudiant } from "@/lib/models/User";

export async function getDocumentWithSignatureNames(docummentId: string) {
  try {
    await connectDB();

    const document = await Documment.findById(docummentId).lean();
    if (!document) throw new Error("Document not found");

    // Résoudre chaque signature pour afficher les noms
    const signaturesWithNames = await Promise.all(
      (document.signatures || []).map(async (sig: any) => {
        // Chercher le nom du signataire
        let name = "Unknown";
        let userType = "unknown";

        const userDoc = await User.findById(sig.userId).lean();
        if (userDoc) {
          name = userDoc.nomComplet;
          userType = "teacher";
          return {
            userId: sig.userId.toString(),
            fonction: sig.fonction,
            name,
            userType,
          };
        }

        const etudiantDoc = await Etudiant.findById(sig.userId).lean();
        if (etudiantDoc) {
          name = etudiantDoc.nomComplet;
          userType = "student";
          return {
            userId: sig.userId.toString(),
            fonction: sig.fonction,
            name,
            userType,
          };
        }

        return {
          userId: sig.userId.toString(),
          fonction: sig.fonction,
          name,
          userType,
        };
      }),
    );

    return {
      ...document,
      _id: document._id.toString(),
      signatures: signaturesWithNames,
    };
  } catch (error: any) {
    throw error;
  }
}

// ============================================
// EXEMPLE 4 : API endpoint qui accepte matricule
// ============================================

/*
// Dans une Route Handler (src/app/api/signatures/add/route.ts)

import { NextRequest, NextResponse } from "next/server";
import { addSignatureByMatricule } from "./actions";

export async function POST(req: NextRequest) {
  const { docummentId, matricule, fonction } = await req.json();

  const result = await addSignatureByMatricule(
    docummentId,
    matricule,
    fonction
  );

  return NextResponse.json(result);
}

// Utilisation:
  fetch("/api/signatures/add", {
    method: "POST",
    body: JSON.stringify({
      docummentId: "...",
      matricule: "PROF001",  // ✅ Peu importe le cas (converted to uppercase)
      fonction: "Directeur"
    })
  })
*/
