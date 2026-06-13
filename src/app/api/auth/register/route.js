import { connectDB } from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import Wallet from "@/models/Wallet";

export async function POST(req) {
  await connectDB();

  const { name, email, password } = await req.json();

  //  check existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return Response.json({
      success: false,
      message: "User already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  //  ADMIN LOGIC
  const isAdmin = email === "admin@gmail.com";

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: isAdmin ? "admin" : "user"   //  NEW
  });

  //  Create wallet automatically
  await Wallet.create({
    userId: user._id,
    balance: 0
  });

  return Response.json({
    success: true,
    message: "User registered successfully",
    user
  });
}