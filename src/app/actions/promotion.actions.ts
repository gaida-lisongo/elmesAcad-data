"use server"

import { connectDB } from "@/lib/mongoose"
import { Section } from "@/lib/models/Section"
import mongoose from "mongoose"

export async function fetchPromotionsByFiliere(filiereId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB()
    const section = await Section.findOne({ "filieres._id": new mongoose.Types.ObjectId(filiereId) }).lean()
    
    if (!section) {
      return { success: false, error: "Filiere not found" }
    }

    const filiere = section.filieres?.find(f => String(f._id || '') === filiereId)
    if (!filiere) {
      return { success: false, error: "Filiere not found" }
    }

    const plainPromotions = JSON.parse(JSON.stringify(filiere.programmes || []))
    return { success: true, data: plainPromotions }
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return { success: false, error: "Failed to fetch promotions" }
  }
}

export async function fetchAllPromotions(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await connectDB()
    const sections = await Section.find().lean()
    
    const allPromotions: any[] = []
    
    sections.forEach(section => {
      section.filieres?.forEach(filiere => {
        filiere.programmes?.forEach(programme => {
          allPromotions.push({
            ...programme,
            filiereId: filiere._id,
            filiereName: filiere.designation,
            sectionId: section._id
          })
        })
      })
    })

    const plainPromotions = JSON.parse(JSON.stringify(allPromotions))
    return { success: true, data: plainPromotions }
  } catch (error) {
    console.error("Error fetching all promotions:", error)
    return { success: false, error: "Failed to fetch promotions" }
  }
}

export async function createPromotion(
  sectionId: string,
  filiereId: string,
  data: { niveau: string; designation: string; description: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Validate IDs
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" }
    }

    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" }
    }

    await connectDB()

    const newProgramme = {
      niveau: data.niveau,
      designation: data.designation,
      description: data.description.split(",").map(d => d.trim()),
      semestres: [],
    }

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          "filieres.$[filiere].programmes": newProgramme,
        },
      },
      {
        arrayFilters: [{ "filiere._id": new mongoose.Types.ObjectId(filiereId) }],
        returnDocument: "after",
      }
    ).lean()

    if (!result) {
      return { success: false, error: "Section or filiere not found" }
    }

    const plainResult = JSON.parse(JSON.stringify(result))
    return { success: true, data: plainResult }
  } catch (error) {
    console.error("Error creating promotion:", error)
    return { success: false, error: "Failed to create promotion" }
  }
}

export async function updatePromotion(
  sectionId: string,
  filiereId: string,
  promotionIndex: number,
  data: { niveau: string; designation: string; description: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" }
    }

    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" }
    }

    await connectDB()

    const section = await Section.findById(sectionId).lean()
    if (!section) {
      return { success: false, error: "Section not found" }
    }

    const filiere = section.filieres?.find(f => String(f._id || '') === filiereId)
    if (!filiere || !filiere.programmes) {
      return { success: false, error: "Filiere or programme not found" }
    }

    // Update the promotion at the given index
    const updatedProgrammes = [...filiere.programmes]
    updatedProgrammes[promotionIndex] = {
      ...updatedProgrammes[promotionIndex],
      niveau: data.niveau,
      designation: data.designation,
      description: data.description.split(",").map(d => d.trim()),
    }

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $set: {
          "filieres.$[filiere].programmes": updatedProgrammes,
        },
      },
      {
        arrayFilters: [{ "filiere._id": new mongoose.Types.ObjectId(filiereId) }],
        returnDocument: "after",
      }
    ).lean()

    if (!result) {
      return { success: false, error: "Failed to update promotion" }
    }

    const plainResult = JSON.parse(JSON.stringify(result))
    return { success: true, data: plainResult }
  } catch (error) {
    console.error("Error updating promotion:", error)
    return { success: false, error: "Failed to update promotion" }
  }
}

