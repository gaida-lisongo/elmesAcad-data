"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import mongoose from "mongoose";

export async function fetchSujets(anneeId: string, promotionId: string) {
  try {
    await connectDB();

    const sujets = await RecetteModels.Sujet.find({
      anneeId: new mongoose.Types.ObjectId(anneeId),
      promotionId: new mongoose.Types.ObjectId(promotionId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujets)),
    };
  } catch (error: any) {
    console.error("Error fetching sujets:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch sujets",
    };
  }
}

export async function createSujet(data: {
  designation: string;
  description: string[];
  prix: number;
  date_debut: Date;
  date_fin: Date;
  anneeId: string;
  promotionId: string;
}) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.create({
      ...data,
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      criteres: [],
      isActive: true,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujet)),
    };
  } catch (error: any) {
    console.error("Error creating sujet:", error);
    return {
      success: false,
      error: error.message || "Failed to create sujet",
    };
  }
}

export async function updateSujet(
  sujetId: string,
  data: {
    designation?: string;
    description?: string[];
    prix?: number;
    date_debut?: Date;
    date_fin?: Date;
    isActive?: boolean;
  },
) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.findByIdAndUpdate(
      sujetId,
      { $set: data },
      { new: true },
    ).lean();

    if (!sujet) {
      return {
        success: false,
        error: "Sujet not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujet)),
    };
  } catch (error: any) {
    console.error("Error updating sujet:", error);
    return {
      success: false,
      error: error.message || "Failed to update sujet",
    };
  }
}

export async function deleteSujet(sujetId: string) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.findByIdAndDelete(sujetId);

    if (!sujet) {
      return {
        success: false,
        error: "Sujet not found",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting sujet:", error);
    return {
      success: false,
      error: error.message || "Failed to delete sujet",
    };
  }
}

export async function addCritereToSujet(
  sujetId: string,
  critere: {
    critere: string;
    description: string;
  },
) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.findByIdAndUpdate(
      sujetId,
      {
        $push: {
          criteres: critere,
        },
      },
      { new: true },
    ).lean();

    if (!sujet) {
      return {
        success: false,
        error: "Sujet not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujet)),
    };
  } catch (error: any) {
    console.error("Error adding critere:", error);
    return {
      success: false,
      error: error.message || "Failed to add critere",
    };
  }
}

export async function removeCritereFromSujet(
  sujetId: string,
  critereId: string,
) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.findByIdAndUpdate(
      sujetId,
      {
        $pull: {
          criteres: { _id: new mongoose.Types.ObjectId(critereId) },
        },
      },
      { new: true },
    ).lean();

    if (!sujet) {
      return {
        success: false,
        error: "Sujet not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujet)),
    };
  } catch (error: any) {
    console.error("Error removing critere:", error);
    return {
      success: false,
      error: error.message || "Failed to remove critere",
    };
  }
}

export async function updateCritere(
  sujetId: string,
  critereId: string,
  critere: {
    critere: string;
    description: string;
  },
) {
  try {
    await connectDB();

    const sujet = await RecetteModels.Sujet.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(sujetId),
        "criteres._id": new mongoose.Types.ObjectId(critereId),
      },
      {
        $set: {
          "criteres.$.critere": critere.critere,
          "criteres.$.description": critere.description,
        },
      },
      { new: true },
    ).lean();

    if (!sujet) {
      return {
        success: false,
        error: "Sujet or critere not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(sujet)),
    };
  } catch (error: any) {
    console.error("Error updating critere:", error);
    return {
      success: false,
      error: error.message || "Failed to update critere",
    };
  }
}
