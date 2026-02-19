// lib/mongo-memory.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";

let mongoServer: MongoMemoryServer | null = null;

export async function startMongoMemoryServer() {
  if (mongoServer) return mongoServer;

  try {
    console.log("Starting MongoMemoryServer...");
    
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: "elmes_dev",
        dbPath: path.resolve("./mongodb-data"), // persistance ici
        port: 27017,
        launchTimeout: 60000, // Increase timeout to 60 seconds
      },
      binary: {
        downloadDir: path.resolve("./mongodb-binaries"),
        version: "6.0.12", // Use a specific stable version
        checkMD5: false, // Skip MD5 check to speed up on Windows
      },
    });

    console.log("MongoMemoryServer started at:", mongoServer.getUri());

    return mongoServer;
  } catch (error) {
    console.error("Failed to start MongoMemoryServer:", error);
    mongoServer = null;
    throw error;
  }
}

export async function stopMongoMemoryServer() {
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
    console.log("MongoMemoryServer stopped");
  }
}
