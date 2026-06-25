import { connectDB } from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      role: "user",
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "active") {
      return NextResponse.json({
        success: false,
        message: `Account is ${user.status}`,
      });
    }
console.log("Entered Password:", password);
console.log("Stored Hash:", user.password);


const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);

console.log("Password Match:", isPasswordCorrect);
if (!isPasswordCorrect) {
  return NextResponse.json({
    success: false,
    message: "Invalid password",
  });
}

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creditScore: user.creditScore,
        kycStatus: user.kyc?.status || "not_submitted",
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: "Something went wrong",
    });
  }
}