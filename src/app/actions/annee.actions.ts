"use server";

import { connectDB } from "@/lib/mongoose";
import { Annee } from "@/lib/models/Annee";
import { IAnnee } from "@/lib/models/Annee";

export async function fetchAnnees(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB();
    const annees = await Annee.find().lean();
    const plainAnnees = JSON.parse(JSON.stringify(annees));
    return { success: true, data: plainAnnees };
  } catch (error) {
    console.error("Error fetching annees:", error);
    return { success: false, error: "Failed to fetch annees" };
  }
}

export async function createAnnee(data: {
  debut: Date;
  fin: Date;
  isActive: boolean;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();
    
    if (!data.debut || !data.fin) {
      return { success: false, error: "Debut and fin dates are required" };
    }

    const newAnnee = new Annee({
      debut: new Date(data.debut),
      fin: new Date(data.fin),
      isActive: data.isActive || false,
      calendrier: [],
      evenements: [],
      galeries: [],
      communiques: [],
    });

    await newAnnee.save();
    const plainAnnee = JSON.parse(JSON.stringify(newAnnee));
    return { success: true, data: plainAnnee };
  } catch (error) {
    console.error("Error creating annee:", error);
    return { success: false, error: "Failed to create annee" };
  }
}

export async function updateAnnee(
  id: string,
  data: Partial<{
    debut: Date;
    fin: Date;
    isActive: boolean;
  }>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const updateData: any = {};
    if (data.debut) updateData.debut = new Date(data.debut);
    if (data.fin) updateData.fin = new Date(data.fin);
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

    const updatedAnnee = await Annee.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    }).lean();

    if (!updatedAnnee) {
      return { success: false, error: "Annee not found" };
    }

    const plainAnnee = JSON.parse(JSON.stringify(updatedAnnee));
    return { success: true, data: plainAnnee };
  } catch (error) {
    console.error("Error updating annee:", error);
    return { success: false, error: "Failed to update annee" };
  }
}

export async function deleteAnnee(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    const deletedAnnee = await Annee.findByIdAndDelete(id);

    if (!deletedAnnee) {
      return { success: false, error: "Annee not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting annee:", error);
    return { success: false, error: "Failed to delete annee" };
  }
}
