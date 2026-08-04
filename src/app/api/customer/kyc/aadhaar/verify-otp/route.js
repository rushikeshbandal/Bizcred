import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAadhaarOtp } from "@/lib/sandbox";

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { otp } = await req.json();

    if (!otp || otp.trim().length < 4) {
      return NextResponse.json({ success: false, message: "Enter the OTP." }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if (!user.kyc?.aadhaarRefId) {
      return NextResponse.json({ success: false, message: "No pending Aadhaar verification. Please request a new OTP." }, { status: 400 });
    }

    if (user.kyc.aadhaarOtpExpiry && user.kyc.aadhaarOtpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: "OTP expired. Please request a new one." }, { status: 400 });
    }

    const { ok, data } = await verifyAadhaarOtp(user.kyc.aadhaarRefId, otp.trim());

    if (!ok || data?.data?.status !== "VALID") {
      return NextResponse.json(
        { success: false, message: data?.data?.message || data?.message || "OTP verification failed." },
        { status: 400 }
      );
    }

    const result = data.data;

    user.kyc.aadhaarVerified = true;
    user.kyc.aadhaarName = result.name;
    user.kyc.aadhaarDob = result.date_of_birth;
    user.kyc.aadhaarGender = result.gender;
    user.kyc.aadhaarAddress = result.full_address;
    user.kyc.aadhaarRefId = undefined;
    user.kyc.aadhaarOtpExpiry = undefined;

    // Auto-promote KYC status if PAN is already verified too, otherwise mark pending review
    if (user.kyc.status === "not_submitted") {
      user.kyc.status = "pending";
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Aadhaar verified successfully.",
      details: {
        name: result.name,
        dob: result.date_of_birth,
        gender: result.gender,
        address: result.full_address,
      },
    });
  } catch (err) {
    console.error("Aadhaar verify-otp error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}