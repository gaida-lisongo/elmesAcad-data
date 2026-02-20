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

const Enrollement: Model<IEnrollement> =
  mongoose.models.Enrollement ||
  mongoose.model<IEnrollement>("Enrollement", EnrollementSchema);
const Sujet: Model<ISujet> =
  mongoose.models.Sujet || mongoose.model<ISujet>("Sujet", SujetSchema);
const Stage: Model<IStage> =
  mongoose.models.Stage || mongoose.model<IStage>("Stage", StageSchema);

export default {
  Enrollement,
  Sujet,
  Stage,
};
