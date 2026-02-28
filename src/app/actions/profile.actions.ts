"use server";

import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import crypto from "crypto";

export async function fetchUserById(
  userId: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();
    const user = await User.findById(userId).select("-passwordHash").lean();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const plainUser = JSON.parse(JSON.stringify(user));
    return { success: true, data: plainUser };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<{
    nomComplet: string;
    email: string;
    telephone: string;
    adresse: string;
    fonction: string;
    photo: string;
  }>,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await connectDB();

    const updateData: any = {};
    if (data.nomComplet) updateData.nomComplet = data.nomComplet;
    if (data.email) updateData.email = data.email;
    if (data.telephone) updateData.telephone = data.telephone;
    if (data.adresse) updateData.adresse = data.adresse;
    if (data.fonction) updateData.fonction = data.fonction;
    if (data.photo) updateData.photo = data.photo;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: "after",
    })
      .select("-passwordHash")
      .lean();

    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }

    const plainUser = JSON.parse(JSON.stringify(updatedUser));
    return { success: true, data: plainUser };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();

    // Need to explicitly select passwordHash because it has select: false in schema
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Trim passwords to remove whitespace
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();

    // Verify current password - hash with trimmed password
    const currentPasswordHash = crypto
      .createHash("sha256")
      .update(trimmedCurrentPassword)
      .digest("hex");

    if (user.passwordHash !== currentPasswordHash) {
      return { success: false, error: "Le mot de passe actuel est incorrect" };
    }

    // Check if new password is different from current
    if (trimmedCurrentPassword === trimmedNewPassword) {
      return {
        success: false,
        error: "Le nouveau mot de passe doit être différent de l'actuel",
      };
    }

    // Update password with trimmed new password
    const newPasswordHash = crypto
      .createHash("sha256")
      .update(trimmedNewPassword)
      .digest("hex");

    user.passwordHash = newPasswordHash;
    await user.save();

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Impossible de changer le mot de passe" };
  }
}
