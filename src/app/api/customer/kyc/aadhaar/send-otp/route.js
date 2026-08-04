import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { generateAadhaarOtp } from "@/lib/sandbox";

const AADHAAR_REGEX = /^\d{12}$/;

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { aadhaarNumber } = await req.json();

    if (!aadhaarNumber || !AADHAAR_REGEX.test(aadhaarNumber.trim())) {
      return NextResponse.json({ success: false, message: "Enter a valid 12-digit Aadhaar number." }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if (user.kyc?.aadhaarVerified) {
      return NextResponse.json({ success: false, message: "Aadhaar is already verified." }, { status: 400 });
    }

    const { ok, data } = await generateAadhaarOtp(aadhaarNumber.trim());

    if (!ok || !data?.data?.reference_id) {
      return NextResponse.json(
        { success: false, message: data?.message || "Failed to send OTP. Please check the Aadhaar number and try again." },
        { status: 400 }
      );
    }

    user.kyc.aadhaarRefId = String(data.data.reference_id);
    user.kyc.aadhaarOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.kyc.aadhaar = aadhaarNumber.trim().slice(-4); // store only last 4 digits now
    await user.save();

    return NextResponse.json({
      success: true,
      message: "OTP sent to the mobile number linked with this Aadhaar.",
    });
  } catch (err) {
    console.error("Aadhaar send-otp error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}