"use server";

import { connectDB } from "@/lib/mongoose";
import { Message } from "@/lib/models/Annee";
import { revalidatePath } from "next/cache";

export async function createMessage(data: {
  contactId: string;
  from: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
  };
  content: string;
}) {
  try {
    await connectDB();
    const message = await Message.create({
      contactId: data.contactId,
      from: data.from,
      content: data.content,
      isRead: false,
    });
    revalidatePath("/contact");
    return JSON.parse(JSON.stringify(message));
  } catch (error) {
    console.error("Erreur lors de la création du message:", error);
    throw new Error("Échec de l'envoi du message");
  }
}

export async function fetchMessages(contactId: string) {
  try {
    await connectDB();
    const messages = await Message.find({ contactId })
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(messages));
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    return [];
  }
}

export async function markMessageAsRead(messageId: string) {
  try {
    await connectDB();
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true },
    ).lean();
    revalidatePath("/contact");
    return JSON.parse(JSON.stringify(message));
  } catch (error) {
    console.error("Erreur lors de la mise à jour du message:", error);
    throw new Error("Échec de la mise à jour du message");
  }
}
