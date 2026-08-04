import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ success: false, message: "Email and password are required." });
    }

    const admin = await User.findOne({ email: email.toLowerCase().trim(), role: "admin" });

    if (!admin) {
      return Response.json({ success: false, message: "Invalid admin credentials" });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return Response.json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return Response.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, message: error.message });
  }
}