import { connectDB } from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import Wallet from "@/models/Wallet";

export async function POST(req) {

  await connectDB();

  const { name, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  // ✅ Create wallet automatically
  await Wallet.create({
    userId: user._id
  });

  return Response.json({
    message: "User registered successfully",
    user
  });
}