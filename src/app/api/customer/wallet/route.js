import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ success: false, message: "Invalid Token" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let wallet = await Wallet.findOne({ userId: decoded.id });

    // Safety net: if an older account never got a wallet, create one now
    if (!wallet) {
      wallet = await Wallet.create({
        userId: decoded.id,
        balance: 0,
        currency: "INR",
        status: "active",
      });
    }

    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json({ success: false, message: "Invalid Token" }, { status: 401 });
  }
}