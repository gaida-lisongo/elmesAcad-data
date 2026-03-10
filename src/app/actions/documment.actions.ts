"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import { User, Etudiant } from "@/lib/models/User";
import { Note } from "@/lib/models/Cours";
import { Element, Programme } from "@/lib/models/Section";
import mongoose from "mongoose";
import {
  NoteManager,
  NotesEtudiant,
  ElementNote,
  UniteNote,
  SemestreNote,
} from "@/utils/NoteManager";
import type { RelevePDFPayload } from "@/utils/pdfs/RelevePDF";
import type { BulletinPDFPayload } from "@/utils/pdfs/BulletinPDF";

const { Documment, DocumentCommande } = RecetteModels;

// Helper function to serialize MongoDB documents for client components
function serializeData(data: any): any {
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item));
  }

  if (data === null || data === undefined) {
    return data;
  }

  if (data instanceof mongoose.Types.ObjectId) {
    return data.toString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      serialized[key] = serializeData(data[key]);
    }
    return serialized;
  }

  return data;
}

// Helper function to enrich signatures with user details
async function enrichSignatures(signatures: any[]) {
  if (!signatures || signatures.length === 0) {
    return [];
  }

  const enriched = await Promise.all(
    signatures.map(async (sig) => {
      const userId = sig.userId;

      // Search in User collection (teachers)
      let user = await User.findById(userId)
        .lean()
        .catch(() => null);
      if (user) {
        return {
          userId: userId.toString(),
          fonction: sig.fonction,
          nomComplet: user.nomComplet,
          email: user.email,
          matricule: user.matricule,
          userType: "teacher",
        };
      }

      // Search in Etudiant collection
      let etudiant = await Etudiant.findById(userId)
        .lean()
        .catch(() => null);
      if (etudiant) {
        return {
          userId: userId.toString(),
          fonction: sig.fonction,
          nomComplet: etudiant.nomComplet,
          email: etudiant.email,
          matricule: etudiant.matricule,
          userType: "student",
        };
      }

      // Fallback if user not found
      return {
        userId: userId.toString(),
        fonction: sig.fonction,
        nomComplet: "Unknown",
        email: "N/A",
        matricule: "N/A",
        userType: "unknown",
      };
    }),
  );

  return enriched;
}

export interface CreateDocumentInput {
  designation: string;
  category: string;
  description: string[];
  prix: number;
  anneeId: string;
  promotionId: string;
  signatures: {
    userId: string;
    fonction: string;
  }[];
  slug: string;
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  _id: string;
}

// Create Document
export async function createDocument(data: CreateDocumentInput) {
  try {
    await connectDB();

    const document = await Documment.create({
      designation: data.designation,
      category: data.category,
      description: data.description,
      prix: data.prix,
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      signatures: data.signatures.map((sig) => ({
        userId: new mongoose.Types.ObjectId(sig.userId),
        fonction: sig.fonction,
      })),
      slug: data.slug || data.designation.toLowerCase().replace(/\s+/g, "-"),
      isActive: true,
    });

    return {
      success: true,
      data: serializeData(document.toObject()),
      message: "Document créé avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la création du document",
    };
  }
}

// Get Documents by Category
export async function getDocumentsByCategory(
  category: string,
  promotionId?: string,
  anneeId?: string,
) {
  try {
    await connectDB();

    const query: any = { category };

    if (promotionId) {
      query.promotionId = new mongoose.Types.ObjectId(promotionId);
    }

    if (anneeId) {
      query.anneeId = new mongoose.Types.ObjectId(anneeId);
    }

    const documents = await Documment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Enrich signatures with user details
    const enrichedDocs = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        signatures: await enrichSignatures(doc.signatures),
      })),
    );

    return {
      success: true,
      data: serializeData(enrichedDocs),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update Document
export async function updateDocument(data: UpdateDocumentInput) {
  try {
    await connectDB();

    const { _id, ...updateData } = data;

    const document = await Documment.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!document) {
      return {
        success: false,
        error: "Document non trouvé",
      };
    }

    return {
      success: true,
      data: serializeData(document.toObject()),
      message: "Document modifié avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la modification du document",
    };
  }
}

