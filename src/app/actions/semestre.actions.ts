"use server";

import { connectDB } from "@/lib/mongoose";
import { Section } from "@/lib/models/Section";
import mongoose from "mongoose";

export async function addSemestre(
  promotionId: string,
  semestreData: { designation: string; credit: number },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    // Find section containing this promotion
    const section = await Section.findOne({
      "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
    });

    if (!section) {
      return { success: false, error: "Promotion not found" };
    }

    // Add semestre to the promotion
    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $push: {
          "filieres.$[].programmes.$[prog].semestres": {
            designation: semestreData.designation,
            credit: semestreData.credit,
            unites: [],
          },
        },
      },
      {
        arrayFilters: [
          { "prog._id": new mongoose.Types.ObjectId(promotionId) },
        ],
        returnDocument: "after",
      },
    ).lean();

    if (!result) {
      return { success: false, error: "Failed to add semestre" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error adding semestre:", error);
    return { success: false, error: "Failed to add semestre" };
  }
}

export async function updateSemestre(
  promotionId: string,
  semestreIndex: number,
  semestreData: { designation: string; credit: number },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    // Find section containing this promotion
    const section = await Section.findOne({
      "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
    });

    if (!section) {
      return { success: false, error: "Promotion not found" };
    }

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.designation`]:
            semestreData.designation,
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.credit`]:
            semestreData.credit,
        },
      },
      {
        arrayFilters: [
          { "prog._id": new mongoose.Types.ObjectId(promotionId) },
        ],
        returnDocument: "after",
      },
    ).lean();

    if (!result) {
      return { success: false, error: "Failed to update semestre" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error updating semestre:", error);
    return { success: false, error: "Failed to update semestre" };
  }
}

export async function deleteSemestre(
  promotionId: string,
  semestreIndex: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    // Find section containing this promotion
    const section: any = await Section.findOne({
      "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
    }).lean();

    if (!section) {
      return { success: false, error: "Promotion not found" };
    }

    // Find the programme
    let targetProgramme: any = null;
    for (const filiere of section.filieres || []) {
      const prog = (filiere.programmes || []).find(
        (p: any) => String(p._id) === promotionId,
      );
      if (prog) {
        targetProgramme = prog;
        break;
      }
    }

    if (!targetProgramme || !targetProgramme.semestres) {
      return { success: false, error: "Programme or semestres not found" };
    }

    // Remove the semestre at the given index
    const updatedSemestres = targetProgramme.semestres.filter(
      (_: any, i: number) => i !== semestreIndex,
    );

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          "filieres.$[].programmes.$[prog].semestres": updatedSemestres,
        },
      },
      {
        arrayFilters: [
          { "prog._id": new mongoose.Types.ObjectId(promotionId) },
        ],
        returnDocument: "after",
      },
    );

    if (!result) {
      return { success: false, error: "Failed to delete semestre" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting semestre:", error);
    return { success: false, error: "Failed to delete semestre" };
  }
}
