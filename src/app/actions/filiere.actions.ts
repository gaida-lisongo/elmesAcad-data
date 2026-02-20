"use server";

import { connectDB } from "@/lib/mongoose";
import { Section } from "@/lib/models/Section";
import mongoose from "mongoose";

export async function fetchFiliereById(
  filiereId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" };
    }

    await connectDB();

    const section = await Section.findOne({
      "filieres._id": new mongoose.Types.ObjectId(filiereId),
    }).lean();

    if (!section) {
      return { success: false, error: "Filiere not found" };
    }

    const filiereRaw: any = section.filieres?.find(
      (f: any) => String(f._id || "") === filiereId,
    );

    if (!filiereRaw) {
      return { success: false, error: "Filiere not found" };
    }

    // Transform the filiere data for the page
    const filiereData = {
      _id: String(filiereRaw._id),
      sigle: filiereRaw.sigle,
      designation: filiereRaw.designation,
      description: Array.isArray(filiereRaw.description)
        ? filiereRaw.description.join(" ")
        : filiereRaw.description,
      programmes: filiereRaw.programmes || [],
      sectionId: String(section._id),
      sectionName: section.designation,
    };

    const plainFiliere = JSON.parse(JSON.stringify(filiereData));
    return { success: true, data: plainFiliere };
  } catch (error) {
    console.error("Error fetching filiere by id:", error);
    return { success: false, error: "Failed to fetch filiere" };
  }
}

export async function fetchAllFilieres(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    await connectDB();
    const sections = await Section.find().lean();

    const allFilieres: any[] = [];

    sections.forEach((section) => {
      section.filieres?.forEach((filiere: any) => {
        allFilieres.push({
          _id: String(filiere._id),
          sigle: filiere.sigle,
          designation: filiere.designation,
          description: Array.isArray(filiere.description)
            ? filiere.description.join(" ")
            : filiere.description,
          programmes: filiere.programmes || [],
          sectionId: String(section._id),
          sectionName: section.designation,
        });
      });
    });

    const plainFilieres = JSON.parse(JSON.stringify(allFilieres));
    return { success: true, data: plainFilieres };
  } catch (error) {
    console.error("Error fetching all filieres:", error);
    return { success: false, error: "Failed to fetch filieres" };
  }
}

export async function createFiliere(
  sectionId: string,
  data: { sigle: string; designation: string; description: string },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" };
    }

    await connectDB();

    const newFiliere = {
      sigle: data.sigle,
      designation: data.designation,
      description: data.description.split(",").map((d) => d.trim()),
      programmes: [],
    };

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: { filieres: newFiliere },
      },
      {
        returnDocument: "after",
      },
    ).lean();

    if (!result) {
      return { success: false, error: "Section not found" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error creating filiere:", error);
    return { success: false, error: "Failed to create filiere" };
  }
}

export async function updateFiliere(
  sectionId: string,
  filiereId: string,
  data: { sigle: string; designation: string; description: string },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" };
    }

    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" };
    }

    await connectDB();

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $set: {
          "filieres.$[filiere].sigle": data.sigle,
          "filieres.$[filiere].designation": data.designation,
          "filieres.$[filiere].description": data.description
            .split(",")
            .map((d) => d.trim()),
        },
      },
      {
        arrayFilters: [
          { "filiere._id": new mongoose.Types.ObjectId(filiereId) },
        ],
        returnDocument: "after",
      },
    ).lean();

    if (!result) {
      return { success: false, error: "Section or filiere not found" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error updating filiere:", error);
    return { success: false, error: "Failed to update filiere" };
  }
}

export async function deleteFiliere(
  sectionId: string,
  filiereId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" };
    }

    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" };
    }

    await connectDB();

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $pull: {
          filieres: { _id: new mongoose.Types.ObjectId(filiereId) },
        },
      },
      {
        returnDocument: "after",
      },
    ).lean();

    if (!result) {
      return { success: false, error: "Section not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting filiere:", error);
    return { success: false, error: "Failed to delete filiere" };
  }
}
