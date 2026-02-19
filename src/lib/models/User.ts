import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  nomComplet: string
  email: string
  telephone?: string
  adresse?: string
  matricule?: string
  photo?: string
  autorisations: string[]
  grade: string
  fonction?: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
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
