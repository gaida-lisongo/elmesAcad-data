"use server";

import { Team } from "@/lib/models/Annee";
import { connectDB } from "@/lib/mongoose";
import { revalidatePath } from "next/cache";

export async function fetchTeamByAnnee(anneeId: string) {
  try {
    await connectDB();
    const team = await Team.find({ anneeId })
      .populate("userId")
      .populate("serviceId")
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(team)),
    };
  } catch (error: any) {
    console.error("Error fetching team:", error);
    return { success: false, error: error.message };
  }
}

export async function createTeamMember(data: {
  anneeId: string;
  userId: string;
  serviceId: string;
}) {
  try {
    await connectDB();
    const member = await Team.create(data);

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(member)),
    };
  } catch (error: any) {
    console.error("Error creating team member:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamMember(
  id: string,
  data: {
    userId?: string;
    serviceId?: string;
  },
) {
  try {
    await connectDB();
    const member = await Team.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    )
      .populate("userId")
      .populate("serviceId");

    if (!member) {
      return { success: false, error: "Team member not found" };
    }

    revalidatePath("/about");
    return {
      success: true,
      data: JSON.parse(JSON.stringify(member)),
    };
  } catch (error: any) {
    console.error("Error updating team member:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await connectDB();
    await Team.findByIdAndDelete(id);

    revalidatePath("/about");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting team member:", error);
    return { success: false, error: error.message };
  }
}
