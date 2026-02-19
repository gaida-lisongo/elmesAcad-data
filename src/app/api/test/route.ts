// app/api/test/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";

export async function GET() {
  await connectDB();

  return NextResponse.json({ message: "Mongo connecté en local" });
}
