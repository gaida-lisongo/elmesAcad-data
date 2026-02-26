import { NextResponse, NextRequest } from "next/server";
import { verifyApp } from "@/lib/verifyApp";

export async function POST(request: NextRequest) {
  try {
    const data = await verifyApp();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error during verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
