"use server";

import { connectDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import Recette from "@/lib/models/Recette";
import { Element } from "@/lib/models/Section";

// Fetch all enrollements for an annee and promotion
export async function fetchEnrollements(
  anneeId: string,
  promotionId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (!anneeId || !promotionId) {
      return { success: false, error: "Missing required parameters" };
    }

    await connectDB();

    const enrollements = await Recette.Enrollement.find({
      anneeId: new mongoose.Types.ObjectId(anneeId),
      promotionId: new mongoose.Types.ObjectId(promotionId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const plainEnrollements = JSON.parse(JSON.stringify(enrollements));
    return { success: true, data: plainEnrollements };
  } catch (error) {
    console.error("Error fetching enrollements:", error);
    return { success: false, error: "Failed to fetch enrollements" };
  }
}

// Fetch all elements (matières) for an annee and promotion
export async function fetchElementsForEnrollement(
  anneeId: string,
  promotionId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (!anneeId || !promotionId) {
      return { success: false, error: "Missing required parameters" };
    }

    await connectDB();

    // Fetch all elements for the given annee
    const elements = await Element.find({
      anneeId: new mongoose.Types.ObjectId(anneeId),
    })
      .select("_id code designation credit uniteId")
      .lean();

    const plainElements = JSON.parse(JSON.stringify(elements));
    return { success: true, data: plainElements };
  } catch (error) {
    console.error("Error fetching elements:", error);
    return { success: false, error: "Failed to fetch elements" };
  }
}

// Create a new enrollement
export async function createEnrollement(data: {
  designation: string;
  anneeId: string;
  promotionId: string;
  description: string[];
  prix: number;
  debut: Date;
  fin: Date;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const newEnrollement = new Recette.Enrollement({
      designation: data.designation,
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      description: data.description,
      prix: data.prix,
      debut: data.debut,
      fin: data.fin,
      matieres: [],
      isActive: true,
    });

    await newEnrollement.save();

    const plainEnrollement = JSON.parse(JSON.stringify(newEnrollement));
    return { success: true, data: plainEnrollement };
  } catch (error) {
    console.error("Error creating enrollement:", error);
    return { success: false, error: "Failed to create enrollement" };
  }
}

// Update an enrollement
export async function updateEnrollement(
  enrollementId: string,
  data: {
    designation: string;
    description: string[];
    prix: number;
    debut: Date;
    fin: Date;
    isActive: boolean;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!enrollementId || enrollementId.length !== 24) {
      return { success: false, error: "Invalid enrollement ID" };
    }

    await connectDB();

    const updatedEnrollement = await Recette.Enrollement.findByIdAndUpdate(
      enrollementId,
      {
        designation: data.designation,
        description: data.description,
        prix: data.prix,
        debut: data.debut,
        fin: data.fin,
        isActive: data.isActive,
      },
      { new: true },
    ).lean();

    if (!updatedEnrollement) {
      return { success: false, error: "Enrollement not found" };
    }

    const plainEnrollement = JSON.parse(JSON.stringify(updatedEnrollement));
    return { success: true, data: plainEnrollement };
  } catch (error) {
    console.error("Error updating enrollement:", error);
    return { success: false, error: "Failed to update enrollement" };
  }
}

// Delete an enrollement
export async function deleteEnrollement(
  enrollementId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!enrollementId || enrollementId.length !== 24) {
      return { success: false, error: "Invalid enrollement ID" };
    }

    await connectDB();

    const deletedEnrollement =
      await Recette.Enrollement.findByIdAndDelete(enrollementId);

    if (!deletedEnrollement) {
      return { success: false, error: "Enrollement not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting enrollement:", error);
    return { success: false, error: "Failed to delete enrollement" };
  }
}

// Add matiere to enrollement
export async function addMatiereToEnrollement(
  enrollementId: string,
  matiereId: string,
  dateEpreuve: Date,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!enrollementId || !matiereId) {
      return { success: false, error: "Missing required parameters" };
    }

    await connectDB();

    const enrollement = await Recette.Enrollement.findById(enrollementId);

    if (!enrollement) {
      return { success: false, error: "Enrollement not found" };
    }

    // Check if matiere already exists
    const exists = enrollement.matieres.some(
      (m: any) => String(m.matiereId) === matiereId,
    );

    if (exists) {
      return { success: false, error: "Cette matière est déjà ajoutée" };
    }

    enrollement.matieres.push({
      matiereId: new mongoose.Types.ObjectId(matiereId),
      date_epreuve: dateEpreuve,
    });

    await enrollement.save();

    const plainEnrollement = JSON.parse(JSON.stringify(enrollement));
    return { success: true, data: plainEnrollement };
  } catch (error) {
    console.error("Error adding matiere:", error);
    return { success: false, error: "Failed to add matiere" };
  }
}

// Remove matiere from enrollement
export async function removeMatiereFromEnrollement(
  enrollementId: string,
  matiereId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!enrollementId || !matiereId) {
      return { success: false, error: "Missing required parameters" };
    }

    await connectDB();

    const enrollement = await Recette.Enrollement.findById(enrollementId);

    if (!enrollement) {
      return { success: false, error: "Enrollement not found" };
    }

    enrollement.matieres = enrollement.matieres.filter(
      (m: any) => String(m.matiereId) !== matiereId,
    );

    await enrollement.save();

    const plainEnrollement = JSON.parse(JSON.stringify(enrollement));
    return { success: true, data: plainEnrollement };
  } catch (error) {
    console.error("Error removing matiere:", error);
    return { success: false, error: "Failed to remove matiere" };
  }
}

// Update matiere date in enrollement
export async function updateMatiereDate(
  enrollementId: string,
  matiereId: string,
  dateEpreuve: Date,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!enrollementId || !matiereId) {
      return { success: false, error: "Missing required parameters" };
    }

    await connectDB();

    const enrollement = await Recette.Enrollement.findById(enrollementId);

    if (!enrollement) {
      return { success: false, error: "Enrollement not found" };
    }

    const matiere = enrollement.matieres.find(
      (m: any) => String(m.matiereId) === matiereId,
    );

    if (matiere) {
      matiere.date_epreuve = dateEpreuve;
      await enrollement.save();
    }

    const plainEnrollement = JSON.parse(JSON.stringify(enrollement));
    return { success: true, data: plainEnrollement };
  } catch (error) {
    console.error("Error updating matiere date:", error);
    return { success: false, error: "Failed to update matiere date" };
  }
}
