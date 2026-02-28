"use server";

import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/lib/models/Annee";
import { revalidatePath } from "next/cache";

export async function fetchContactByAnnee(anneeId: string) {
  try {
    await connectDB();
    const contact = await Contact.findOne({ anneeId }).lean();
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error("Erreur lors de la récupération du contact:", error);
    return null;
  }
}

export async function createContact(data: {
  anneeId: string;
  adresse: string;
  email: string;
  phone: string;
}) {
  try {
    await connectDB();
    const contact = await Contact.create(data);
    revalidatePath("/contact");
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error("Erreur lors de la création du contact:", error);
    throw new Error("Échec de la création du contact");
  }
}

export async function updateContact(
  contactId: string,
  data: {
    adresse?: string;
    email?: string;
    phone?: string;
  },
) {
  try {
    await connectDB();
    const contact = await Contact.findByIdAndUpdate(contactId, data, {
      new: true,
    }).lean();
    revalidatePath("/contact");
    return JSON.parse(JSON.stringify(contact));
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contact:", error);
    throw new Error("Échec de la mise à jour du contact");
  }
}

export async function deleteContact(contactId: string) {
  try {
    await connectDB();
    await Contact.findByIdAndDelete(contactId);
    revalidatePath("/contact");
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la suppression du contact:", error);
    throw new Error("Échec de la suppression du contact");
  }
}
