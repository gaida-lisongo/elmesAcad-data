"use server";

import { Structure } from "@/lib/models/Annee";
import { connectDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

export async function fetchStructureByAnnee(anneeId: string) {
  try {
    await connectDB();
    const structure = await Structure.findOne({ anneeId })
      .populate("services")
      .lean();

    return {
      success: true,
      data: structure ? JSON.parse(JSON.stringify(structure)) : null,
    };
  } catch (error: any) {
    console.error("Error fetching structure:", error);
    return { success: false, error: error.message };
  }
}

export async function createStructure(data: {
  anneeId: string;
  description: string;
  services: string[];
}) {
  try {
    await connectDB();
    const structure = await Structure.create(data);

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(structure)),
    };
  } catch (error: any) {
    console.error("Error creating structure:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStructure(
  id: string,
  data: {
    description?: string;
    services?: string[];
  },
) {
  try {
    await connectDB();
    const structure = await Structure.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).populate("services");

    if (!structure) {
      return { success: false, error: "Structure not found" };
    }

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(structure)),
    };
  } catch (error: any) {
    console.error("Error updating structure:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStructure(id: string) {
  try {
    await connectDB();
    await Structure.findByIdAndDelete(id);

    revalidatePath("/about");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting structure:", error);
    return { success: false, error: error.message };
  }
}
