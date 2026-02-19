import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";

export const verifyToken = (token: string) => {
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET || "secret");
        return decoded;
    } catch (error) {
        return null;
    }
}


//Login a user
export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { matricule, password } = await request.json();
        console.log("Received login request for matricule:", matricule);
        console.log("Received login request for password:", password);
        if (!matricule || !password) {
            return NextResponse.json({ error: "Matricule and password are required" }, { status: 400 });
        }

        const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
        console.log("Generated password hash:", passwordHash);

        const user = await User.findOne({ matricule}).select("+passwordHash");
        console.log("User found:", user);
        if (!user) {
            return NextResponse.json({ error: "Invalid matricule or password" }, { status: 401 });
        }

        const token = jsonwebtoken.sign({ userId: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        return NextResponse.json({ user, token }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}