"use server";

import { connectDB } from "@/lib/mongoose";
import { Horaire } from "@/lib/models/Section";
import { revalidatePath } from "next/cache";

// Fetch horaires pour une promotion donnée
export async function fetchHoraires(promotionId: string, anneeId?: string) {
  try {
    await connectDB();

    const query: any = { promotionId };
    if (anneeId) {
      query.anneeId = anneeId;
    }

    const horaires = await Horaire.find(query)
      .populate("anneeId")
      .populate("promotionId")
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(horaires)),
    };
  } catch (error: any) {
    console.error("Error fetching horaires:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la récupération des horaires",
    };
  }
}

// Create horaire
export async function createHoraire(data: {
  anneeId: string;
  promotionId: string;
  semestreId: string;
}) {
  try {
    await connectDB();

    const newHoraire = new Horaire({
      anneeId: data.anneeId,
      promotionId: data.promotionId,
      semestreId: data.semestreId,
      planing: [],
    });

    await newHoraire.save();

    revalidatePath("/programmes");
    revalidatePath(`/programmes/${data.promotionId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newHoraire)),
    };
  } catch (error: any) {
    console.error("Error creating horaire:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la création de l'horaire",
    };
  }
}

// Update horaire
export async function updateHoraire(
  horaireId: string,
  data: {
    anneeId?: string;
    promotionId?: string;
    semestreId?: string;
  },
) {
  try {
    await connectDB();

    const horaire = await Horaire.findByIdAndUpdate(horaireId, data, {
      new: true,
    });

    if (!horaire) {
      return {
        success: false,
        error: "Horaire non trouvé",
      };
    }

    revalidatePath("/programmes");
    revalidatePath(`/programmes/${data.promotionId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(horaire)),
    };
  } catch (error: any) {
    console.error("Error updating horaire:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour de l'horaire",
    };
  }
}

// Delete horaire
export async function deleteHoraire(horaireId: string, promotionId?: string) {
  try {
    await connectDB();

    const horaire = await Horaire.findByIdAndDelete(horaireId);

    if (!horaire) {
      return {
        success: false,
        error: "Horaire non trouvé",
      };
    }

    revalidatePath("/programmes");
    if (promotionId) {
      revalidatePath(`/programmes/${promotionId}`);
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error deleting horaire:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression de l'horaire",
    };
  }
}

// Add planning to horaire
export async function addPlanningToHoraire(
  horaireId: string,
  planning: {
    debut: Date;
    fin: Date;
    description: string;
    elementId: string;
    isActive: boolean;
  },
) {
  try {
    await connectDB();

    const horaire = await Horaire.findById(horaireId);

    if (!horaire) {
      return {
        success: false,
        error: "Horaire non trouvé",
      };
    }

    horaire.planing.push(planning as any);
    await horaire.save();

    revalidatePath("/programmes");
    revalidatePath(`/programmes/${horaire.promotionId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(horaire)),
    };
  } catch (error: any) {
    console.error("Error adding planning:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de l'ajout du planning",
    };
  }
}

// Update planning in horaire
export async function updatePlanningInHoraire(
  horaireId: string,
  planningId: string,
  updatedData: {
    debut?: Date;
    fin?: Date;
    description?: string;
    elementId?: string;
    isActive?: boolean;
  },
) {
  try {
    await connectDB();

    const horaire = await Horaire.findById(horaireId);

    if (!horaire) {
      return {
        success: false,
        error: "Horaire non trouvé",
      };
    }

    const planningIndex = horaire.planing.findIndex(
      (p: any) => String(p._id) === String(planningId),
    );

    if (planningIndex === -1) {
      return {
        success: false,
        error: "Planning non trouvé",
      };
    }

    horaire.planing[planningIndex] = {
      ...horaire.planing[planningIndex],
      ...updatedData,
    } as any;

    await horaire.save();

    revalidatePath("/programmes");
    revalidatePath(`/programmes/${horaire.promotionId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(horaire)),
    };
  } catch (error: any) {
    console.error("Error updating planning:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la mise à jour du planning",
    };
  }
}

// Remove planning from horaire
export async function removePlanningFromHoraire(
  horaireId: string,
  planningId: string,
) {
  try {
    await connectDB();

    const horaire = await Horaire.findById(horaireId);

    if (!horaire) {
      return {
        success: false,
        error: "Horaire non trouvé",
      };
    }

    horaire.planing = horaire.planing.filter(
      (p: any) => String(p._id) !== String(planningId),
    );

    await horaire.save();

    revalidatePath("/programmes");
    revalidatePath(`/programmes/${horaire.promotionId}`);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(horaire)),
    };
  } catch (error: any) {
    console.error("Error removing planning:", error);
    return {
      success: false,
      error: error.message || "Erreur lors de la suppression du planning",
    };
  }
}
