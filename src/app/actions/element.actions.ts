"use server";

import { connectDB } from "@/lib/mongoose";
import { Section } from "@/lib/models/Section";
import mongoose from "mongoose";

// Note: Elements will be managed in the /cours/[unite] page
// These actions will be used later for that feature

export async function addElement(
  promotionId: string,
  semestreIndex: number,
  uniteIndex: number,
  elementData: {
    code: string;
    designation: string;
    objectifs: string;
    place_ec: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    const newElement = {
      code: elementData.code,
      designation: elementData.designation,
      objectifs: elementData.objectifs
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o),
      place_ec: elementData.place_ec,
    };

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $push: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites.${uniteIndex}.elements`]:
            newElement,
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
      return { success: false, error: "Failed to add element" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error adding element:", error);
    return { success: false, error: "Failed to add element" };
  }
}

export async function updateElement(
  promotionId: string,
  semestreIndex: number,
  uniteIndex: number,
  elementIndex: number,
  elementData: {
    code: string;
    designation: string;
    objectifs: string;
    place_ec: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    const updatedElement = {
      code: elementData.code,
      designation: elementData.designation,
      objectifs: elementData.objectifs
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o),
      place_ec: elementData.place_ec,
    };

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites.${uniteIndex}.elements.${elementIndex}`]:
            updatedElement,
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
      return { success: false, error: "Failed to update element" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error updating element:", error);
    return { success: false, error: "Failed to update element" };
  }
}

export async function deleteElement(
  promotionId: string,
  semestreIndex: number,
  uniteIndex: number,
  elementIndex: number,
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

    // Find the programme, semestre, and unite
    let targetUnite: any = null;
    for (const filiere of section.filieres || []) {
      const prog = (filiere.programmes || []).find(
        (p: any) => String(p._id) === promotionId,
      );
      if (
        prog &&
        prog.semestres &&
        prog.semestres[semestreIndex] &&
        prog.semestres[semestreIndex].unites &&
        prog.semestres[semestreIndex].unites[uniteIndex]
      ) {
        targetUnite = prog.semestres[semestreIndex].unites[uniteIndex];
        break;
      }
    }

    if (!targetUnite || !targetUnite.elements) {
      return { success: false, error: "Unite or elements not found" };
    }

    // Remove the element at the given index
    const updatedElements = targetUnite.elements.filter(
      (_: any, i: number) => i !== elementIndex,
    );

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites.${uniteIndex}.elements`]:
            updatedElements,
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
      return { success: false, error: "Failed to delete element" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting element:", error);
    return { success: false, error: "Failed to delete element" };
  }
}
