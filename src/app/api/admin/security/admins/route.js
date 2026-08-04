import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const admins = await User.find({ role: "admin" }).select("name email createdAt");

    return Response.json({ success: true, admins });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return Response.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return Response.json({ success: false, message: "This email is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: "0000000000" + Math.floor(Math.random() * 1000), // adjust if you collect a real mobile
      password: hashedPassword,
      role: "admin",
      status: "active",
    });

    return Response.json({ success: true, message: "Admin account created." });
  } catch (error) {
    console.error("Create admin error:", error);
    return Response.json({ success: false, message: error.message || "Something went wrong." }, { status: 500 });
  }
}