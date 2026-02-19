"use server";

import { connectDB } from "@/lib/mongoose";
import { Etudiant } from "@/lib/models/User";
import crypto from "crypto";

export interface StudentType {
  _id: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  adresse?: string;
  matricule?: string;
  photo?: string;
  grade: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchStudents(): Promise<{ success: boolean; data?: StudentType[]; error?: string }> {
  try {
    await connectDB();
    const students = await Etudiant.find().select("-passwordHash").lean();
    const plainStudents = JSON.parse(JSON.stringify(students));
    return { success: true, data: plainStudents as StudentType[] };
  } catch (error) {
    console.error("Error fetching students:", error);
    return { success: false, error: "Failed to fetch students" };
  }
}

export async function fetchStudentById(id: string): Promise<{ success: boolean; data?: StudentType; error?: string }> {
  try {
    await connectDB();
    const student = await Etudiant.findById(id).select("-passwordHash").lean();
    if (!student) {
      return { success: false, error: "Student not found" };
    }
    const plainStudent = JSON.parse(JSON.stringify(student));
    return { success: true, data: plainStudent as StudentType };
  } catch (error) {
    console.error("Error fetching student:", error);
    return { success: false, error: "Failed to fetch student" };
  }
}

export async function createStudent(data: {
  nomComplet: string;
  email: string;
  telephone?: string;
  adresse?: string;
  matricule?: string;
  photo?: string;
  grade: string;
  password: string;
}): Promise<{ success: boolean; data?: StudentType; error?: string }> {
  try {
    await connectDB();

    if (!data.nomComplet || !data.email || !data.grade || !data.password) {
      return { success: false, error: "Required fields are missing" };
    }

    // Check if email already exists
    const existingStudent = await Etudiant.findOne({ email: data.email });
    if (existingStudent) {
      return { success: false, error: "Email already exists" };
    }

    // Check if matricule already exists (if provided)
    if (data.matricule) {
      const existingMatricule = await Etudiant.findOne({ matricule: data.matricule });
      if (existingMatricule) {
        return { success: false, error: "Matricule already exists" };
      }
    }

    const newStudent = await Etudiant.create({
      nomComplet: data.nomComplet,
      email: data.email,
      telephone: data.telephone,
      adresse: data.adresse,
      matricule: data.matricule,
      photo: data.photo,
      grade: data.grade,
      passwordHash: crypto.createHash("sha256").update(data.password).digest("hex"),
    });

    const plainStudent = JSON.parse(JSON.stringify(newStudent));
    return { success: true, data: plainStudent as StudentType };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: "Failed to create student" };
  }
}

export async function updateStudent(
  id: string,
  updateData: Partial<{
    nomComplet: string;
    email: string;
    telephone: string;
    adresse: string;
    matricule: string;
    photo: string;
    grade: string;
    password: string;
  }>
): Promise<{ success: boolean; data?: StudentType; error?: string }> {
  try {
    await connectDB();

    const dataToUpdate: any = {};
    if (updateData.nomComplet) dataToUpdate.nomComplet = updateData.nomComplet;
    if (updateData.email) dataToUpdate.email = updateData.email;
    if (updateData.telephone !== undefined) dataToUpdate.telephone = updateData.telephone;
    if (updateData.adresse !== undefined) dataToUpdate.adresse = updateData.adresse;
    if (updateData.matricule !== undefined) dataToUpdate.matricule = updateData.matricule;
    if (updateData.photo !== undefined) dataToUpdate.photo = updateData.photo;
    if (updateData.grade) dataToUpdate.grade = updateData.grade;
    if (updateData.password) {
      dataToUpdate.passwordHash = crypto.createHash("sha256").update(updateData.password).digest("hex");
    }

    const updatedStudent = await Etudiant.findByIdAndUpdate(
      id,
      dataToUpdate,
      { returnDocument: 'after' }
    ).select("-passwordHash").lean();

    if (!updatedStudent) {
      return { success: false, error: "Student not found" };
    }

    const plainStudent = JSON.parse(JSON.stringify(updatedStudent));
    return { success: true, data: plainStudent as StudentType };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: "Failed to update student" };
  }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB();
    const deletedStudent = await Etudiant.findByIdAndDelete(id);

    if (!deletedStudent) {
      return { success: false, error: "Student not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting student:", error);
    return { success: false, error: "Failed to delete student" };
  }
}

export async function createStudentsFromCSV(
  csvData: Array<{
    nomComplet: string;
    email: string;
    telephone?: string;
    adresse?: string;
    matricule?: string;
    grade: string;
    password: string;
  }>
): Promise<{ success: boolean; data?: { created: number; errors: string[] }; error?: string }> {
  try {
    await connectDB();

    const errors: string[] = [];
    let created = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        // Validate required fields
        if (!row.nomComplet || !row.email || !row.grade || !row.password) {
          errors.push(`Ligne ${i + 1}: Champs requis manquants`);
          continue;
        }

        // Check if email already exists
        const existingStudent = await Etudiant.findOne({ email: row.email });
        if (existingStudent) {
          errors.push(`Ligne ${i + 1}: Email ${row.email} existe déjà`);
          continue;
        }

        // Check if matricule already exists (if provided)
        if (row.matricule) {
          const existingMatricule = await Etudiant.findOne({ matricule: row.matricule });
          if (existingMatricule) {
            errors.push(`Ligne ${i + 1}: Matricule ${row.matricule} existe déjà`);
            continue;
          }
        }

        await Etudiant.create({
          nomComplet: row.nomComplet,
          email: row.email,
          telephone: row.telephone,
          adresse: row.adresse,
          matricule: row.matricule,
          grade: row.grade,
          passwordHash: crypto.createHash("sha256").update(row.password).digest("hex"),
        });

        created++;
      } catch (err) {
        errors.push(`Ligne ${i + 1}: Erreur lors de la création`);
      }
    }

    return { 
      success: true, 
      data: { created, errors } 
    };
  } catch (error) {
    console.error("Error creating students from CSV:", error);
    return { success: false, error: "Failed to process CSV data" };
  }
}
