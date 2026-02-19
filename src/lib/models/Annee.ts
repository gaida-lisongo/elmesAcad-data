import mongoose, { Schema, Document, Model } from "mongoose"

export interface ICalendrier extends Document {
    photo?: string
    from: String
    to: String
    title: String
    description: String[]
    items?: String[]
    createdAt: Date
    updatedAt: Date
}

export interface IEvenement extends Document {
    photo?: string
    title: String
    description: String[]
    date: Date
    createdAt: Date
    updatedAt: Date
}

export interface IGalerie extends Document {
    photo: string
    title: String
    description: String[]
    createdAt: Date
    updatedAt: Date
}

export interface IAnnee extends Document {
    debut: Date
    fin: Date
    isActive: boolean
    calendrier: ICalendrier[]
    evenements: IEvenement[]
    galeries: IGalerie[]
    communiques: {
        title: String
        concerne: String
        date_created: Date
        content: String[]
    }[]
    createdAt: Date
    updatedAt: Date
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
    { timestamps: true }
)

export const Annee: Model<IAnnee> = mongoose.models.Annee || mongoose.model<IAnnee>("Annee", AnneeSchema)