export async function deletePromotion(
  sectionId: string,
  filiereId: string,
  promotionIndex: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sectionId || sectionId.length !== 24) {
      return { success: false, error: "Invalid section ID" }
    }

    if (!filiereId || filiereId.length !== 24) {
      return { success: false, error: "Invalid filiere ID" }
    }

    await connectDB()

    const section = await Section.findById(sectionId).lean()
    if (!section) {
      return { success: false, error: "Section not found" }
    }

    const filiere = section.filieres?.find(f => String(f._id || '') === filiereId)
    if (!filiere || !filiere.programmes) {
      return { success: false, error: "Filiere or programmes not found" }
    }

    // Remove the promotion at the given index
    const updatedProgrammes = filiere.programmes.filter((_, i) => i !== promotionIndex)

    const result = await Section.findByIdAndUpdate(
      sectionId,
      {
        $set: {
          "filieres.$[filiere].programmes": updatedProgrammes,
        },
      },
      {
        arrayFilters: [{ "filiere._id": new mongoose.Types.ObjectId(filiereId) }],
        returnDocument: "after",
      }
    ).lean()

    if (!result) {
      return { success: false, error: "Failed to delete promotion" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return { success: false, error: "Failed to delete promotion" }
  }
}

export async function updatePromotionById(
  promotionId: string,
  data: { niveau: string; designation: string; description: string }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" }
    }

    await connectDB()

    const section = await Section.findOne({ "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId) }).lean()
    if (!section) {
      return { success: false, error: "Promotion not found" }
    }

    // Find the filiere and promotion index
    let filiereIndex = -1
    let promotionIndex = -1
    
    for (let i = 0; i < section.filieres.length; i++) {
      const programmes = section.filieres[i].programmes || []
      const pIndex = programmes.findIndex(p => String(p._id || '') === promotionId)
      if (pIndex !== -1) {
        filiereIndex = i
        promotionIndex = pIndex
        break
      }
    }

    if (filiereIndex === -1 || promotionIndex === -1) {
      return { success: false, error: "Promotion not found in section" }
    }

    // Update the promotion
    const result = await Section.findByIdAndUpdate(
      section._id,
      {
        $set: {
          "filieres.$[filiere].programmes.$[programme].niveau": data.niveau,
          "filieres.$[filiere].programmes.$[programme].designation": data.designation,
          "filieres.$[filiere].programmes.$[programme].description": data.description.split(",").map(d => d.trim()),
        },
      },
      {
        arrayFilters: [
          { "filiere._id": section.filieres[filiereIndex]._id },
          { "programme._id": new mongoose.Types.ObjectId(promotionId) }
        ],
        returnDocument: "after",
      }
    ).lean()

    if (!result) {
      return { success: false, error: "Failed to update promotion" }
    }

    const plainResult = JSON.parse(JSON.stringify(result))
    return { success: true, data: plainResult }
  } catch (error) {
    console.error("Error updating promotion by id:", error)
    return { success: false, error: "Failed to update promotion" }
  }
}

export async function deletePromotionById(
  promotionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!promotionId || promotionId.length !== 24) {
      return { success: false, error: "Invalid promotion ID" }
    }

    await connectDB()

    // Find the section that contains this promotion
    const section = await Section.findOne({ "filieres.programmes._id": new mongoose.Types.ObjectId(promotionId) }).lean()
    if (!section) {
      return { success: false, error: "Promotion not found" }
    }

    // Find the filiere and promotion index
    let filiereIndex = -1
    let promotionIndex = -1
    
    for (let i = 0; i < section.filieres.length; i++) {
      const programmes = section.filieres[i].programmes || []
      const pIndex = programmes.findIndex(p => String(p._id || '') === promotionId)
      if (pIndex !== -1) {
        filiereIndex = i
        promotionIndex = pIndex
        break
      }
    }

    if (filiereIndex === -1 || promotionIndex === -1) {
      return { success: false, error: "Promotion not found in section" }
    }

    // Delete the promotion using array filters
    const result = await Section.findByIdAndUpdate(
      section._id,
      {
        $unset: {
          "filieres.$[filiere].programmes.$[programme]": 1
        }
      },
      {
        arrayFilters: [
          { "filiere._id": section.filieres[filiereIndex]._id },
          { "programme._id": new mongoose.Types.ObjectId(promotionId) }
        ]
      }
    )

    if (!result) {
      return { success: false, error: "Failed to delete promotion" }
    }

    // Remove null values from the array
    await Section.findByIdAndUpdate(
      section._id,
      {
        $pull: {
          "filieres.$[filiere].programmes": null
        }
      },
      {
        arrayFilters: [{ "filiere._id": section.filieres[filiereIndex]._id }]
      }
    )

    return { success: true }
  } catch (error) {
    console.error("Error deleting promotion by id:", error)
    return { success: false, error: "Failed to delete promotion" }
  }
}
