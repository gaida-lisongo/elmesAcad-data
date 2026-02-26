"use server";

import { connectDB } from "@/lib/mongoose";
import { Section } from "@/lib/models/Section";

export async function fetchSections(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await connectDB();
    const sections = await Section.find().lean();
    const plainSections = JSON.parse(JSON.stringify(sections));
    return { success: true, data: plainSections };
  } catch (error) {
    console.error("Error fetching sections:", error);
    return { success: false, error: "Failed to fetch sections" };
  }
}

export async function createSection(data: {
  mention: string;
  designation: string;
  mission: string;
  promesses: string[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();
    const newSection = new Section(data);
    const savedSection = await newSection.save();
    const plainSection = JSON.parse(JSON.stringify(savedSection));
    return { success: true, data: plainSection };
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, error: "Failed to create section" };
  }
}

export async function updateSection(
  id: string,
  data: Partial<{
    mention: string;
    designation: string;
    mission: string;
    promesses: string[];
  }>,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate ID before attempting update
    if (!id || id === "" || id.length !== 24) {
      return {
        success: false,
        error: "Invalid section ID. Please create a section first.",
      };
    }

    await connectDB();
    const updatedSection = await Section.findByIdAndUpdate(id, data, {
      returnDocument: "after",
    }).lean();
    if (!updatedSection) {
      return { success: false, error: "Section not found" };
    }

    const plainSection = JSON.parse(JSON.stringify(updatedSection));
    return { success: true, data: plainSection };
  } catch (error) {
    console.error("Error updating section:", error);
    return { success: false, error: "Failed to update section" };
  }
}
