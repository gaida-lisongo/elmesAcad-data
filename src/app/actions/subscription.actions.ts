"use server";

import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/lib/models/User";
import mongoose from "mongoose";

export interface SubscriptionType {
  _id: string;
  etudiant: string;
  promotion: {
    _id: string;
    niveau: string;
    designation: string;
    filiere?: {
      sigle: string;
      designation: string;
    };
    section?: {
      mention: string;
      designation: string;
    };
  };
  annee: {
    _id: string;
    debut: Date;
    fin: Date;
    isActive: boolean;
  };
  isValid: boolean;
  documents?: {
    title: string;
    url: string;
    statut: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchSubscriptions(): Promise<{
  success: boolean;
  data?: SubscriptionType[];
  error?: string;
}> {
  try {
    await connectDB();
    const subscriptions = await Subscription.find().lean();
    const plainSubscriptions = JSON.parse(JSON.stringify(subscriptions));
    return { success: true, data: plainSubscriptions as SubscriptionType[] };
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}

export async function fetchSubscriptionsByPromotion(
  promotionId: string,
  anneeId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();

    const subscriptions = await Subscription.find({
      promotion: new mongoose.Types.ObjectId(promotionId),
      annee: new mongoose.Types.ObjectId(anneeId),
    })
      .populate("etudiant", "-passwordHash")
      .lean();

    const plainSubscriptions = JSON.parse(JSON.stringify(subscriptions));
    return { success: true, data: plainSubscriptions };
  } catch (error) {
    console.error("Error fetching subscriptions by promotion:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}

export async function fetchSubscriptionsByStudent(
  studentId: string,
): Promise<{ success: boolean; data?: SubscriptionType[]; error?: string }> {
  try {
    await connectDB();

    const subscriptions = await Subscription.find({
      etudiant: new mongoose.Types.ObjectId(studentId),
    })
      .populate("promotion")
      .populate("annee")
      .lean();

    const plainSubscriptions = JSON.parse(JSON.stringify(subscriptions));
    return { success: true, data: plainSubscriptions as SubscriptionType[] };
  } catch (error) {
    console.error("Error fetching subscriptions by student:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}

export async function createSubscription(data: {
  etudiantId: string;
  promotionId: string;
  anneeId: string;
  isValid?: boolean;
}): Promise<{ success: boolean; data?: SubscriptionType; error?: string }> {
  try {
    await connectDB();

    if (!data.etudiantId || !data.promotionId || !data.anneeId) {
      return { success: false, error: "Required fields are missing" };
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      etudiant: new mongoose.Types.ObjectId(data.etudiantId),
      promotion: new mongoose.Types.ObjectId(data.promotionId),
      annee: new mongoose.Types.ObjectId(data.anneeId),
    });

    if (existingSubscription) {
      return { success: false, error: "Subscription already exists" };
    }

    const newSubscription = await Subscription.create({
      etudiant: new mongoose.Types.ObjectId(data.etudiantId),
      promotion: new mongoose.Types.ObjectId(data.promotionId),
      annee: new mongoose.Types.ObjectId(data.anneeId),
      isValid: data.isValid !== undefined ? data.isValid : true,
    });

    const plainSubscription = JSON.parse(JSON.stringify(newSubscription));
    return { success: true, data: plainSubscription as SubscriptionType };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { success: false, error: "Failed to create subscription" };
  }
}

export async function updateSubscription(
  id: string,
  updateData: {
    isValid?: boolean;
    promotionId?: string;
    anneeId?: string;
  },
): Promise<{ success: boolean; data?: SubscriptionType; error?: string }> {
  try {
    await connectDB();

    const dataToUpdate: any = {};
    if (updateData.isValid !== undefined)
      dataToUpdate.isValid = updateData.isValid;
    if (updateData.promotionId)
      dataToUpdate.promotion = new mongoose.Types.ObjectId(
        updateData.promotionId,
      );
    if (updateData.anneeId)
      dataToUpdate.annee = new mongoose.Types.ObjectId(updateData.anneeId);

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      dataToUpdate,
      { returnDocument: "after" },
    ).lean();

    if (!updatedSubscription) {
      return { success: false, error: "Subscription not found" };
    }

    const plainSubscription = JSON.parse(JSON.stringify(updatedSubscription));
    return { success: true, data: plainSubscription as SubscriptionType };
  } catch (error) {
    console.error("Error updating subscription:", error);
    return { success: false, error: "Failed to update subscription" };
  }
}

export async function deleteSubscription(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const deletedSubscription = await Subscription.findByIdAndDelete(id);

    if (!deletedSubscription) {
      return { success: false, error: "Subscription not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return { success: false, error: "Failed to delete subscription" };
  }
}

export async function createSubscriptionsFromCSV(
  promotionId: string,
  anneeId: string,
  csvData: Array<{
    nomComplet: string;
    email: string;
    telephone?: string;
    adresse?: string;
    matricule?: string;
    grade: string;
    password: string;
  }>,
): Promise<{
  success: boolean;
  data?: { created: number; errors: string[] };
  error?: string;
}> {
  try {
    await connectDB();

    const errors: string[] = [];
    let created = 0;

    const crypto = require("crypto");
    const { Etudiant } = require("@/lib/models/User");

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // Validate required fields
        if (!row.nomComplet || !row.email || !row.grade || !row.password) {
          errors.push(`Ligne ${i + 1}: Champs requis manquants`);
          continue;
        }

        // Check if student already exists by email
        let student = await Etudiant.findOne({ email: row.email });

        if (!student) {
          // Create new student
          student = await Etudiant.create({
            nomComplet: row.nomComplet,
            email: row.email,
            telephone: row.telephone,
            adresse: row.adresse,
            matricule: row.matricule,
            grade: row.grade,
            passwordHash: crypto
              .createHash("sha256")
              .update(row.password)
              .digest("hex"),
          });
        }

        // Check if subscription already exists
        const existingSubscription = await Subscription.findOne({
          etudiant: student._id,
          promotion: new mongoose.Types.ObjectId(promotionId),
          annee: new mongoose.Types.ObjectId(anneeId),
        });

        if (existingSubscription) {
          errors.push(
            `Ligne ${i + 1}: Inscription existe déjà pour ${row.email}`,
          );
          continue;
        }

        // Create subscription
        await Subscription.create({
          etudiant: student._id,
          promotion: new mongoose.Types.ObjectId(promotionId),
          annee: new mongoose.Types.ObjectId(anneeId),
          isValid: true,
        });

        created++;
      } catch (err) {
        errors.push(`Ligne ${i + 1}: Erreur lors de l'inscription`);
      }
    }

    return {
      success: true,
      data: { created, errors },
    };
  } catch (error) {
    console.error("Error creating subscriptions from CSV:", error);
    return { success: false, error: "Failed to process CSV data" };
  }
}

export async function fetchAllSubscriptionsWithDetails(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await connectDB();

    const subscriptions = await Subscription.find()
      .populate("etudiant", "-passwordHash")
      .populate("annee")
      .lean();

    // Load sections to get promotion details
    const Section = require("@/lib/models/Section").Section;
    const sections = await Section.find().lean();

    // Map promotions
    const enrichedSubscriptions = subscriptions.map((sub: any) => {
      let promotionInfo = null;

      // Find promotion in sections
      for (const section of sections) {
        if (section.filieres) {
          for (const filiere of section.filieres) {
            if (filiere.programmes) {
              const programme = filiere.programmes.find(
                (p: any) => String(p._id) === String(sub.promotion),
              );
              if (programme) {
                promotionInfo = {
                  _id: programme._id,
                  niveau: programme.niveau,
                  designation: programme.designation,
                  filiere: {
                    sigle: filiere.sigle,
                    designation: filiere.designation,
                  },
                  section: {
                    mention: section.mention,
                    designation: section.designation,
                  },
                };
                break;
              }
            }
          }
        }
        if (promotionInfo) break;
      }

      return {
        ...sub,
        promotion: promotionInfo || sub.promotion,
      };
    });

    const plainSubscriptions = JSON.parse(
      JSON.stringify(enrichedSubscriptions),
    );
    return { success: true, data: plainSubscriptions };
  } catch (error) {
    console.error("Error fetching all subscriptions:", error);
    return { success: false, error: "Failed to fetch subscriptions" };
  }
}

export async function updateSubscriptionDocumentStatus(
  subscriptionId: string,
  documentIndex: number,
  newStatut: string,
): Promise<{ success: boolean; data?: SubscriptionType; error?: string }> {
  try {
    await connectDB();

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return { success: false, error: "Subscription not found" };
    }

    if (
      !subscription.documents ||
      subscription.documents.length <= documentIndex
    ) {
      return { success: false, error: "Document not found" };
    }

    subscription.documents[documentIndex].statut = newStatut;
    await subscription.save();

    const plainSubscription = JSON.parse(JSON.stringify(subscription));
    return { success: true, data: plainSubscription as SubscriptionType };
  } catch (error) {
    console.error("Error updating document status:", error);
    return { success: false, error: "Failed to update document status" };
  }
}

export async function updateSubscriptionValidation(
  subscriptionId: string,
  isValid: boolean,
): Promise<{ success: boolean; data?: SubscriptionType; error?: string }> {
  try {
    await connectDB();

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { isValid },
      { returnDocument: "after" },
    ).lean();

    if (!updatedSubscription) {
      return { success: false, error: "Subscription not found" };
    }

    const plainSubscription = JSON.parse(JSON.stringify(updatedSubscription));
    return { success: true, data: plainSubscription as SubscriptionType };
  } catch (error) {
    console.error("Error updating subscription validation:", error);
    return { success: false, error: "Failed to update subscription" };
  }
}

// Fonction helper pour générer un matricule unique
async function generateMatricule(): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Subscription.countDocuments();
  const number = (count + 1).toString().padStart(4, "0");
  return `ETU${year}${number}`;
}

// Inscription complète : créer étudiant + subscription
export async function createInscription(data: {
  studentData: {
    nomComplet: string;
    email: string;
    telephone?: string;
    adresse?: string;
    password: string;
    grade: string;
  };
  promotionId: string;
  anneeId: string;
  documents: {
    title: string;
    url: string;
  }[];
}): Promise<{
  success: boolean;
  data?: { student: any; subscription: any };
  error?: string;
}> {
  try {
    await connectDB();

    // Vérifier si l'email existe déjà
    const { Etudiant } = await import("@/lib/models/User");
    const existingStudent = await Etudiant.findOne({
      email: data.studentData.email,
    });

    if (existingStudent) {
      return {
        success: false,
        error: "Un étudiant avec cet email existe déjà",
      };
    }

    // Générer un matricule unique
    const matricule = await generateMatricule();

    // Créer l'étudiant avec hash du mot de passe
    const crypto = await import("crypto");
    const passwordHash = crypto
      .createHash("sha256")
      .update(data.studentData.password)
      .digest("hex");

    const newStudent = await Etudiant.create({
      ...data.studentData,
      matricule,
      passwordHash,
    });

    // Vérifier si une subscription existe déjà
    const existingSubscription = await Subscription.findOne({
      etudiant: newStudent._id,
      promotion: new mongoose.Types.ObjectId(data.promotionId),
      annee: new mongoose.Types.ObjectId(data.anneeId),
    });

    if (existingSubscription) {
      return {
        success: false,
        error: "Une inscription existe déjà pour cette promotion",
      };
    }

    // Créer la subscription avec documents
    const newSubscription = await Subscription.create({
      etudiant: newStudent._id,
      promotion: new mongoose.Types.ObjectId(data.promotionId),
      annee: new mongoose.Types.ObjectId(data.anneeId),
      isValid: false, // En attente de validation par défaut
      documents: data.documents.map((doc) => ({
        title: doc.title,
        url: doc.url,
        statut: "en_attente",
      })),
    });

    // Populate pour retourner les données complètes
    const populatedSubscription = await Subscription.findById(
      newSubscription._id,
    )
      .populate("etudiant", "-passwordHash")
      .populate("annee")
      .lean();

    const plainData = JSON.parse(
      JSON.stringify({
        student: newStudent,
        subscription: populatedSubscription,
      }),
    );

    return { success: true, data: plainData };
  } catch (error) {
    console.error("Error creating inscription:", error);
    return { success: false, error: "Erreur lors de l'inscription" };
  }
}
