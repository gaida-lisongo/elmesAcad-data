import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import crypto from "crypto";


//Create a new user
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const { name, adresse, matricule, grade, fonction, email, password } = await request.json();

        // Validation des champs requis
        if (!name || !email || !password || !grade) {
            return NextResponse.json({ error: "Name, email, password and grade are required" }, { status: 400 });
        }

        //Crypto du mot de passe avec sha256
        const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

        const newUser = new User({
            nomComplet: name,
            email,
            adresse,
            matricule,
            grade,
            fonction,
            passwordHash, // Note: In production, hash the password before saving
        });
        await newUser.save();
        return NextResponse.json(JSON.parse(JSON.stringify(newUser)), { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

//Read all users
export async function GET() {
    try {
        await connectDB();
        const users = await User.find().select("-passwordHash").lean(); // Exclude password hash
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

//Update a user
export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const { id, name, adresse, matricule, grade, fonction, email, password } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        const updateData: any = {};
        if (name) updateData.nomComplet = name;
        if (email) updateData.email = email;
        if (adresse) updateData.adresse = adresse;
        if (matricule) updateData.matricule = matricule;
        if (grade) updateData.grade = grade;
        if (fonction) updateData.fonction = fonction;
        if (password) {
            updateData.passwordHash = crypto.createHash("sha256").update(password).digest("hex");
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).select("-passwordHash").lean();
        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

//Delete a user
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id).select("-passwordHash").lean();
        if (!deletedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(deletedUser, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}