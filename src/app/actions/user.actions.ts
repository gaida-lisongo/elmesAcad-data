"use server";

import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";

export async function fetchUsers() {
  try {
    await connectDB();
    const users = await User.find().select("-passwordHash");
    return { success: true, data: users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
