"use server";

import { connectDB } from "@/lib/mongoose";
import RecetteModels from "@/lib/models/Recette";
import mongoose from "mongoose";

const { Documment, DocumentCommande } = RecetteModels;

export interface CreateDocumentInput {
  designation: string;
  category: string;
  description: string[];
  prix: number;
  anneeId: string;
  promotionId: string;
  signatures: {
    userId: string;
    fonction: string;
  }[];
  slug: string;
}

export interface UpdateDocumentInput extends Partial<CreateDocumentInput> {
  _id: string;
}

// Create Document
export async function createDocument(data: CreateDocumentInput) {
  try {
    await connectDB();

    const document = await Documment.create({
      designation: data.designation,
      category: data.category,
      description: data.description,
      prix: data.prix,
      anneeId: new mongoose.Types.ObjectId(data.anneeId),
      promotionId: new mongoose.Types.ObjectId(data.promotionId),
      signatures: data.signatures.map((sig) => ({
        userId: new mongoose.Types.ObjectId(sig.userId),
        fonction: sig.fonction,
      })),
      slug: data.slug || data.designation.toLowerCase().replace(/\s+/g, "-"),
      isActive: true,
    });

    return {
      success: true,
      data: document.toObject(),
      message: "Document créé avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la création du document",
    };
  }
}

// Get Documents by Category
export async function getDocumentsByCategory(
  category: string,
  promotionId?: string,
  anneeId?: string,
) {
  try {
    await connectDB();

    const query: any = { category };

    if (promotionId) {
      query.promotionId = new mongoose.Types.ObjectId(promotionId);
    }

    if (anneeId) {
      query.anneeId = new mongoose.Types.ObjectId(anneeId);
    }

    const documents = await Documment.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: documents,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Update Document
export async function updateDocument(data: UpdateDocumentInput) {
  try {
    await connectDB();

    const { _id, ...updateData } = data;

    const document = await Documment.findByIdAndUpdate(_id, updateData, {
      new: true,
    });

    if (!document) {
      return {
        success: false,
        error: "Document non trouvé",
      };
    }

    return {
      success: true,
      data: document.toObject(),
      message: "Document modifié avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la modification du document",
    };
  }
}

// Delete Document
export async function deleteDocument(id: string) {
  try {
    await connectDB();

    const document = await Documment.findByIdAndDelete(id);

    if (!document) {
      return {
        success: false,
        error: "Document non trouvé",
      };
    }

    return {
      success: true,
      message: "Document supprimé avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la suppression du document",
    };
  }
}

// Get Commandes by Document
export async function getCommandesByDocument(documentId: string) {
  try {
    await connectDB();

    const commandes = await DocumentCommande.find({
      docummentId: new mongoose.Types.ObjectId(documentId),
    })
      .populate("etudiantId", "nomComplet email matricule")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: commandes,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Create/Update Commande
export async function createOrUpdateCommande(data: {
  etudiantId: string;
  docummentId: string;
  phoneNumber: string;
  orderNumber?: string;
  reference?: string;
  status?: "pending" | "paid" | "failed" | "ok";
}) {
  try {
    await connectDB();

    const orderNumber =
      data.orderNumber ||
      `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reference =
      data.reference ||
      `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const existingCommande = await DocumentCommande.findOne({
      etudiantId: new mongoose.Types.ObjectId(data.etudiantId),
      docummentId: new mongoose.Types.ObjectId(data.docummentId),
    });

    if (existingCommande) {
      const updated = await DocumentCommande.findByIdAndUpdate(
        existingCommande._id,
        {
          phoneNumber: data.phoneNumber,
          status: data.status || existingCommande.status,
        },
        { new: true },
      );

      return {
        success: true,
        data: updated.toObject(),
        message: "Commande modifiée avec succès",
      };
    }

    const commande = await DocumentCommande.create({
      etudiantId: new mongoose.Types.ObjectId(data.etudiantId),
      docummentId: new mongoose.Types.ObjectId(data.docummentId),
      phoneNumber: data.phoneNumber,
      orderNumber,
      reference,
      status: data.status || "pending",
    });

    return {
      success: true,
      data: commande.toObject(),
      message: "Commande créée avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la création de la commande",
    };
  }
}

// Delete Commande
export async function deleteCommande(id: string) {
  try {
    await connectDB();

    const commande = await DocumentCommande.findByIdAndDelete(id);

    if (!commande) {
      return {
        success: false,
        error: "Commande non trouvée",
      };
    }

    return {
      success: true,
      message: "Commande supprimée avec succès",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de la suppression de la commande",
    };
  }
}

// Import Commandes from CSV
export async function importCommandesFromCSV(
  csvData: string,
  docummentId: string,
) {
  try {
    await connectDB();

    const lines = csvData.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const commandes = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length < 2) continue; // Skip empty lines

      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });

      if (obj.etudiantid && obj.phonenumber) {
        const orderNumber = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const reference = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        commandes.push({
          etudiantId: new mongoose.Types.ObjectId(obj.etudiantid),
          docummentId: new mongoose.Types.ObjectId(docummentId),
          phoneNumber: obj.phonenumber,
          orderNumber,
          reference,
          status: obj.status || "pending",
        });
      }
    }

    if (commandes.length === 0) {
      return {
        success: false,
        error: "Aucune commande valide trouvée dans le CSV",
      };
    }

    const result = await DocumentCommande.insertMany(commandes, {
      ordered: false,
    }).catch((error) => {
      // Continue on duplicate key errors
      return error.insertedDocs || [];
    });

    return {
      success: true,
      data: result,
      message: `${commandes.length} commandes importées avec succès`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: "Erreur lors de l'import du CSV",
    };
  }
}

// Get Documents with Commandes count
export async function getDocumentsWithComandesCount(
  category: string,
  promotionId?: string,
  anneeId?: string,
) {
  try {
    await connectDB();

    const query: any = { category };

    if (promotionId) {
      query.promotionId = new mongoose.Types.ObjectId(promotionId);
    }

    if (anneeId) {
      query.anneeId = new mongoose.Types.ObjectId(anneeId);
    }

    const documents = await Documment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "documentcommandes",
          localField: "_id",
          foreignField: "docummentId",
          as: "commandes",
        },
      },
      {
        $addFields: {
          commandesCount: { $size: "$commandes" },
        },
      },
      {
        $project: {
          commandes: 0,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return {
      success: true,
      data: documents,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
