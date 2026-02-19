// lib/mongoose.ts
import mongoose from "mongoose";
import { startMongoMemoryServer } from "./mongo-memory";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const mongoServer = await startMongoMemoryServer();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    isConnected = true;
    console.log("Mongoose connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    isConnected = false;
    throw error;
  }
}
