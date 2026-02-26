// lib/mongoose.ts
import mongoose from "mongoose";
import { startMongoMemoryServer } from "./mongo-memory";

// Promise singleton — all concurrent callers share the same connection attempt.
// This prevents "Maximum call stack size exceeded" caused by parallel calls
// (e.g. fetchSections + fetchAnneeActive) both racing to connect.
let connectionPromise: Promise<void> | null = null;

async function _connect(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  let uri: string;

  if (process.env.MONGODB_URI) {
    uri = process.env.MONGODB_URI;
  } else {
    const mongoServer = await startMongoMemoryServer();
    uri = mongoServer.getUri();
    console.log("MongoMemoryServer started at:", uri);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });

  console.log("Mongoose connected successfully");
}

export async function connectDB(): Promise<void> {
  // Fast path — already connected
  if (mongoose.connection.readyState === 1) return;

  // Reuse the in-flight promise so concurrent callers don't race
  if (!connectionPromise) {
    connectionPromise = _connect().catch((error) => {
      connectionPromise = null; // allow retry on next call
      console.error("Database connection failed:", error);
      throw error;
    });
  }

  return connectionPromise;
}
