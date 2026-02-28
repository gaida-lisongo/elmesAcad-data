"use server";

import { Service } from "@/lib/models/Annee";
import { connectDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

export async function fetchServices() {
  try {
    await connectDB();
    const services = await Service.find({}).lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(services)),
    };
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchServiceById(id: string) {
  try {
    await connectDB();
    const service = await Service.findById(id).lean();

    return {
      success: true,
      data: service ? JSON.parse(JSON.stringify(service)) : null,
    };
  } catch (error: any) {
    console.error("Error fetching service:", error);
    return { success: false, error: error.message };
  }
}

export async function createService(data: {
  titre: string;
  description: string;
  contacts: {
    email: string;
    phone: string;
  };
}) {
  try {
    await connectDB();
    const service = await Service.create(data);

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(service)),
    };
  } catch (error: any) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message };
  }
}

export async function updateService(
  id: string,
  data: {
    titre?: string;
    description?: string;
    contacts?: {
      email: string;
      phone: string;
    };
  },
) {
  try {
    await connectDB();
    const service = await Service.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );

    if (!service) {
      return { success: false, error: "Service not found" };
    }

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(service)),
    };
  } catch (error: any) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteService(id: string) {
  try {
    await connectDB();
    await Service.findByIdAndDelete(id);

    revalidatePath("/about");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message };
  }
}
