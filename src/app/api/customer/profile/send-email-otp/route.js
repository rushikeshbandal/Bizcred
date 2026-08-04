import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import { sendOtpEmail } from "@/config/mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const { newEmail } = await req.json();

    if (!newEmail || !EMAIL_REGEX.test(newEmail.trim())) {
      return NextResponse.json({ success: false, message: "Enter a valid email address." }, { status: 400 });
    }

    const cleanEmail = newEmail.trim().toLowerCase();

    if (cleanEmail === user.email) {
      return NextResponse.json({ success: false, message: "This is already your current email." }, { status: 400 });
    }

    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
    if (existing) {
      return NextResponse.json({ success: false, message: "This email is already in use." }, { status: 409 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Keyed by the user's CURRENT (still-verified) email — new email lives in newEmail field
    await OtpVerification.findOneAndUpdate(
      { email: user.email, purpose: "email_change" },
      {
        email: user.email,
        otp,
        purpose: "email_change",
        newEmail: cleanEmail,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    try {
      await sendOtpEmail(cleanEmail, otp); // sent to the NEW address to prove ownership
    } catch (mailErr) {
      console.log("Email-change OTP send error:", mailErr.message);
      return NextResponse.json({ success: false, message: "Failed to send OTP email. Try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent to your new email address.",
      currentEmail: user.email, // frontend needs this to call verify-otp correctly
    });
  } catch (err) {
    console.error("Send email-change OTP error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}