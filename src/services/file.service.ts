"use server";

const baseUrl = process.env.BASE_URL || "http://localhost:3000/api";
const apiKey = process.env.API_KEY || "default_api_key";
const aiSecret = process.env.SECRET_KEY || "default_secret_key";

export async function uploadImage(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log("Base URL for upload:", baseUrl);

    const req = await fetch(`${baseUrl}/cloudinary`, {
      method: "POST",
      body: formData,
    });

    if (!req.ok) {
      throw new Error("Failed to upload image");
    }

    const res = await req.json();

    console.log("Cloudinary response:", res);

    if (!res.success) {
      throw new Error(res.error || "Failed to upload image");
    }
    const { url } = res;
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadFichier(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("apiKey", apiKey);
    formData.append("apiSecret", aiSecret);

    console.log("Base URL for file upload:", baseUrl);
    console.log(
      "Uploading file:",
      file.name,
      "Size:",
      file.size,
      "Type:",
      file.type,
    );
    console.log("FormData keys:", Array.from(formData.keys()));
    console.log("API Key:", apiKey ? "Provided" : "Missing");
    console.log("API Secret:", aiSecret ? "Provided" : "Missing");
    const req = await fetch(`${baseUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!req.ok) {
      const errorData = await req.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Upload failed with status ${req.status}`,
      );
    }

    const res = await req.json();
    console.log("File upload response:", res);
    if (!res.success) {
      throw new Error(res.error || "Failed to upload file");
    }

    const { url } = res;
    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error instanceof Error ? error : new Error("Failed to upload file");
  }
}
