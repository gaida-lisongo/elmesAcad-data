import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICalendrier extends Document {
  photo?: string;
  from: String;
  to: String;
  title: String;
  description: String[];
  items?: String[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IEvenement extends Document {
  photo?: string;
  title: String;
  description: String[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalerie extends Document {
  photo: string;
  title: String;
  description: String[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnnee extends Document {
  debut: Date;
  fin: Date;
  isActive: boolean;
  calendrier: ICalendrier[];
  evenements: IEvenement[];
  galeries: IGalerie[];
  communiques: {
    title: String;
    concerne: String;
    date_created: Date;
    content: String[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISlogan extends Document {
  anneeId: mongoose.Types.ObjectId;
  photo?: string;
  designation: String;
  description: String[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IService extends Document {
  titre: String;
  description: String;
  contacts: {
    email: String;
    phone: String;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IStructure extends Document {
  anneeId: mongoose.Types.ObjectId;
  description: String;
  services: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam extends Document {
  anneeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
}

export interface IContact extends Document {
  anneeId: mongoose.Types.ObjectId;
  adresse: String;
  email: String;
  phone: String;
  createdAt: Date;
  updatedAt: Date;
}

const AnneeSchema = new Schema<IAnnee>(
  {
    debut: {
      type: Date,
      required: true,
    },
    fin: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    calendrier: [
      {
        photo: String,
        from: String,
        to: String,
        title: String,
        description: [String],
        items: [String],
      },
    ],
    evenements: [
      {
        photo: String,
        title: String,
        description: [String],
        date: Date,
      },
    ],
    galeries: [
      {
        photo: String,
        title: String,
        description: [String],
      },
    ],
    communiques: [
      {
        title: String,
        concerne: String,
        date_created: Date,
        content: [String],
      },
    ],
  },
  { timestamps: true },
);

const SloganSchema = new Schema<ISlogan>(
  {
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    photo: {
      type: String,
    },
    designation: {
      type: String,
      required: true,
    },
    description: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);

const ServiceSchema = new Schema<IService>(
  {
    titre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    contacts: {
      email: String,
      phone: String,
    },
  },
  { timestamps: true },
);

const StructureSchema = new Schema<IStructure>(
  {
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
  },
  { timestamps: true },
);

const TeamSchema = new Schema<ITeam>(
  {
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  { timestamps: true },
);

const ContactSchema = new Schema<IContact>(
  {
    anneeId: {
      type: Schema.Types.ObjectId,
      ref: "Annee",
      required: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Annee: Model<IAnnee> =
  mongoose.models.Annee || mongoose.model<IAnnee>("Annee", AnneeSchema);
export const Slogan: Model<ISlogan> =
  mongoose.models.Slogan || mongoose.model<ISlogan>("Slogan", SloganSchema);
export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);
export const Structure: Model<IStructure> =
  mongoose.models.Structure ||
  mongoose.model<IStructure>("Structure", StructureSchema);
export const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);
export const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
