"use server";

import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { UserType } from "@/app/types/mentor";
import crypto from "crypto";

export async function fetchUsers(): Promise<{ success: boolean; data?: UserType[]; error?: string }> {
  try {
    await connectDB();
    const users = await User.find().select("-passwordHash").lean();
    // Convert all MongoDB types to plain JS objects
    const plainUsers = JSON.parse(JSON.stringify(users));
    return { success: true, data: plainUsers as UserType[] };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserPermissions(userId: string, autorisations: string[]): Promise<{ success: boolean; data?: UserType; error?: string }> {
  try {
    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { autorisations },
      { returnDocument: 'after' }
    ).select("-passwordHash").lean();
    
    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }
    
    // Convert all MongoDB types to plain JS objects
    const plainUser = JSON.parse(JSON.stringify(updatedUser));
    return { success: true, data: plainUser as UserType };
  } catch (error) {
    console.error("Error updating permissions:", error);
    return { success: false, error: "Failed to update permissions" };
  }
}

export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return { success: false, error: "User not found" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function updateUser(
  userId: string,
  updateData: Partial<{
    nomComplet: string;
    email: string;
    telephone: string;
    adresse: string;
    matricule: string;
    grade: string;
    fonction: string;
    password: string;
  }>
): Promise<{ success: boolean; data?: UserType; error?: string }> {
  try {
    await connectDB();
    
    const dataToUpdate: any = {};
    if (updateData.nomComplet) dataToUpdate.nomComplet = updateData.nomComplet;
    if (updateData.email) dataToUpdate.email = updateData.email;
    if (updateData.telephone) dataToUpdate.telephone = updateData.telephone;
    if (updateData.adresse) dataToUpdate.adresse = updateData.adresse;
    if (updateData.matricule) dataToUpdate.matricule = updateData.matricule;
    if (updateData.grade) dataToUpdate.grade = updateData.grade;
    if (updateData.fonction) dataToUpdate.fonction = updateData.fonction;
    if (updateData.password) {
      dataToUpdate.passwordHash = crypto.createHash("sha256").update(updateData.password).digest("hex");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      dataToUpdate,
      { returnDocument: 'after' }
    ).select("-passwordHash").lean();
    
    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }
    
    // Convert all MongoDB types to plain JS objects
    const plainUser = JSON.parse(JSON.stringify(updatedUser));
    return { success: true, data: plainUser as UserType };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

