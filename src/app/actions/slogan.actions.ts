"use server";

import { Slogan } from "@/lib/models/Annee";
import { connectDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

export async function fetchSloganByAnnee(anneeId: string) {
  try {
    await connectDB();
    const slogan = await Slogan.findOne({ anneeId }).lean();

    return {
      success: true,
      data: slogan ? JSON.parse(JSON.stringify(slogan)) : null,
    };
  } catch (error: any) {
    console.error("Error fetching slogan:", error);
    return { success: false, error: error.message };
  }
}

export async function createSlogan(data: {
  anneeId: string;
  photo?: string;
  designation: string;
  description: string[];
}) {
  try {
    await connectDB();
    const slogan = await Slogan.create(data);

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(slogan)),
    };
  } catch (error: any) {
    console.error("Error creating slogan:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSlogan(
  id: string,
  data: {
    photo?: string;
    designation?: string;
    description?: string[];
  },
) {
  try {
    await connectDB();
    const slogan = await Slogan.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );

    if (!slogan) {
      return { success: false, error: "Slogan not found" };
    }

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(slogan)),
    };
  } catch (error: any) {
    console.error("Error updating slogan:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSlogan(id: string) {
  try {
    await connectDB();
    await Slogan.findByIdAndDelete(id);

    revalidatePath("/about");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting slogan:", error);
    return { success: false, error: error.message };
  }
}