// Delete Document
export async function deleteDocument(id: string) {
  try {
    await connectDB();

    const document = await Documment.findByIdAndDelete(id);

    if (!document) {
      return {
        success: false,
        error: "Document non trouvé",
      };
    }

    return {
      success: true,
      message: "Document supprimé avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la suppression du document",
    };
  }
}

// Get Commandes by Document
export async function getCommandesByDocument(documentId: string) {
  try {
    await connectDB();

    const commandes = await DocumentCommande.find({
      docummentId: new mongoose.Types.ObjectId(documentId),
    })
      .populate("etudiantId", "nomComplet email matricule")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: serializeData(commandes),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create/Update Commande
export async function createOrUpdateCommande(data: {
  etudiantId: string;
  docummentId: string;
  phoneNumber: string;
  orderNumber?: string;
  reference?: string;
  status?: "pending" | "paid" | "failed" | "ok";
  lieu_naissance?: string;
  date_naissance?: string;
  nationalite?: string;
  sexe?: string;
  adresse?: string;
}) {
  try {
    await connectDB();

    const orderNumber =
      data.orderNumber ||
      `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reference =
      data.reference ||
      `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const existingCommande = await DocumentCommande.findOne({
      etudiantId: new mongoose.Types.ObjectId(data.etudiantId),
      docummentId: new mongoose.Types.ObjectId(data.docummentId),
    });

    if (existingCommande) {
      console.log(
        "[createOrUpdateCommande] Mise à jour commande existante:",
        existingCommande._id,
      );

      const updateData: any = {
        phoneNumber: data.phoneNumber,
        status: data.status || existingCommande.status,
      };

      if (data.lieu_naissance !== undefined)
        updateData.lieu_naissance = data.lieu_naissance;
      if (data.date_naissance !== undefined)
        updateData.date_naissance = data.date_naissance;
      if (data.nationalite !== undefined)
        updateData.nationalite = data.nationalite;
      if (data.sexe !== undefined) updateData.sexe = data.sexe;
      if (data.adresse !== undefined) updateData.adresse = data.adresse;

      const updated = await DocumentCommande.findByIdAndUpdate(
        existingCommande._id,
        updateData,
        { new: true },
      );

      if (!updated) {
        return {
          success: false,
          error: "Commande non trouvée lors de la mise à jour",
          message: "Erreur lors de la modification",
        };
      }

      return {
        success: true,
        data: serializeData(updated.toObject()),
        message: "Commande modifiée avec succès",
      };
    }

    const createData: any = {
      etudiantId: new mongoose.Types.ObjectId(data.etudiantId),
      docummentId: new mongoose.Types.ObjectId(data.docummentId),
      phoneNumber: data.phoneNumber,
      orderNumber,
      reference,
      status: data.status || "pending",
    };

    if (data.lieu_naissance !== undefined)
      createData.lieu_naissance = data.lieu_naissance;
    if (data.date_naissance !== undefined)
      createData.date_naissance = data.date_naissance;
    if (data.nationalite !== undefined)
      createData.nationalite = data.nationalite;
    if (data.sexe !== undefined) createData.sexe = data.sexe;
    if (data.adresse !== undefined) createData.adresse = data.adresse;

    console.log("[createOrUpdateCommande] Création nouvelle commande");

    const commande = await DocumentCommande.create(createData);

    return {
      success: true,
      data: serializeData(commande.toObject()),
      message: "Commande créée avec succès",
    };
  } catch (error: any) {
    console.error("[createOrUpdateCommande] Erreur:", error.message);
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la création de la commande",
    };
  }
}

// Delete Commande
export async function deleteCommande(id: string) {
  try {
    await connectDB();

    const commande = await DocumentCommande.findByIdAndDelete(id);

    if (!commande) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    return {
      success: true,
      message: "Commande supprimée avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la suppression de la commande",
    };
  }
}

// Import Commandes from CSV
export async function importCommandesFromCSV(
  csvData: string,
  docummentId: string,
) {
  try {
    await connectDB();

    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const commandes = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length < 2) continue; // Skip empty lines

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });

      if (obj.etudiantid && obj.phonenumber) {
        const orderNumber = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const reference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        commandes.push({
          etudiantId: new mongoose.Types.ObjectId(obj.etudiantid),
          docummentId: new mongoose.Types.ObjectId(docummentId),
          phoneNumber: obj.phonenumber,
          orderNumber,
          reference,
          status: obj.status || "pending",
        });
      }
    }

    if (commandes.length === 0) {
      return {
        success: false,
        error: "Aucune commande valide trouvée dans le CSV",
      };
    }

    const result = await DocumentCommande.insertMany(commandes, {
      ordered: false,
    }).catch((error) => {
      // Continue on duplicate key errors
      return error.insertedDocs || [];
    });

    return {
      success: true,
      data: serializeData(result),
      message: `${commandes.length} commandes importées avec succès`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de l'import du CSV",
    };
  }
}

