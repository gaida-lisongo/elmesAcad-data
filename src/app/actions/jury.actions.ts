"use server";

import { connectDB } from "@/lib/mongoose";
import { Note, Resultat, SubscribeResultat } from "@/lib/models/Cours";
import { Section, Element } from "@/lib/models/Section";
import { Subscription, Etudiant } from "@/lib/models/User";
import mongoose from "mongoose";
import type {
  NotesEtudiant,
  SemestreNote,
  UniteNote,
  ElementNote,
  ResultatEtudiant,
} from "@/utils/NoteManager";
import DocumentPV from "@/utils/documents/jury/DocumentPV";
import DocumentGrille from "@/utils/documents/jury/DocumentGrille";
import DocumentPalmares from "@/utils/documents/jury/DocumentPalmares";

export async function fetchAllNotesForPromotion(
  promotionId: string,
  anneeId: string,
): Promise<{ success: boolean; data?: NotesEtudiant[]; error?: string }> {
  try {
    await connectDB();

    if (!promotionId || !anneeId) {
      return { success: false, error: "promotionId et anneeId requis" };
    }

    const subscriptions = await Subscription.find({
      promotion: new mongoose.Types.ObjectId(promotionId),
      annee: new mongoose.Types.ObjectId(anneeId),
      isValid: true,
    })
      .populate("etudiant", "-passwordHash")
      .lean();

    if (!subscriptions || subscriptions.length === 0) {
      return { success: true, data: [] };
    }

    const section = await Section.findOne({
      "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
    }).lean();

    if (!section) {
      return { success: false, error: "Programme non trouvé" };
    }

    let programme: any = null;
    for (const filiere of (section.filieres || []) as any[]) {
      for (const prog of (filiere.programmes || []) as any[]) {
        if (String(prog._id) === promotionId) {
          programme = prog;
          break;
        }
      }
      if (programme) break;
    }

    if (!programme) {
      return { success: false, error: "Programme non trouvé" };
    }

    const studentIds = subscriptions.map((s: any) => s.etudiant._id);
    const allNotes = await Note.find({
      promotionId: new mongoose.Types.ObjectId(promotionId),
      anneeId: new mongoose.Types.ObjectId(anneeId),
      studentId: { $in: studentIds },
    }).lean();

    const notesMap = new Map<string, Map<string, any>>();
    for (const note of allNotes) {
      const studentKey = String(note.studentId);
      const elementKey = String(note.elementId);
      if (!notesMap.has(studentKey)) {
        notesMap.set(studentKey, new Map());
      }
      notesMap.get(studentKey)!.set(elementKey, note);
    }

    const allUniteIds: string[] = [];
    for (const semestre of (programme.semestres || []) as any[]) {
      for (const unite of (semestre.unites || []) as any[]) {
        allUniteIds.push(String(unite._id));
      }
    }

    const elementsFromDB = await Element.find({
      uniteId: {
        $in: allUniteIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      anneeId: new mongoose.Types.ObjectId(anneeId),
    }).lean();

    const elementsByUnite = new Map<string, any[]>();
    for (const elem of elementsFromDB) {
      const uniteKey = String(elem.uniteId);
      if (!elementsByUnite.has(uniteKey)) {
        elementsByUnite.set(uniteKey, []);
      }
      elementsByUnite.get(uniteKey)!.push(elem);
    }

    const notesEtudiants: NotesEtudiant[] = [];

    for (const sub of subscriptions) {
      const student = (sub as any).etudiant;
      const studentId = String(student._id);
      const studentNotes = notesMap.get(studentId) || new Map();

      const semestres: SemestreNote[] = [];

      for (const semestre of (programme.semestres || []) as any[]) {
        const unites: UniteNote[] = [];

        for (const unite of (semestre.unites || []) as any[]) {
          const elements: ElementNote[] = [];
          const uniteIdStr = String(unite._id);
          const uniteElements = elementsByUnite.get(uniteIdStr) || [];

          for (const element of uniteElements) {
            const elementId = String(element._id);
            const note = studentNotes.get(elementId);

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

      notesEtudiants.push({
        studentId,
        studentName: student.nomComplet || "",
        matricule: student.matricule || "",
        semestres,
      });
    }

    return { success: true, data: JSON.parse(JSON.stringify(notesEtudiants)) };
  } catch (error) {
    console.error("Error fetching all notes for promotion:", error);
    return { success: false, error: "Échec de récupération des notes" };
  }
}

export async function fetchPromotionWithSemestres(
  promotionId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const section = await Section.findOne({
      "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
    }).lean();

    if (!section) {
      return { success: false, error: "Programme non trouvé" };
    }

    let programme: any = null;
    let filiereInfo: any = null;
    let sectionInfo: any = null;

    for (const filiere of (section.filieres || []) as any[]) {
      for (const prog of (filiere.programmes || []) as any[]) {
        if (String(prog._id) === promotionId) {
          programme = prog;
          filiereInfo = {
            sigle: filiere.sigle,
            designation: filiere.designation,
          };
          sectionInfo = {
            mention: section.mention,
            designation: section.designation,
          };
          break;
        }
      }
      if (programme) break;
    }

    if (!programme) {
      return { success: false, error: "Programme non trouvé" };
    }

    return {
      success: true,
      data: JSON.parse(
        JSON.stringify({
          ...programme,
          filiere: filiereInfo,
          section: sectionInfo,
        }),
      ),
    };
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return { success: false, error: "Échec de récupération du programme" };
  }
}

export async function fetchResultatsByAnnee(
  anneeId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();

    const resultats = await Resultat.find({
      anneeId: new mongoose.Types.ObjectId(anneeId),
    }).lean();

    const sections = await Section.find().lean();

    const enrichedResultats = resultats.map((resultat: any) => {
      let promotionInfo = null;

      for (const section of sections) {
        for (const filiere of (section.filieres || []) as any[]) {
          for (const programme of (filiere.programmes || []) as any[]) {
            if (String(programme._id) === String(resultat.promotionId)) {
              promotionInfo = {
                _id: programme._id,
                niveau: programme.niveau,
                designation: programme.designation,
                filiere: {
                  sigle: filiere.sigle,
                  designation: filiere.designation,
                },
                section: { mention: section.mention },
              };
              break;
            }
          }
          if (promotionInfo) break;
        }
        if (promotionInfo) break;
      }

      return {
        ...resultat,
        promotion: promotionInfo,
      };
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(enrichedResultats)),
    };
  } catch (error) {
    console.error("Error fetching resultats:", error);
    return { success: false, error: "Échec de récupération des résultats" };
  }
}

export async function createResultat(data: {
  promotionId: string;
  anneeId: string;
  amount: number;
  currency: string;
  category: "semestre" | "annee";
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const existing = await Resultat.findOne({
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      category: data.category,
    });

    if (existing) {
      return {
        success: false,
        error: "Un résultat existe déjà pour cette promotion et catégorie",
      };
    }

    const resultat = await Resultat.create({
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      amount: data.amount,
      currency: data.currency,
      category: data.category,
      status: "unpublished",
    });

    return { success: true, data: JSON.parse(JSON.stringify(resultat)) };
  } catch (error) {
    console.error("Error creating resultat:", error);
    return { success: false, error: "Échec de création du résultat" };
  }
}

export async function updateResultat(
  id: string,
  data: {
    status?: "published" | "unpublished";
    amount?: number;
    currency?: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const resultat = await Resultat.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).lean();

    if (!resultat) {
      return { success: false, error: "Résultat non trouvé" };
    }

    return { success: true, data: JSON.parse(JSON.stringify(resultat)) };
  } catch (error) {
    console.error("Error updating resultat:", error);
    return { success: false, error: "Échec de mise à jour du résultat" };
  }
}

export async function deleteResultat(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    await SubscribeResultat.deleteMany({
      resultatId: new mongoose.Types.ObjectId(id),
    });
    await Resultat.findByIdAndDelete(id);

    return { success: true };
  } catch (error) {
    console.error("Error deleting resultat:", error);
    return { success: false, error: "Échec de suppression du résultat" };
  }
}

