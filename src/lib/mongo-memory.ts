// lib/mongo-memory.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";

let mongoServer: MongoMemoryServer | null = null;
let lastUri: string | null = null;

export async function startMongoMemoryServer() {
  if (mongoServer) {
    // Check if the server is actually running
    try {
      const uri = mongoServer.getUri();
      if (uri === lastUri) {
        return mongoServer;
      }
      // URI changed, stop and restart
      await mongoServer.stop().catch(() => {});
      mongoServer = null;
    } catch {
      mongoServer = null;
    }
  }

  try {
    console.log("Starting MongoMemoryServer...");
    
    mongoServer = await MongoMemoryServer.create({
      instance: {
        dbName: "elmes_dev",
        launchTimeout: 60000,
      },
      binary: {
        downloadDir: path.resolve("./mongodb-binaries"),
        version: "6.0.12",
        checkMD5: false,
      },
    });

    lastUri = mongoServer.getUri();
    console.log("MongoMemoryServer started at:", lastUri);

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