// Get Documents with Commandes count
export async function getDocumentsWithComandesCount(
  category: string,
  promotionId?: string,
  anneeId?: string,
) {
  try {
    await connectDB();

    const query: any = { category };

    if (promotionId) {
      query.promotionId = new mongoose.Types.ObjectId(promotionId);
    }

    if (anneeId) {
      query.anneeId = new mongoose.Types.ObjectId(anneeId);
    }

    const documents = await Documment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "documentcommandes",
          localField: "_id",
          foreignField: "docummentId",
          as: "commandes",
        },
      },
      {
        $addFields: {
          commandesCount: { $size: "$commandes" },
        },
      },
      {
        $project: {
          commandes: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const enrichedDocs = await Promise.all(
      documents.map(async (doc) => ({
        ...doc,
        signatures: await enrichSignatures(doc.signatures),
      })),
    );

    return {
      success: true,
      data: serializeData(enrichedDocs),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function generateDocumentReleve(
  commandeId: string,
  promotion: any,
) {
  try {
    console.log(
      "[generateDocumentReleve] Démarrage génération relevé:",
      commandeId,
    );

    await connectDB();

    const commande = await DocumentCommande.findById(commandeId)
      .populate("etudiantId")
      .populate({
        path: "docummentId",
        populate: [
          {
            path: "signatures.userId",
          },
          {
            path: "anneeId",
          },
        ],
      })
      .lean();

    if (!commande) {
      console.error(
        "[generateDocumentReleve] Commande non trouvée:",
        commandeId,
      );
      throw new Error("Commande non trouvée");
    }

    console.log("[generateDocumentReleve] Commande trouvée");

    const programme = promotion;

    if (!programme) {
      console.error(
        "[generateDocumentReleve] Programme non trouvé:",
        promotion,
      );
      throw new Error("Programme non trouvé");
    }

    const etudiant = (commande as any).etudiantId;
    const document = (commande as any).docummentId;
    const annee = document?.anneeId;

    if (!etudiant || !document || !annee) {
      throw new Error("Étudiant, document ou année non trouvé");
    }

    // Assertions pour TypeScript après validation
    const programmeVerifie = programme as any;
    const anneeVerifiee = annee as any;

    console.log("[generateDocumentReleve] Étudiant :", etudiant.nomComplet);
    console.log("[generateDocumentReleve] Document :", document.designation);
    console.log("[generateDocumentReleve] Programme : ", programmeVerifie);
    console.log(
      "[generateDocumentReleve] Année : ",
      anneeVerifiee.debut && anneeVerifiee.fin
        ? `${new Date(anneeVerifiee.debut).getFullYear()}-${new Date(anneeVerifiee.fin).getFullYear()}`
        : anneeVerifiee._id,
    );

    const notes = await Note.find({
      studentId: new mongoose.Types.ObjectId(etudiant._id),
      promotionId: new mongoose.Types.ObjectId(programmeVerifie._id),
      anneeId: new mongoose.Types.ObjectId(anneeVerifiee._id),
    }).lean();

    console.log("[generateDocumentReleve] Notes trouvées:", notes.length);

    const notesMap = new Map<string, any>();
    for (const note of notes) {
      const elementKey = String(note.elementId);
      notesMap.set(elementKey, note);
    }

    const allUniteIds: string[] = [];
    for (const semestre of (programmeVerifie.semestres || []) as any[]) {
      for (const unite of (semestre.unites || []) as any[]) {
        allUniteIds.push(String(unite._id));
      }
    }

    const elementsFromDB = await Element.find({
      uniteId: {
        $in: allUniteIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      anneeId: new mongoose.Types.ObjectId(anneeVerifiee._id),
    }).lean();

    console.log(
      "[generateDocumentReleve] Éléments récupérés:",
      elementsFromDB.length,
    );

    const elementsByUnite = new Map<string, any[]>();
    for (const elem of elementsFromDB) {
      const uniteKey = String(elem.uniteId);
      if (!elementsByUnite.has(uniteKey)) {
        elementsByUnite.set(uniteKey, []);
      }
      elementsByUnite.get(uniteKey)!.push(elem);
    }

    const semestres: SemestreNote[] = [];

    for (const semestre of (programmeVerifie.semestres || []) as any[]) {
      const unites: UniteNote[] = [];

      for (const unite of (semestre.unites || []) as any[]) {
        const elements: ElementNote[] = [];
        const uniteIdStr = String(unite._id);
        const uniteElements = elementsByUnite.get(uniteIdStr) || [];

        for (const element of uniteElements) {
          const elementId = String(element._id);
          const note = notesMap.get(elementId);

          elements.push({
            _id: elementId,
            designation: String(element.designation || ""),
            credit: Number(element.credit) || 1,
            cc: note?.value?.cc || 0,
            examen: note?.value?.examen || 0,
            rattrapage: note?.value?.rattrapage || 0,
          });
        }

        unites.push({
          _id: uniteIdStr,
          code: String(unite.code || ""),
          designation: String(unite.designation || ""),
          credit: Number(unite.credit) || 0,
          elements,
        });
      }

      semestres.push({
        _id: String(semestre._id || semestre.designation),
        designation: String(semestre.designation || ""),
        unites,
      });
    }

    const notesEtudiant: NotesEtudiant = {
      studentId: etudiant._id.toString(),
      studentName: etudiant.nomComplet,
      matricule: etudiant.matricule || "N/A",
      semestres,
    };

    console.log("[generateDocumentReleve] Structure NotesEtudiant prête");

    const resultat = NoteManager.calculerResultatEtudiant(notesEtudiant);
    console.log(
      "[generateDocumentReleve] Résultat calculé:",
      resultat.promotion.pourcentage,
    );

    const anneeAcademique =
      anneeVerifiee.debut && anneeVerifiee.fin
        ? `${new Date(anneeVerifiee.debut).getFullYear()}-${new Date(anneeVerifiee.fin).getFullYear()}`
        : new Date().getFullYear().toString();

    const relevePayload: RelevePDFPayload = {
      nomComplet: String(etudiant.nomComplet || "N/A"),
      matricule: String(etudiant.matricule || "N/A"),
      sexe: String((commande as any).sexe || ""),
      dateNaissance: String((commande as any).date_naissance || ""),
      lieuNaissance: String((commande as any).lieu_naissance || ""),
      nationalite: String((commande as any).nationalite || ""),
      section: String(process.env.NEXT_PUBLIC_SECTION || "BTP"),
      filiere: String(programmeVerifie.designation || "N/A"),
      promotion: String(
        programmeVerifie.designation || programmeVerifie.niveau || "N/A",
      ),
      anneeAcademique,
      notes: resultat.semestres.flatMap((semestre) =>
        semestre.unites.map((unite) => ({
          unite: String(unite.designation || ""),
          code: String(unite.code || ""),
          credit: Number(unite.credit) || 0,
          elements: unite.elements.map((element) => ({
            designation: String(element.designation || ""),
            credit: Number(element.credit) || 0,
            cc: Number(element.cc) || 0,
            examen: Number(element.examen) || 0,
            rattrapage: Number(element.rattrapage) || 0,
          })),
        })),
      ),
      synthese: {
        totalObtenu: Number(resultat.promotion.totalObtenu) || 0,
        totalMax: Number(resultat.promotion.totalMax) || 0,
        pourcentage: Number(resultat.promotion.pourcentage) || 0,
        mention: String(resultat.promotion.mention || ""),
        ncv: Number(resultat.promotion.ncv) || 0,
        ncnv: Number(resultat.promotion.ncnv) || 0,
      },
    };

    console.log("[generateDocumentReleve] Payload PDF prêt");

    return {
      success: true,
      data: serializeData(relevePayload),
      fileName: `Releve_${etudiant.nomComplet.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`,
    };
  } catch (error: any) {
    console.error("[generateDocumentReleve] Erreur:", error.message);
    console.error("[generateDocumentReleve] Stack:", error.stack);
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la génération du relevé",
    };
  }
}

export async function generateBulletin(
  commandeId: string,
  promotion: any,
  semestreIndex: number,
) {
  try {
    console.log(
      "[generateBulletin] Démarrage génération bulletin:",
      commandeId,
      "Semestre:",
      semestreIndex,
    );

    await connectDB();

    const commande = await DocumentCommande.findById(commandeId)
      .populate("etudiantId")
      .populate({
        path: "docummentId",
        populate: [
          {
            path: "signatures.userId",
          },
          {
            path: "anneeId",
          },
        ],
      })
      .lean();

    if (!commande) {
      console.error("[generateBulletin] Commande non trouvée:", commandeId);
      throw new Error("Commande non trouvée");
    }

    const programme = promotion;

    if (!programme) {
      console.error("[generateBulletin] Programme non trouvé:", promotion);
      throw new Error("Programme non trouvé");
    }

    const etudiant = (commande as any).etudiantId;
    const document = (commande as any).docummentId;
    const annee = document?.anneeId;

    if (!etudiant || !document || !annee) {
      throw new Error("Étudiant, document ou année non trouvé");
    }

    const programmeVerifie = programme as any;
    const anneeVerifiee = annee as any;

    const notes = await Note.find({
      studentId: new mongoose.Types.ObjectId(etudiant._id),
      promotionId: new mongoose.Types.ObjectId(programmeVerifie._id),
      anneeId: new mongoose.Types.ObjectId(anneeVerifiee._id),
    }).lean();

    console.log("[generateBulletin] Notes trouvées:", notes.length);

    const notesMap = new Map<string, any>();
    for (const note of notes) {
      const elementKey = String(note.elementId);
      notesMap.set(elementKey, note);
    }

    const allUniteIds: string[] = [];
    for (const semestre of (programmeVerifie.semestres || []) as any[]) {
      for (const unite of (semestre.unites || []) as any[]) {
        allUniteIds.push(String(unite._id));
      }
    }

    const elementsFromDB = await Element.find({
      uniteId: {
        $in: allUniteIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      anneeId: new mongoose.Types.ObjectId(anneeVerifiee._id),
    }).lean();

    console.log(
      "[generateBulletin] Éléments récupérés:",
      elementsFromDB.length,
    );

    const elementsByUnite = new Map<string, any[]>();
    for (const elem of elementsFromDB) {
      const uniteKey = String(elem.uniteId);
      if (!elementsByUnite.has(uniteKey)) {
        elementsByUnite.set(uniteKey, []);
      }
      elementsByUnite.get(uniteKey)!.push(elem);
    }

    const semestres: SemestreNote[] = [];

    for (const semestre of (programmeVerifie.semestres || []) as any[]) {
      const unites: UniteNote[] = [];

      for (const unite of (semestre.unites || []) as any[]) {
        const elements: ElementNote[] = [];
        const uniteIdStr = String(unite._id);
        const uniteElements = elementsByUnite.get(uniteIdStr) || [];

        for (const element of uniteElements) {
          const elementId = String(element._id);
          const note = notesMap.get(elementId);

          elements.push({
            _id: elementId,
            designation: String(element.designation || ""),
            credit: Number(element.credit) || 1,
            cc: note?.value?.cc || 0,
            examen: note?.value?.examen || 0,
            rattrapage: note?.value?.rattrapage || 0,
          });
        }

        unites.push({
          _id: uniteIdStr,
          code: String(unite.code || ""),
          designation: String(unite.designation || ""),
          credit: Number(unite.credit) || 0,
          elements,
        });
      }

      semestres.push({
        _id: String(semestre._id || semestre.designation),
        designation: String(semestre.designation || ""),
        unites,
      });
    }

    if (semestreIndex < 0 || semestreIndex >= semestres.length) {
      throw new Error(`Semestre ${semestreIndex} non trouvé`);
    }

    const semestreData = semestres[semestreIndex];

    const notesEtudiant: NotesEtudiant = {
      studentId: etudiant._id.toString(),
      studentName: etudiant.nomComplet,
      matricule: etudiant.matricule || "N/A",
      semestres: [semestreData],
    };

    const resultat = NoteManager.calculerResultatEtudiant(notesEtudiant);
    const resultatSemestre = resultat.semestres[0];

    const anneeAcademique =
      anneeVerifiee.debut && anneeVerifiee.fin
        ? `${new Date(anneeVerifiee.debut).getFullYear()}-${new Date(anneeVerifiee.fin).getFullYear()}`
        : new Date().getFullYear().toString();

    const bulletinPayload: BulletinPDFPayload = {
      nomComplet: String(etudiant.nomComplet || "N/A"),
      matricule: String(etudiant.matricule || "N/A"),
      sexe: String((commande as any).sexe || ""),
      dateNaissance: String((commande as any).date_naissance || ""),
      lieuNaissance: String((commande as any).lieu_naissance || ""),
      nationalite: String((commande as any).nationalite || ""),
      section: String(process.env.NEXT_PUBLIC_SECTION || "BTP"),
      filiere: String(programmeVerifie.designation || "N/A"),
      promotion: String(
        programmeVerifie.designation || programmeVerifie.niveau || "N/A",
      ),
      anneeAcademique,
      semestre: {
        designation: String(semestreData.designation || ""),
        unites: resultatSemestre.unites.map((unite) => ({
          unite: String(unite.designation || ""),
          code: String(unite.code || ""),
          credit: Number(unite.credit) || 0,
          elements: unite.elements.map((element) => ({
            designation: String(element.designation || ""),
            credit: Number(element.credit) || 0,
            cc: Number(element.cc) || 0,
            examen: Number(element.examen) || 0,
            rattrapage: Number(element.rattrapage) || 0,
          })),
        })),
      },
      synthese: {
        totalObtenu: Number(resultatSemestre.totalObtenu) || 0,
        totalMax: Number(resultatSemestre.totalMax) || 0,
        pourcentage: Number(resultatSemestre.pourcentage) || 0,
        mention: String(resultatSemestre.mention || ""),
        ncv: Number(resultatSemestre.ncv) || 0,
        ncnv: Number(resultatSemestre.ncnv) || 0,
      },
    };

    console.log("[generateBulletin] Payload bulletin prêt");

    return {
      success: true,
      data: serializeData(bulletinPayload),
      fileName: `Bulletin_${semestreData.designation.replace(/\s+/g, "_")}_${etudiant.nomComplet.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`,
    };
  } catch (error: any) {
    console.error("[generateBulletin] Erreur:", error.message);
    console.error("[generateBulletin] Stack:", error.stack);
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la génération du bulletin",
    };
  }
}

export async function generateDocumentValidation(
  commandeId: string,
  promotion: any,
) {
  // La fiche de validation exploite actuellement le meme payload academique
  // que le releve; seul le template PDF client change.
  return generateDocumentReleve(commandeId, promotion);
}
