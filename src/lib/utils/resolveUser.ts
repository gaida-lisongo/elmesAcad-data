"use server";

import { connectDB } from "@/lib/mongoose";
import { User, Etudiant } from "@/lib/models/User";
import mongoose from "mongoose";

export interface ResolvedUser {
  userId: string; // ObjectId en string
  userType: "student" | "teacher"; // Type automatiquement détecté
  data: {
    nomComplet: string;
    email: string;
    matricule: string;
    fonction?: string; // Seulement pour teacher
  };
}

/**
 * Résout un matricule vers un ObjectId MongoDB
 * Détecte automatiquement s'il s'agit d'un étudiant ou d'un enseignant
 *
 * @param matricule - Le matricule à rechercher
 * @returns {ResolvedUser} - ObjectId, type et données de l'utilisateur
 * @throws Erreur si matricule non trouvé ou requis manquants
 */
export async function resolveMatriculeToUser(
  matricule: string,
): Promise<ResolvedUser> {
  if (!matricule || matricule.trim() === "") {
    throw new Error("Matricule requis");
  }

  await connectDB();

  const cleanMatricule = matricule.trim().toUpperCase();

  // 1. Chercher d'abord dans les enseignants (User)
  const teacher = await User.findOne({ matricule: cleanMatricule }).lean();
  if (teacher) {
    return {
      userId: (teacher._id as mongoose.Types.ObjectId).toString(),
      userType: "teacher",
      data: {
        nomComplet: teacher.nomComplet,
        email: teacher.email,
        matricule: teacher.matricule || "",
        fonction: teacher.fonction,
      },
    };
  }

  // 2. Chercher dans les étudiants (Etudiant)
  const student = await Etudiant.findOne({
    matricule: cleanMatricule,
  }).lean();
  if (student) {
    return {
      userId: (student._id as mongoose.Types.ObjectId).toString(),
      userType: "student",
      data: {
        nomComplet: student.nomComplet,
        email: student.email,
        matricule: student.matricule || "",
      },
    };
  }

  // 3. Matricule non trouvé
  throw new Error(
    `Utilisateur avec matricule "${matricule}" non trouvé (ni étudiant ni enseignant)`,
  );
}

/**
 * Résout plusieurs matricules en parallèle
 * Utile pour les opérations batch
 *
 * @param matricules - Tableau de matricules
 * @returns Tableau de ResolvedUser
 */
export async function resolveMultipleMatricules(
  matricules: string[],
): Promise<ResolvedUser[]> {
  return Promise.all(matricules.map((m) => resolveMatriculeToUser(m)));
}

/**
 * Crée une map matricule → ObjectId pour éviter les requêtes répétées
 * Utile pour les performancess
 *
 * @param matricules - Tableau de matricules
 * @returns Map<matricule, userId>
 */
export async function createMatriculeLookupMap(
  matricules: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();

  for (const m of matricules) {
    try {
      const resolved = await resolveMatriculeToUser(m);
      map.set(m, resolved.userId);
    } catch (error) {
      // Matricule non trouvé, continue
      console.warn(`Matricule ${m} non trouvé`);
    }
  }

  return map;
}

/**
 * Type helper : extrait juste l'ObjectId d'un matricule
 */
export async function getObjectIdFromMatricule(
  matricule: string,
): Promise<string> {
  const resolved = await resolveMatriculeToUser(matricule);
  return resolved.userId;
}

/**
 * Type helper : détecte juste le type sans ObjectId
 */
export async function detectUserType(
  matricule: string,
): Promise<"student" | "teacher"> {
  const resolved = await resolveMatriculeToUser(matricule);
  return resolved.userType;
}
