import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB as dbConnect } from "@/config/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PINCODE_REGEX = /^\d{6}$/;

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name, email, mobile, password, confirmPassword,
      dob, gender, address, city, state, pincode, pan, aadhaar,
    } = body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: "Please fill all required fields." }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }
    if (!MOBILE_REGEX.test(mobile)) {
      return NextResponse.json({ success: false, message: "Invalid mobile number." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return NextResponse.json({ success: false, message: "Invalid gender value." }, { status: 400 });
    }
    if (pincode && !PINCODE_REGEX.test(pincode)) {
      return NextResponse.json({ success: false, message: "Invalid pincode." }, { status: 400 });
    }

    let cleanPan = undefined;
    if (pan) {
      cleanPan = pan.trim().toUpperCase();
      if (!PAN_REGEX.test(cleanPan)) {
        return NextResponse.json({ success: false, message: "Invalid PAN format." }, { status: 400 });
      }
    }
    if (aadhaar && !AADHAAR_REGEX.test(aadhaar.trim())) {
      return NextResponse.json({ success: false, message: "Invalid Aadhaar number." }, { status: 400 });
    }
    if (dob) {
      const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 18) {
        return NextResponse.json({ success: false, message: "You must be at least 18 years old to register." }, { status: 400 });
      }
    }

    await dbConnect();

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Mobile number";
      return NextResponse.json({ success: false, message: `${field} already registered.` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password: hashedPassword,
      dob: dob || undefined,
      gender: gender || undefined,
      address: address?.trim(),
      city: city?.trim(),
      state: state?.trim(),
      pincode: pincode?.trim(),
      kyc: {
        pan: cleanPan,
        aadhaar: aadhaar?.trim(),
        status: "not_submitted",
      },
    });

    // ===== NEW: auto-create wallet for every new customer =====
    await Wallet.create({
      userId: user._id,
      balance: 0,
      currency: "INR",
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful.",
      userId: user._id,
    });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: "Email or mobile already registered." }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}