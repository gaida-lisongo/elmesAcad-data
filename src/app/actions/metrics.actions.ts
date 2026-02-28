"use server";

import { connectDB } from "@/lib/mongoose";
import { Programme, Unite } from "@/lib/models/Section";
import RecetteModels from "@/lib/models/Recette";
import { fetchAllPromotions } from "./promotion.actions";

export async function fetchMetrics(anneeId?: string) {
  try {
    await connectDB();

    // Count promotions (programmes)
    const { success, data } = await fetchAllPromotions();
    console.log("Fetch promotions result:", { success, data });

    const promotionsCount = success && data ? data.length : 0;
    console.log("Promotions count:", promotionsCount);
    // Count unites
    const unitesCount = data
      ? data.reduce((count, promo) => {
          console.log(
            `Processing promo: ${promo.designation} with ID: ${promo._id}, semestres: ${promo.semestres}`,
          );
          const promoUnites = promo.semestres.reduce((semCount: number, semestre: any) => {
            return semCount + (semestre.unites ? semestre.unites.length : 0);
          }, 0);
          return count + promoUnites;
        }, 0)
      : 0;

    console.log("Unites count:", unitesCount);

    // Count sujets
    const sujetsFilter = anneeId ? { anneeId } : {};
    const sujetsCount = await RecetteModels.Sujet.countDocuments(sujetsFilter);

    // Count stages
    const stagesFilter = anneeId ? { anneeId } : {};
    const stagesCount = await RecetteModels.Stage.countDocuments(stagesFilter);
    console.log("Stages count:", stagesCount);

    return {
      success: true,
      data: {
        promotions: promotionsCount,
        unites: unitesCount,
        sujets: sujetsCount,
        stages: stagesCount,
      },
    };
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    return {
      success: false,
      error: error.message,
      data: {
        promotions: 0,
        unites: 0,
        sujets: 0,
        stages: 0,
      },
    };
  }
}
