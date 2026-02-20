"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import mongoose from "mongoose";

export async function fetchStages(anneeId: string, promotionId: string) {
  try {
    await connectDB();

    const stages = await RecetteModels.Stage.find({
      anneeId: new mongoose.Types.ObjectId(anneeId),
      promotionId: new mongoose.Types.ObjectId(promotionId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stages)),
    };
  } catch (error: any) {
    console.error("Error fetching stages:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch stages",
    };
  }
}

export async function createStage(data: {
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

    const stage = await RecetteModels.Stage.create({
      ...data,
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      entreprises: [],
      isActive: true,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stage)),
    };
  } catch (error: any) {
    console.error("Error creating stage:", error);
    return {
      success: false,
      error: error.message || "Failed to create stage",
    };
  }
}

export async function updateStage(
  stageId: string,
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

    const stage = await RecetteModels.Stage.findByIdAndUpdate(
      stageId,
      { $set: data },
      { new: true },
    ).lean();

    if (!stage) {
      return {
        success: false,
        error: "Stage not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stage)),
    };
  } catch (error: any) {
    console.error("Error updating stage:", error);
    return {
      success: false,
      error: error.message || "Failed to update stage",
    };
  }
}

export async function deleteStage(stageId: string) {
  try {
    await connectDB();

    const stage = await RecetteModels.Stage.findByIdAndDelete(stageId);

    if (!stage) {
      return {
        success: false,
        error: "Stage not found",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting stage:", error);
    return {
      success: false,
      error: error.message || "Failed to delete stage",
    };
  }
}

export async function addEntrepriseToStage(
  stageId: string,
  entreprise: {
    nom: string;
    adresse?: string;
    contact: string;
  },
) {
  try {
    await connectDB();

    const stage = await RecetteModels.Stage.findByIdAndUpdate(
      stageId,
      {
        $push: {
          entreprises: entreprise,
        },
      },
      { new: true },
    ).lean();

    if (!stage) {
      return {
        success: false,
        error: "Stage not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stage)),
    };
  } catch (error: any) {
    console.error("Error adding entreprise:", error);
    return {
      success: false,
      error: error.message || "Failed to add entreprise",
    };
  }
}

export async function removeEntrepriseFromStage(
  stageId: string,
  entrepriseId: string,
) {
  try {
    await connectDB();

    const stage = await RecetteModels.Stage.findByIdAndUpdate(
      stageId,
      {
        $pull: {
          entreprises: { _id: new mongoose.Types.ObjectId(entrepriseId) },
        },
      },
      { new: true },
    ).lean();

    if (!stage) {
      return {
        success: false,
        error: "Stage not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stage)),
    };
  } catch (error: any) {
    console.error("Error removing entreprise:", error);
    return {
      success: false,
      error: error.message || "Failed to remove entreprise",
    };
  }
}

export async function updateEntreprise(
  stageId: string,
  entrepriseId: string,
  entreprise: {
    nom: string;
    adresse?: string;
    contact: string;
  },
) {
  try {
    await connectDB();

    const stage = await RecetteModels.Stage.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(stageId),
        "entreprises._id": new mongoose.Types.ObjectId(entrepriseId),
      },
      {
        $set: {
          "entreprises.$.nom": entreprise.nom,
          "entreprises.$.adresse": entreprise.adresse,
          "entreprises.$.contact": entreprise.contact,
        },
      },
      { new: true },
    ).lean();

    if (!stage) {
      return {
        success: false,
        error: "Stage or entreprise not found",
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(stage)),
    };
  } catch (error: any) {
    console.error("Error updating entreprise:", error);
    return {
      success: false,
      error: error.message || "Failed to update entreprise",
    };
  }
}
