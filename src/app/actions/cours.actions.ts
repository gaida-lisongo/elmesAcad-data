"use server";

import { connectDB } from "@/lib/mongoose";
import {
  Note,
  QCMActivity,
  QuestionnaireActivity,
  RessourceActivity,
  Recours,
  Seance,
  Presence,
  SubscribeCharge,
} from "@/lib/models/Cours";
import { Etudiant, Subscription } from "@/lib/models/User";
import mongoose from "mongoose";

// ==================== NOTES ====================

export async function fetchNotesByElement(
  elementId: string,
  promotionId: string,
  anneeId: string,
) {
  try {
    await connectDB();

    // Valider les IDs avant de faire la requête
    if (!promotionId || !anneeId || !elementId) {
      return { success: true, data: [] };
    }

    // Vérifier que les IDs sont des ObjectId valides (24 caractères hex)
    const isValidObjectId = (id: string) => /^[0-9a-fA-F]{24}$/.test(id);
    if (
      !isValidObjectId(promotionId) ||
      !isValidObjectId(anneeId) ||
      !isValidObjectId(elementId)
    ) {
      return { success: true, data: [] };
    }

    // Récupérer les étudiants inscrits à cette promotion pour cette année
    const subscriptions = await Subscription.find({
      promotion: new mongoose.Types.ObjectId(promotionId),
      annee: new mongoose.Types.ObjectId(anneeId),
      isValid: true,
    })
      .populate("etudiant", "-passwordHash")
      .lean();

    // Récupérer toutes les notes pour cet élément
    const notes = await Note.find({
      elementId: new mongoose.Types.ObjectId(elementId),
      promotionId: new mongoose.Types.ObjectId(promotionId),
      anneeId: new mongoose.Types.ObjectId(anneeId),
    }).lean();

    // Créer un map des notes par étudiant
    const notesMap = new Map(
      notes.map((note) => [String(note.studentId), note]),
    );

    // Combiner les données
    const result = subscriptions.map((sub: any) => {
      const studentId = String(sub.etudiant._id);
      const note = notesMap.get(studentId);

      return {
        ...sub.etudiant,
        note: note
          ? {
              cc: note.value?.cc || 0,
              examen: note.value?.examen || 0,
              rattrapage: note.value?.rattrapage || 0,
            }
          : { cc: 0, examen: 0, rattrapage: 0 },
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return { success: false, error: "Failed to fetch notes" };
  }
}

export async function updateNote(data: {
  elementId: string;
  studentId: string;
  promotionId: string;
  anneeId: string;
  cc?: number;
  examen?: number;
  rattrapage?: number;
}) {
  try {
    await connectDB();

    const note = await Note.findOneAndUpdate(
      {
        elementId: new mongoose.Types.ObjectId(data.elementId),
        studentId: new mongoose.Types.ObjectId(data.studentId),
        promotionId: new mongoose.Types.ObjectId(data.promotionId),
        anneeId: new mongoose.Types.ObjectId(data.anneeId),
      },
      {
        $set: {
          "value.cc": data.cc,
          "value.examen": data.examen,
          "value.rattrapage": data.rattrapage,
        },
      },
      { new: true, upsert: true },
    ).lean();

    return { success: true, data: JSON.parse(JSON.stringify(note)) };
  } catch (error) {
    console.error("Error updating note:", error);
    return { success: false, error: "Failed to update note" };
  }
}

export async function importNotesByCSV(data: {
  elementId: string;
  promotionId: string;
  anneeId: string;
  rows: Array<{
    matricule: string;
    cc: number;
    examen: number;
    rattrapage: number;
  }>;
}) {
  try {
    await connectDB();

    // Filtrer uniquement les lignes avec des notes (au moins une valeur non nulle)
    const rowsWithNotes = data.rows.filter(
      (row) =>
        (row.cc > 0 || row.examen > 0 || row.rattrapage > 0) && row.matricule,
    );

    if (rowsWithNotes.length === 0) {
      return {
        success: true,
        data: { success: 0, errors: ["Aucune note à importer"] },
      };
    }

    // Récupérer tous les étudiants en une seule requête
    const matricules = rowsWithNotes.map((r) => r.matricule);
    const students = await Etudiant.find({
      matricule: { $in: matricules },
    }).lean();

    // Créer un map matricule -> student
    const studentMap = new Map(students.map((s: any) => [s.matricule, s]));

    // Préparer les opérations bulk
    const bulkOps: any[] = [];
    const errors: string[] = [];

    for (const row of rowsWithNotes) {
      const student = studentMap.get(row.matricule);
      if (!student) {
        errors.push(`Étudiant non trouvé: ${row.matricule}`);
        continue;
      }

      bulkOps.push({
        updateOne: {
          filter: {
            elementId: new mongoose.Types.ObjectId(data.elementId),
            studentId: student._id,
            promotionId: new mongoose.Types.ObjectId(data.promotionId),
            anneeId: new mongoose.Types.ObjectId(data.anneeId),
          },
          update: {
            $set: {
              "value.cc": row.cc || 0,
              "value.examen": row.examen || 0,
              "value.rattrapage": row.rattrapage || 0,
            },
          },
          upsert: true,
        },
      });
    }

    // Exécuter toutes les opérations en une seule requête
    let success = 0;
    if (bulkOps.length > 0) {
      const result = await Note.bulkWrite(bulkOps);
      success = result.modifiedCount + result.upsertedCount;
    }

    return { success: true, data: { success, errors } };
  } catch (error) {
    console.error("Error importing notes:", error);
    return { success: false, error: "Failed to import notes" };
  }
}

// ==================== ACTIVITÉS QCM ====================

export async function createQCMActivity(data: {
  titulaireId: string;
  elementId: string;
  promotionId: string;
  anneeId: string;
  designation: string;
  description: string[];
  questions: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
  }>;
  currency?: string;
  amount?: number;
  maxPts?: number;
}) {
  try {
    await connectDB();

    const activity = await QCMActivity.create(data);
    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error) {
    console.error("Error creating QCM activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}

export async function fetchQCMActivities(elementId: string) {
  try {
    await connectDB();

    const activities = await QCMActivity.find({
      elementId: new mongoose.Types.ObjectId(elementId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(activities)) };
  } catch (error) {
    console.error("Error fetching QCM activities:", error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

export async function updateQCMActivity(id: string, data: any) {
  try {
    await connectDB();

    const activity = await QCMActivity.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error) {
    console.error("Error updating QCM activity:", error);
    return { success: false, error: "Failed to update activity" };
  }
}

export async function deleteQCMActivity(id: string) {
  try {
    await connectDB();

    await QCMActivity.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting QCM activity:", error);
    return { success: false, error: "Failed to delete activity" };
  }
}

// ==================== ACTIVITÉS QUESTIONNAIRE ====================

export async function createQuestionnaireActivity(data: {
  titulaireId: string;
  elementId: string;
  promotionId: string;
  anneeId: string;
  designation: string;
  description: string[];
  questions: Array<{
    enonce: string;
    url?: string;
  }>;
  currency?: string;
  amount?: number;
  maxPts?: number;
}) {
  try {
    await connectDB();

    const activity = await QuestionnaireActivity.create(data);
    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error) {
    console.error("Error creating questionnaire activity:", error);
    return { success: false, error: "Failed to create activity" };
  }
}

export async function fetchQuestionnaireActivities(elementId: string) {
  try {
    await connectDB();

    const activities = await QuestionnaireActivity.find({
      elementId: new mongoose.Types.ObjectId(elementId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(activities)) };
  } catch (error) {
    console.error("Error fetching questionnaire activities:", error);
    return { success: false, error: "Failed to fetch activities" };
  }
}

export async function updateQuestionnaireActivity(id: string, data: any) {
  try {
    await connectDB();

    const activity = await QuestionnaireActivity.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(activity)) };
  } catch (error) {
    console.error("Error updating questionnaire activity:", error);
    return { success: false, error: "Failed to update activity" };
  }
}

export async function deleteQuestionnaireActivity(id: string) {
  try {
    await connectDB();

    await QuestionnaireActivity.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting questionnaire activity:", error);
    return { success: false, error: "Failed to delete activity" };
  }
}

// ==================== RESSOURCES ====================

export async function createRessource(data: {
  titulaireId: string;
  elementId: string;
  promotionId: string;
  anneeId: string;
  designation: string;
  description: string[];
  url: string;
  reference: string;
  currency?: string;
  amount?: number;
}) {
  try {
    await connectDB();

    const ressource = await RessourceActivity.create({
      ...data,
      type: "ressource",
    });
    return { success: true, data: JSON.parse(JSON.stringify(ressource)) };
  } catch (error) {
    console.error("Error creating ressource:", error);
    return { success: false, error: "Failed to create ressource" };
  }
}

export async function fetchRessources(elementId: string) {
  try {
    await connectDB();

    const ressources = await RessourceActivity.find({
      elementId: new mongoose.Types.ObjectId(elementId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(ressources)) };
  } catch (error) {
    console.error("Error fetching ressources:", error);
    return { success: false, error: "Failed to fetch ressources" };
  }
}

export async function updateRessource(id: string, data: any) {
  try {
    await connectDB();

    const ressource = await RessourceActivity.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(ressource)) };
  } catch (error) {
    console.error("Error updating ressource:", error);
    return { success: false, error: "Failed to update ressource" };
  }
}

export async function deleteRessource(id: string) {
  try {
    await connectDB();

    await RessourceActivity.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting ressource:", error);
    return { success: false, error: "Failed to delete ressource" };
  }
}

// ==================== RECOURS ====================

export async function fetchRecoursByElement(elementId: string) {
  try {
    await connectDB();

    const recours = await Recours.find({
      elementId: new mongoose.Types.ObjectId(elementId),
    })
      .populate("studentId", "-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(recours)) };
  } catch (error) {
    console.error("Error fetching recours:", error);
    return { success: false, error: "Failed to fetch recours" };
  }
}

export async function updateRecoursStatus(
  id: string,
  status: "pending" | "approved" | "rejected",
) {
  try {
    await connectDB();

    const recours = await Recours.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    )
      .populate("studentId", "-passwordHash")
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(recours)) };
  } catch (error) {
    console.error("Error updating recours status:", error);
    return { success: false, error: "Failed to update recours" };
  }
}

// ==================== SÉANCES ====================

export async function createSeance(data: {
  elementId: string;
  promotionId: string;
  anneeId: string;
  designation: string;
  description: string[];
  coords?: {
    latitude: string;
    longitude: string;
  };
}) {
  try {
    await connectDB();

    const seance = await Seance.create(data);
    return { success: true, data: JSON.parse(JSON.stringify(seance)) };
  } catch (error) {
    console.error("Error creating seance:", error);
    return { success: false, error: "Failed to create seance" };
  }
}

export async function fetchSeances(elementId: string) {
  try {
    await connectDB();

    const seances = await Seance.find({
      elementId: new mongoose.Types.ObjectId(elementId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(seances)) };
  } catch (error) {
    console.error("Error fetching seances:", error);
    return { success: false, error: "Failed to fetch seances" };
  }
}

export async function updateSeance(id: string, data: any) {
  try {
    await connectDB();

    const seance = await Seance.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();

    return { success: true, data: JSON.parse(JSON.stringify(seance)) };
  } catch (error) {
    console.error("Error updating seance:", error);
    return { success: false, error: "Failed to update seance" };
  }
}

export async function deleteSeance(id: string) {
  try {
    await connectDB();

    await Seance.findByIdAndDelete(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting seance:", error);
    return { success: false, error: "Failed to delete seance" };
  }
}

export async function fetchPresencesBySeance(seanceId: string) {
  try {
    await connectDB();

    const presences = await Presence.find({
      seanceId: new mongoose.Types.ObjectId(seanceId),
    })
      .populate("studentId", "-passwordHash")
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(presences)) };
  } catch (error) {
    console.error("Error fetching presences:", error);
    return { success: false, error: "Failed to fetch presences" };
  }
}

// ==================== SOUSCRIPTIONS ====================

export async function fetchSubscribers(activityId: string, type: string) {
  try {
    await connectDB();

    const subscribers = await SubscribeCharge.find({
      activityId: new mongoose.Types.ObjectId(activityId),
      type,
    })
      .populate("studentId", "-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(subscribers)) };
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return { success: false, error: "Failed to fetch subscribers" };
  }
}
