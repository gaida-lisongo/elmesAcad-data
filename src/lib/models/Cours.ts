import mongoose, { Schema, Document, Model } from "mongoose";

export interface INote extends Document {
  elementId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  value: {
    cc: Number;
    examen: Number;
    rattrapage: Number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IResultat extends Document {
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  status: "published" | "unpublished";
  amount: Number;
  category: "semestre" | "annee";
  currency: String;
  createdAt: Date;
  updatedAt: Date;
}

const ResultatSchema = new Schema<IResultat>(
  {
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: {
      type: mongoose.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "unpublished",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["semestre", "annee"],
      required: true,
    },
  },
  { timestamps: true },
);

export interface ISubscribeResultat extends Document {
  resultatId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: "pending" | "paid" | "failed" | "ok";
  recours?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SubscribeResultatSchema = new Schema<ISubscribeResultat>(
  {
    resultatId: {
      type: mongoose.Types.ObjectId,
      ref: "Resultat",
      required: true,
    },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
    recours: [{ type: mongoose.Types.ObjectId, ref: "Recours" }],
  },
  { timestamps: true },
);

const NoteSchema = new Schema<INote>(
  {
    elementId: {
      type: mongoose.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: { type: mongoose.Types.ObjectId, ref: "Annee" },
    value: {
      cc: { type: Number },
      examen: { type: Number },
      rattrapage: { type: Number },
    },
  },
  { timestamps: true },
);

export interface IActivity extends Document {
  titulaireId: mongoose.Types.ObjectId;
  elementId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  designation: String;
  description: String[];
  type: String;
  currency: String;
  status: "pending" | "completed" | "failed";
  amount: Number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQCMActivity extends IActivity {
  questions: {
    question: String;
    options: String[];
    correctOptionIndex: Number;
  }[];
  maxPts: Number;
}

const QCMActivitySchema = new Schema<IQCMActivity>(
  {
    titulaireId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    elementId: {
      type: Schema.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
    },
    type: {
      type: String,
      enum: ["qcm", "questionnaire", "ressource"],
      required: true,
    },
    currency: {
      type: String,
    },
    amount: {
      type: Number,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOptionIndex: { type: Number, required: true },
      },
    ],
    maxPts: {
      type: Number,
    },
  },
  { timestamps: true },
);

export interface IQuestionnaireActivity extends IActivity {
  questions: {
    enonce: String;
    url?: String;
  }[];
  maxPts: Number;
}

const QuestionnaireActivitySchema = new Schema<IQuestionnaireActivity>(
  {
    titulaireId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    elementId: {
      type: Schema.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
    },
    type: {
      type: String,
      enum: ["qcm", "questionnaire", "ressource"],
      required: true,
    },
    currency: {
      type: String,
    },
    amount: {
      type: Number,
    },
    questions: [
      {
        enonce: { type: String, required: true },
        url: { type: String },
      },
    ],
    maxPts: {
      type: Number,
    },
  },
  { timestamps: true },
);

export interface IRessourceActivity extends IActivity {
  url?: String;
  reference: String;
}

const RessourceActivitySchema = new Schema<IRessourceActivity>(
  {
    titulaireId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    elementId: {
      type: Schema.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
    },
    type: {
      type: String,
      enum: ["qcm", "questionnaire", "ressource"],
      required: true,
    },
    currency: {
      type: String,
    },
    amount: {
      type: Number,
    },
    url: {
      type: String,
    },
    reference: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export interface IRecours extends Document {
  studentId: mongoose.Types.ObjectId;
  elementId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  motif: String;
  description: String;
  preuveUrl?: String;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const RecoursSchema = new Schema<IRecours>(
  {
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    elementId: {
      type: mongoose.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: { type: mongoose.Types.ObjectId, ref: "Annee" },
    motif: { type: String, required: true },
    description: { type: String, required: true },
    preuveUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export interface IRetrait extends Document {
  elementId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  motif: String;
  currency: String;
  amount: Number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const RetraitSchema = new Schema<IRetrait>(
  {
    elementId: {
      type: mongoose.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: { type: mongoose.Types.ObjectId, ref: "Annee" },
    motif: { type: String, required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export interface ISeance extends Document {
  elementId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  designation: String;
  description: String[];
  coords: {
    latitude: String;
    longitude: String;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const SeanceSchema = new Schema<ISeance>(
  {
    elementId: {
      type: mongoose.Types.ObjectId,
      ref: "Element",
      required: true,
    },
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: { type: mongoose.Types.ObjectId, ref: "Annee" },
    designation: { type: String, required: true },
    description: { type: [String] },
    coords: {
      latitude: { type: String },
      longitude: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export interface IPresence extends Document {
  seanceId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  distance: Number;
  status: "present" | "absent" | "late";
  createdAt: Date;
  updatedAt: Date;
}

const PresenceSchema = new Schema<IPresence>(
  {
    seanceId: {
      type: mongoose.Types.ObjectId,
      ref: "Seance",
      required: true,
    },
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    distance: { type: Number },
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      required: true,
    },
  },
  { timestamps: true },
);

export interface ISubscribeCharge extends Document {
  studentId: mongoose.Types.ObjectId;
  promotionId: mongoose.Types.ObjectId;
  anneeId: mongoose.Types.ObjectId;
  activityId: mongoose.Types.ObjectId;
  category: String;
  status: "pending" | "paid" | "failed" | "ok";
  createdAt: Date;
  updatedAt: Date;
}

const SubscribeChargeSchema = new Schema<ISubscribeCharge>(
  {
    studentId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    promotionId: {
      type: mongoose.Types.ObjectId,
      ref: "Programme",
      required: true,
    },
    anneeId: { type: mongoose.Types.ObjectId, ref: "Annee" },
    activityId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    category: {
      type: String,
      enum: ["qcm", "questionnaire", "ressource", "seance", "recours"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "ok"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const Note =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
export const QCMActivity =
  mongoose.models.QCMActivity ||
  mongoose.model<IQCMActivity>("QCMActivity", QCMActivitySchema);
export const QuestionnaireActivity =
  mongoose.models.QuestionnaireActivity ||
  mongoose.model<IQuestionnaireActivity>(
    "QuestionnaireActivity",
    QuestionnaireActivitySchema,
  );
export const RessourceActivity =
  mongoose.models.RessourceActivity ||
  mongoose.model<IRessourceActivity>(
    "RessourceActivity",
    RessourceActivitySchema,
  );
export const Recours =
  mongoose.models.Recours || mongoose.model<IRecours>("Recours", RecoursSchema);
export const Retrait =
  mongoose.models.Retrait || mongoose.model<IRetrait>("Retrait", RetraitSchema);
export const Seance =
  mongoose.models.Seance || mongoose.model<ISeance>("Seance", SeanceSchema);
export const SubscribeCharge =
  mongoose.models.SubscribeCharge ||
  mongoose.model<ISubscribeCharge>("SubscribeCharge", SubscribeChargeSchema);
export const Presence =
  mongoose.models.Presence ||
  mongoose.model<IPresence>("Presence", PresenceSchema);
export const Resultat =
  mongoose.models.Resultat ||
  mongoose.model<IResultat>("Resultat", ResultatSchema);
export const SubscribeResultat =
  mongoose.models.SubscribeResultat ||
  mongoose.model<ISubscribeResultat>(
    "SubscribeResultat",
    SubscribeResultatSchema,
  );