export async function fetchSubscribeResultatsByResultat(
  resultatId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();

    const subscriptions = await SubscribeResultat.find({
      resultatId: new mongoose.Types.ObjectId(resultatId),
    })
      .populate("studentId", "-passwordHash")
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(subscriptions)) };
  } catch (error) {
    console.error("Error fetching subscribe resultats:", error);
    return { success: false, error: "Échec de récupération des souscriptions" };
  }
}

export async function updateNoteByJury(data: {
  elementId: string;
  studentId: string;
  promotionId: string;
  anneeId: string;
  cc?: number;
  examen?: number;
  rattrapage?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const updateData: any = {};
    if (data.cc !== undefined) updateData["value.cc"] = data.cc;
    if (data.examen !== undefined) updateData["value.examen"] = data.examen;
    if (data.rattrapage !== undefined)
      updateData["value.rattrapage"] = data.rattrapage;

    const note = await Note.findOneAndUpdate(
      {
        elementId: new mongoose.Types.ObjectId(data.elementId),
        studentId: new mongoose.Types.ObjectId(data.studentId),
        promotionId: new mongoose.Types.ObjectId(data.promotionId),
        anneeId: new mongoose.Types.ObjectId(data.anneeId),
      },
      { $set: updateData },
      { new: true, upsert: true },
    ).lean();

    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (error) {
    console.error("Error updating note by jury:", error);
    return { success: false, error: "Échec de mise à jour de la note" };
  }
}

export async function fetchAllPromotionsForJury(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await connectDB();
    const sections = await Section.find().lean();

    const allPromotions: any[] = [];

    for (const section of sections) {
      for (const filiere of (section.filieres || []) as any[]) {
        for (const programme of (filiere.programmes || []) as any[]) {
          allPromotions.push({
            _id: String(programme._id),
            niveau: programme.niveau,
            designation: programme.designation,
            filiere: {
              _id: String(filiere._id),
              sigle: filiere.sigle,
              designation: filiere.designation,
            },
            section: {
              _id: String(section._id),
              mention: section.mention,
              designation: section.designation,
            },
          });
        }
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(allPromotions)) };
  } catch (error) {
    console.error("Error fetching promotions for jury:", error);
    return { success: false, error: "Échec de récupération des promotions" };
  }
}

export async function exportJuryDocument(
  type: "PV" | "GRILLE" | "PALMARES",
  resultats: ResultatEtudiant[],
  identity: any,
) {
  let doc;
  let filename = "";

  switch (type) {
    case "PV":
      doc = new DocumentPV();
      filename = "PV_Deliberation";
      break;
    case "GRILLE":
      doc = new DocumentGrille();
      filename = "Grilles_Notes";
      break;
    case "PALMARES":
      doc = new DocumentPalmares();
      filename = "Palmares_Officiel";
      break;
  }

  await doc.generate(resultats, identity);
  const buffer = await doc.generateBuffer();

  // On retourne le base64 pour que le client puisse le transformer en fichier
  return {
    base64: buffer.toString("base64"),
    filename: `${filename}_${new Date().getTime()}`,
  };
}
