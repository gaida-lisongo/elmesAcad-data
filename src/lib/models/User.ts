import mongoose, { Schema, Document, Model, StringExpressionOperatorReturningArray } from "mongoose"

export interface IEtudiant extends Document {
  nomComplet: string
  email: string
  telephone?: string
  adresse?: string
  matricule?: string
  photo?: string
  grade: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

const EtudiantSchema = new Schema<IEtudiant>(
  {
    nomComplet: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    telephone: {
      type: String,
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    matricule: {
      type: String,
      unique: true,
      sparse: true, // permet null sans casser l'unicité
      trim: true,
    },
    photo: {
      type: String,
    },
    grade: {
      type: String,
      required: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // ne retourne pas le hash par défaut
    },

  }, {
    timestamps: true,
  }
)

export interface ISubscription extends Document {
  etudiant: mongoose.Types.ObjectId
  promotion: mongoose.Types.ObjectId
  annee: mongoose.Types.ObjectId
  isValid: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionSchema = new Schema<ISubscription>({
  etudiant: {
    type: Schema.Types.ObjectId,
    ref: "Etudiant",
    required: true,
  },
  promotion: {
    type: Schema.Types.ObjectId,
    ref: "Promotion",
    required: true,
  },
  annee: {
    type: Schema.Types.ObjectId,
    ref: "Annee",
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true})

export interface IUser extends IEtudiant {
  autorisations: string[]
  fonction?: string
}

const UserSchema = new Schema<IUser>(
  {
    nomComplet: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    telephone: {
      type: String,
      trim: true,
    },

    adresse: {
      type: String,
      trim: true,
    },

    matricule: {
      type: String,
      unique: true,
      sparse: true, // permet null sans casser l'unicité
      trim: true,
    },

    photo: {
      type: String,
    },

    autorisations: {
      type: [String],
      default: [],
    },

    grade: {
      type: String,
      required: true
    },

    fonction: {
      type: String,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // ne retourne pas le hash par défaut
    },
  },
  {
    timestamps: true,
  }
)

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export const Etudiant: Model<IEtudiant> =
  mongoose.models.Etudiant || mongoose.model<IEtudiant>("Etudiant", EtudiantSchema)

export const Subscription: Model<ISubscription> =
  (mongoose.models.Subscription as Model<ISubscription>) || mongoose.model<ISubscription>("Subscription", SubscriptionSchema)

