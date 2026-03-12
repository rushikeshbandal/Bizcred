import { connectDB } from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {

  await connectDB();

  const { name, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  return Response.json({
    message: "User registered successfully",
    user
  });
}