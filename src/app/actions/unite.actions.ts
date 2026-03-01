"use server";

import { connectDB } from "@/lib/mongoose";
import { Section, Programme, Unite } from "@/lib/models/Section";
import mongoose from "mongoose";

export async function addUnite(
  promotionId: string,
  semestreIndex: number,
  uniteData: {
    code: string;
    designation: string;
    description: string;
    competences: string;
    credit: number;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    const newUnite = {
      code: uniteData.code,
      designation: uniteData.designation,
      description: uniteData.description
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d),
      competences: uniteData.competences
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c),
      credit: uniteData.credit,
    };

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $push: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites`]:
            newUnite,
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
      return { success: false, error: "Failed to add unite" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error adding unite:", error);
    return { success: false, error: "Failed to add unite" };
  }
}

export async function updateUnite(
  promotionId: string,
  semestreIndex: number,
  uniteIndex: number,
  uniteData: {
    code: string;
    designation: string;
    description: string;
    competences: string;
    credit: number;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" };
    }

    await connectDB();

    const updatedUnite = {
      code: uniteData.code,
      designation: uniteData.designation,
      description: uniteData.description
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d),
      competences: uniteData.competences
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c),
      credit: uniteData.credit,
    };

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites.${uniteIndex}`]:
            updatedUnite,
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
      return { success: false, error: "Failed to update unite" };
    }

    const plainResult = JSON.parse(JSON.stringify(result));
    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error updating unite:", error);
    return { success: false, error: "Failed to update unite" };
  }
}

export async function deleteUnite(
  promotionId: string,
  semestreIndex: number,
  uniteIndex: number,
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

    // Find the programme and semestre
    let targetSemestre: any = null;
    for (const filiere of section.filieres || []) {
      const prog = (filiere.programmes || []).find(
        (p: any) => String(p._id) === promotionId,
      );
      if (prog && prog.semestres && prog.semestres[semestreIndex]) {
        targetSemestre = prog.semestres[semestreIndex];
        break;
      }
    }

    if (!targetSemestre || !targetSemestre.unites) {
      return { success: false, error: "Semestre or unites not found" };
    }

    // Remove the unite at the given index
    const updatedUnites = targetSemestre.unites.filter(
      (_: any, i: number) => i !== uniteIndex,
    );

    const result = await Section.findOneAndUpdate(
      {
        "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId),
      },
      {
        $set: {
          [`filieres.$[].programmes.$[prog].semestres.${semestreIndex}.unites`]:
            updatedUnites,
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
      return { success: false, error: "Failed to delete unite" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting unite:", error);
    return { success: false, error: "Failed to delete unite" };
  }
}

// Find the promotion containing this unite and return the updated promotion with populated data
export async function fetchPromotionByUniteId(
  uniteId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!uniteId || uniteId.length !== 24) {
      return { success: false, error: "Invalid unite ID" };
    }

    await connectDB();

    console.log("Fetching promotion for unite ID:", uniteId);

    // Find the section containing this unite
    const section: any = await Section.findOne({
      "filieres.programmes.semestres.unites._id": new mongoose.Types.ObjectId(
        uniteId,
      ),
    }).lean();

    console.log("Section found:", section ? "Yes" : "No");

    if (!section) {
      return { success: false, error: "Unite not found in section" };
    }

    // Find the unite and programme in the nested structure
    let targetUnite: any = null;
    let targetProgramme: any = null;
    let targetFiliere: any = null;
    let targetSemestre: any = null;

    for (const filiere of section.filieres || []) {
      for (const programme of filiere.programmes || []) {
        for (const semestre of programme.semestres || []) {
          const unite = semestre.unites?.find(
            (u: any) => String(u._id) === uniteId,
          );
          if (unite) {
            targetUnite = unite;
            targetProgramme = programme;
            targetFiliere = filiere;
            targetSemestre = semestre;
            break;
          }
        }
        if (targetUnite) break;
      }
      if (targetUnite) break;
    }

    console.log("Unite found:", targetUnite ? "Yes" : "No");

    if (!targetUnite || !targetProgramme) {
      return { success: false, error: "Unite not found in programme" };
    }

    const plainResult = JSON.parse(
      JSON.stringify({
        programme: {
          _id: targetProgramme._id,
          niveau: targetProgramme.niveau,
          designation: targetProgramme.designation,
          description: targetProgramme.description,
          semestres: targetProgramme.semestres,
        },
        unite: targetUnite,
        semestre: {
          designation: targetSemestre.designation,
          credit: targetSemestre.credit,
        },
        filiere: {
          _id: targetFiliere._id,
          sigle: targetFiliere.sigle,
          designation: targetFiliere.designation,
        },
        section: {
          mention: section.mention,
          designation: section.designation,
        },
      }),
    );

    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error fetching promotion by unite:", error);
    return { success: false, error: "Failed to fetch promotion" };
  }
}
