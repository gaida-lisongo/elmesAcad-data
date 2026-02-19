// lib/mongoose.ts
import mongoose from "mongoose";
import { startMongoMemoryServer } from "./mongo-memory";

let currentUri: string | null = null;

export async function connectDB() {
  // Check if already connected to the same URI
  if (mongoose.connection.readyState === 1 && currentUri) {
    return;
  }

  try {
    const mongoServer = await startMongoMemoryServer();
    const uri = mongoServer.getUri();

    // If connected to a different URI, disconnect first
    if (currentUri && currentUri !== uri) {
      await mongoose.disconnect();
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      currentUri = uri;
      console.log("Mongoose connected successfully");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    currentUri = null;
    throw error;
  }
}
