import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduit extends Document {
  designation: string;
  anneeId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  description: string[];
  prix: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollement extends IProduit {
  matieres: {
    matiereId: mongoose.Types.ObjectId;
    date_epreuve: Date;
  }[];
  debut: Date;
  fin: Date;
}

export interface ISujet extends IProduit {
  date_debut: Date;
  date_fin: Date;
  criteres: {
    critere: String;
    description: String;
  }[];
}

export interface IStage extends IProduit {
  entreprises: {
    nom: String;
    adresse?: String;
    contact: String;
  }[];
  date_debut: Date;
  date_fin: Date;
}

export interface IDocumment extends IProduit {
  category: String;
  signatures: {
    userId: mongoose.Types.ObjectId;
    fonction: String;
  }[];
  slug: String;
}

export interface ICommande extends Document {
  etudiantId: mongoose.Types.ObjectId;
  phoneNumber: String;
  orderNumber: String;
  reference: String;
  status: "pending" | "paid" | "failed" | "ok";
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollementCommande extends ICommande {
  enrollementId: mongoose.Types.ObjectId;
}

const EnrollementCommandeSchema = new Schema<IEnrollementCommande>(
  {
    etudiantId: {
      type: Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
    enrollementId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollement",
      required: true,
    },
  },
  { timestamps: true },
);

export interface ISujetCommande extends ICommande {
  sujetId: mongoose.Types.ObjectId;
  travail?: String;
  note?: Number;
  protocole?: String;
}

const SujetCommandeSchema = new Schema<ISujetCommande>(
  {
    etudiantId: {
      type: Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
    sujetId: {
      type: Schema.Types.ObjectId,
      ref: "Sujet",
      required: true,
    },
    travail: {
      type: String,
    },
    note: {
      type: Number,
    },
    protocole: {
      type: String,
    },
  },
  { timestamps: true },
);

export interface IStageCommande extends ICommande {
  stageId: mongoose.Types.ObjectId;
  rapport?: String;
  entreprise?: {
    nom: String;
    adresse?: String;
    contact: String;
  };
  note?: Number;
  lettre_destinataire?: String;
  lettre_quality?: String;
  lettre_sexe?: String;
}

const StageCommandeSchema = new Schema<IStageCommande>(
  {
    etudiantId: {
      type: Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
    stageId: {
      type: Schema.Types.ObjectId,
      ref: "Stage",
      required: true,
    },
    rapport: {
      type: String,
    },
    entreprise: {
      nom: String,
      adresse: String,
      contact: String,
    },
    note: {
      type: Number,
    },
    lettre_destinataire: {
      type: String,
    },
    lettre_quality: {
      type: String,
    },
    lettre_sexe: {
      type: String,
    },
  },
  { timestamps: true },
);

export interface IDocumentCommande extends ICommande {
  docummentId: mongoose.Types.ObjectId;
  lieu_naissance?: String;
  date_naissance?: Date;
  nationalite?: String;
  sexe?: String;
  adresse?: String;
}

const DocumentCommandeSchema = new Schema<IDocumentCommande>(
  {
    etudiantId: {
      type: Schema.Types.ObjectId,
      ref: "Etudiant",
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
    docummentId: {
      type: Schema.Types.ObjectId,
      ref: "Documment",
      required: true,
    },
    lieu_naissance: {
      type: String,
    },
    date_naissance: {
      type: Date,
    },
    nationalite: {
      type: String,
    },
    sexe: {
      type: String,
    },
    adresse: {
      type: String,
    },
  },
  { timestamps: true },
);

const EnrollementSchema = new Schema<IEnrollement>(
  {
    designation: {
      type: String,
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    matieres: [
      {
        matiereId: {
          type: Schema.Types.ObjectId,
          ref: "Matiere",
          required: true,
        },
        date_epreuve: {
          type: Date,
          required: true,
        },
      },
    ],
    debut: {
      type: Date,
      required: true,
    },
    fin: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const SujetSchema = new Schema<ISujet>(
  {
    designation: {
      type: String,
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    date_debut: {
      type: Date,
      required: true,
    },
    date_fin: {
      type: Date,
      required: true,
    },
    criteres: [
      {
        critere: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const StageSchema = new Schema<IStage>(
  {
    designation: {
      type: String,
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    date_debut: {
      type: Date,
      required: true,
    },
    date_fin: {
      type: Date,
      required: true,
    },
    entreprises: [
      {
        nom: {
          type: String,
          required: true,
        },
        adresse: {
          type: String,
        },
        contact: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

const DocummentSchema = new Schema<IDocumment>(
  {
    designation: {
      type: String,
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: true,
    },
    signatures: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        fonction: {
          type: String,
          required: true,
        },
      },
    ],
    slug: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const Enrollement: Model<IEnrollement> =
  mongoose.models.Enrollement ||
  mongoose.model<IEnrollement>("Enrollement", EnrollementSchema);
const Sujet: Model<ISujet> =
  mongoose.models.Sujet || mongoose.model<ISujet>("Sujet", SujetSchema);
const Stage: Model<IStage> =
  mongoose.models.Stage || mongoose.model<IStage>("Stage", StageSchema);
const EnrollementCommande: Model<IEnrollementCommande> =
  mongoose.models.EnrollementCommande ||
  mongoose.model<IEnrollementCommande>(
    "EnrollementCommande",
    EnrollementCommandeSchema,
  );
const SujetCommande: Model<ISujetCommande> =
  mongoose.models.SujetCommande ||
  mongoose.model<ISujetCommande>("SujetCommande", SujetCommandeSchema);
const StageCommande: Model<IStageCommande> =
  mongoose.models.StageCommande ||
  mongoose.model<IStageCommande>("StageCommande", StageCommandeSchema);
const Documment: Model<IDocumment> =
  mongoose.models.Documment ||
  mongoose.model<IDocumment>("Documment", DocummentSchema);
const DocumentCommande: Model<IDocumentCommande> =
  mongoose.models.DocumentCommande ||
  mongoose.model<IDocumentCommande>("DocumentCommande", DocumentCommandeSchema);

export default {
  Enrollement,
  Sujet,
  Stage,
  EnrollementCommande,
  SujetCommande,
  StageCommande,
  Documment,
  DocumentCommande,
};

// Named exports for compatibility
export {
  Enrollement,
  Sujet,
  Stage,
  EnrollementCommande,
  SujetCommande,
  StageCommande,
  Documment,
  DocumentCommande,
};
