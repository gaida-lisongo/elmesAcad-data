"use server";

import { connectDB } from "@/lib/mongoose";
import { Section, Element, Unite } from "@/lib/models/Section";
import { User } from "@/lib/models/User";
import { Annee } from "@/lib/models/Annee";
import mongoose from "mongoose";

export async function fetchUniteById(
  uniteId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!uniteId || uniteId.length !== 24) {
      return { success: false, error: "Invalid unite ID" };
    }

    await connectDB();

    // Find the section containing this unite
    const section: any = await Section.findOne({
      "filieres.programmes.semestres.unites._id": new mongoose.Types.ObjectId(
        uniteId,
      ),
    }).lean();

    if (!section) {
      return { success: false, error: "Unite not found" };
    }

    // Find the unite in the nested structure
    let targetUnite: any = null;
    let semestreName = "";
    let programmeName = "";
    let filiereName = "";
    let filiereId = "";

    for (const filiere of section.filieres || []) {
      for (const programme of filiere.programmes || []) {
        for (const semestre of programme.semestres || []) {
          const unite = semestre.unites?.find(
            (u: any) => String(u._id) === uniteId,
          );
          if (unite) {
            targetUnite = unite;
            semestreName = semestre.designation;
            programmeName = `${programme.niveau} - ${programme.designation}`;
            filiereName = filiere.designation;
            filiereId = String(filiere._id || "");
            break;
          }
        }
        if (targetUnite) break;
      }
      if (targetUnite) break;
    }

    if (!targetUnite) {
      return { success: false, error: "Unite not found" };
    }

    const plainResult = JSON.parse(
      JSON.stringify({
        unite: targetUnite,
        semestre: semestreName,
        programme: programmeName,
        section: section.designation,
        filiere: filiereName,
        filiereId,
      }),
    );

    return { success: true, data: plainResult };
  } catch (error) {
    console.error("Error fetching unite by id:", error);
    return { success: false, error: "Failed to fetch unite" };
  }
}

export async function fetchElementsByUniteId(
  uniteId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (!uniteId || uniteId.length !== 24) {
      return { success: false, error: "Invalid unite ID" };
    }

    await connectDB();

    const elements = await Element.find({
      uniteId: new mongoose.Types.ObjectId(uniteId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const plainElements = JSON.parse(JSON.stringify(elements));
    return { success: true, data: plainElements };
  } catch (error) {
    console.error("Error fetching elements:", error);
    return { success: false, error: "Failed to fetch elements" };
  }
}

export async function fetchElementByTitulaireIdAndAnneeId(
  titulaireId: string,
  anneeId: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    if (!titulaireId || titulaireId.length !== 24) {
      return { success: false, error: "Invalid titulaire ID" };
    }
    if (!anneeId || anneeId.length !== 24) {
      return { success: false, error: "Invalid annee ID" };
    }

    await connectDB();

    const elements = await Element.find({
      titulaireId: new mongoose.Types.ObjectId(titulaireId),
      anneeId: new mongoose.Types.ObjectId(anneeId),
    })
      .populate("uniteId")
      .populate("anneeId")
      .sort({ createdAt: -1 })
      .lean();

    const plainElements = JSON.parse(JSON.stringify(elements));
    return { success: true, data: plainElements };
  } catch (error) {
    console.error("Error fetching elements by titulaire and annee:", error);
    return { success: false, error: "Failed to fetch elements" };
  }
}

export async function fetchElementById(
  elementId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!elementId || elementId.length !== 24) {
      return { success: false, error: "Invalid element ID" };
    }

    await connectDB();

    const element = await Element.findById(elementId)
      .populate("anneeId")
      .lean();

    if (!element) {
      return { success: false, error: "Element not found" };
    }
    const plainElement = JSON.parse(JSON.stringify(element));
    return { success: true, data: plainElement };
  } catch (error) {
    console.error("Error fetching element by id:", error);
    return { success: false, error: "Failed to fetch element" };
  }
}

export async function countElementsByUniteId(
  uniteId: string,
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    if (!uniteId || uniteId.length !== 24) {
      return { success: false, error: "Invalid unite ID" };
    }

    await connectDB();

    const count = await Element.countDocuments({
      uniteId: new mongoose.Types.ObjectId(uniteId),
    });

    return { success: true, count };
  } catch (error) {
    console.error("Error counting elements:", error);
    return { success: false, error: "Failed to count elements" };
  }
}

export async function createElement(
  uniteId: string,
  anneeId: string,
  elementData: {
    code: string;
    designation: string;
    credit: number;
    objectifs: string[];
    place_ec: string;
    titulaireId: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!uniteId || uniteId.length !== 24) {
      return { success: false, error: "Invalid unite ID" };
    }
    if (!anneeId || anneeId.length !== 24) {
      return { success: false, error: "Invalid annee ID" };
    }

    await connectDB();

    const newElement = new Element({
      code: elementData.code,
      designation: elementData.designation,
      credit: elementData.credit,
      objectifs: elementData.objectifs,
      place_ec: elementData.place_ec,
      uniteId: new mongoose.Types.ObjectId(uniteId),
      anneeId: new mongoose.Types.ObjectId(anneeId),
      titulaireId: elementData.titulaireId
        ? new mongoose.Types.ObjectId(elementData.titulaireId)
        : undefined,
    });

    await newElement.save();

    const plainElement = JSON.parse(JSON.stringify(newElement));
    return { success: true, data: plainElement };
  } catch (error) {
    console.error("Error creating element:", error);
    return { success: false, error: "Failed to create element" };
  }
}

export async function updateElement(
  elementId: string,
  elementData: {
    code: string;
    designation: string;
    credit: number;
    objectifs: string[];
    place_ec: string;
    planning?: {
      chapitre: string;
      sections: string[];
    }[];
    mode_evaluation?: string[];
    mode_enseignement?: string[];
    penalites?: {
      faute: string;
      sanction: string;
    }[];
    titulaireId?: string;
  },
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!elementId || elementId.length !== 24) {
      return { success: false, error: "Invalid element ID" };
    }

    await connectDB();

    const updateData: any = {
      code: elementData.code,
      designation: elementData.designation,
      credit: elementData.credit,
      objectifs: elementData.objectifs,
      place_ec: elementData.place_ec,
    };

    if (elementData.planning !== undefined) {
      updateData.planning = elementData.planning;
    }

    if (elementData.mode_evaluation !== undefined) {
      updateData.mode_evaluation = elementData.mode_evaluation;
    }

    if (elementData.mode_enseignement !== undefined) {
      updateData.mode_enseignement = elementData.mode_enseignement;
    }

    if (elementData.penalites !== undefined) {
      updateData.penalites = elementData.penalites;
    }

    if (elementData.titulaireId) {
      updateData.titulaireId = new mongoose.Types.ObjectId(
        elementData.titulaireId,
      );
    }

    const updatedElement = await Element.findByIdAndUpdate(
      elementId,
      updateData,
      { new: true },
    ).lean();

    if (!updatedElement) {
      return { success: false, error: "Element not found" };
    }

    const plainElement = JSON.parse(JSON.stringify(updatedElement));
    return { success: true, data: plainElement };
  } catch (error) {
    console.error("Error updating element:", error);
    return { success: false, error: "Failed to update element" };
  }
}

export async function deleteElement(
  elementId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!elementId || elementId.length !== 24) {
      return { success: false, error: "Invalid element ID" };
    }

    await connectDB();

    const deletedElement = await Element.findByIdAndDelete(elementId);

    if (!deletedElement) {
      return { success: false, error: "Element not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting element:", error);
    return { success: false, error: "Failed to delete element" };
  }
}
