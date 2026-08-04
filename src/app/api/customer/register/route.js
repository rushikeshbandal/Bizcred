import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB as dbConnect } from "@/config/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { encryptAadhaar } from "@/lib/aadhaarCrypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_REGEX = /^\d{12}$/;
const PINCODE_REGEX = /^\d{6}$/;
const NAME_REGEX = /^[A-Za-z]+(?: [A-Za-z]+)*$/;

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name, email, mobile, password, confirmPassword,
      dob, gender, address, city, state, pincode, pan, aadhaar,
      termsAccepted,
    } = body;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      return NextResponse.json({ success: false, message: "Please fill all required fields." }, { status: 400 });
    }

    const cleanName = name.trim().replace(/\s+/g, " ");
    if (cleanName.length < 2 || cleanName.length > 50 || !NAME_REGEX.test(cleanName)) {
      return NextResponse.json(
        { success: false, message: "Name must contain only letters and spaces (2–50 characters)." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email address." }, { status: 400 });
    }

    const cleanMobile = mobile.trim();
    if (!/^\d+$/.test(cleanMobile) || !MOBILE_REGEX.test(cleanMobile)) {
      return NextResponse.json({ success: false, message: "Mobile number must be exactly 10 digits, starting with 6-9." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, message: "Passwords do not match." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    if (!gender || !["Male", "Female", "Other"].includes(gender)) {
      return NextResponse.json({ success: false, message: "Please select a gender." }, { status: 400 });
    }

    if (!dob) {
      return NextResponse.json({ success: false, message: "Date of birth is required." }, { status: 400 });
    }
    const age = (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) {
      return NextResponse.json({ success: false, message: "You must be at least 18 years old to register." }, { status: 400 });
    }

    // Address fields are now OPTIONAL at signup — only validate format
    // if the user actually filled something in.
    if (pincode && !PINCODE_REGEX.test(pincode)) {
      return NextResponse.json({ success: false, message: "Pincode must be 6 digits." }, { status: 400 });
    }

    if (!pan?.trim()) {
      return NextResponse.json({ success: false, message: "PAN number is required." }, { status: 400 });
    }
    const cleanPan = pan.trim().toUpperCase();
    if (!PAN_REGEX.test(cleanPan)) {
      return NextResponse.json({ success: false, message: "Invalid PAN format (e.g. ABCDE1234F)." }, { status: 400 });
    }

    if (!aadhaar?.trim()) {
      return NextResponse.json({ success: false, message: "Aadhaar number is required." }, { status: 400 });
    }
    const cleanAadhaar = aadhaar.trim();
    if (!AADHAAR_REGEX.test(cleanAadhaar)) {
      return NextResponse.json({ success: false, message: "Aadhaar must be exactly 12 digits." }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json({ success: false, message: "You must accept the Terms & Conditions to register." }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile: cleanMobile }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? "Email" : "Mobile number";
      return NextResponse.json({ success: false, message: `${field} already registered.` }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: email.toLowerCase().trim(),
      mobile: cleanMobile,
      password: hashedPassword,
      dob,
      gender,
      address: address?.trim() || undefined,
      city: city?.trim() || undefined,
      state: state?.trim() || undefined,
      pincode: pincode?.trim() || undefined,
      kyc: {
        pan: cleanPan,
        aadhaar: cleanAadhaar.slice(-4),
        aadhaarEncrypted: encryptAadhaar(cleanAadhaar),
        status: "not_submitted",
      },
    });

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