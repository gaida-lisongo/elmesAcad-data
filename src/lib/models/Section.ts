import mongoose, { Schema, Document, Model } from "mongoose";

export interface IElement extends Document {
  code: String;
  designation: String;
  credit: Number;
  objectifs: String[];
  place_ec: String;
  uniteId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  titulaireId: mongoose.Types.ObjectId;
  planning?: {
    chapitre: String;
    sections: String[];
  }[];
  mode_evaluation?: String[];
  mode_enseignement?: String[];
  penalites?: { faute: String; sanction: String }[];
  createdAt: Date;
  updatedAt: Date;
}

const ElementSchema = new Schema<IElement>(
  {
    code: {
      type: String,
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    objectifs: {
      type: [String],
      required: true,
    },
    place_ec: {
      type: String,
      required: true,
    },
    uniteId: {
      type: Schema.Types.ObjectId,
      ref: "Unite",
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    titulaireId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    planning: [
      {
        chapitre: String,
        sections: [String],
      },
    ],
    mode_evaluation: [String],
    mode_enseignement: [String],
    penalites: [
      {
        faute: String,
        sanction: String,
      },
    ],
  },
  { timestamps: true },
);

export interface IUnite extends Document {
  code: String;
  designation: String;
  description: String[];
  competences: String[];
  credit: Number;
  createdAt: Date;
  updatedAt: Date;
}

const UniteSchema = new Schema<IUnite>(
  {
    code: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    competences: {
      type: [String],
      required: true,
    },
    credit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export interface IProgramme extends Document {
  niveau: String;
  designation: String;
  description: String[];
  semestres?: {
    designation: String;
    credit: Number;
    unites: IUnite[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgrammeSchema = new Schema<IProgramme>(
  {
    niveau: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
    semestres: [
      {
        designation: String,
        credit: Number,
        unites: [UniteSchema],
      },
    ],
  },
  { timestamps: true },
);

export interface ISection extends Document {
  mention: String;
  designation: String;
  mission: String;
  promesses: String[];
  filieres?: {
    sigle: String;
    designation: String;
    description: String[];
    programmes?: IProgramme[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
  {
    mention: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    mission: {
      type: String,
      required: true,
    },
    promesses: {
      type: [String],
      required: true,
    },
    filieres: [
      {
        sigle: String,
        designation: String,
        description: [String],
        programmes: [ProgrammeSchema],
      },
    ],
  },
  { timestamps: true },
);

export const Element: Model<IElement> =
  mongoose.models.Element || mongoose.model<IElement>("Element", ElementSchema);
export const Unite: Model<IUnite> =
  mongoose.models.Unite || mongoose.model<IUnite>("Unite", UniteSchema);
export const Programme: Model<IProgramme> =
  mongoose.models.Programme ||
  mongoose.model<IProgramme>("Programme", ProgrammeSchema);
export const Section: Model<ISection> =
  mongoose.models.Section || mongoose.model<ISection>("Section", SectionSchema);
