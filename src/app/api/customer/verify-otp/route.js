import { connectDB } from "@/config/db";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import LoginHistory from "@/models/LoginHistory";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { success: false, message: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const record = await OtpVerification.findOne({ email });

    if (!record) {
      return Response.json(
        { success: false, message: "OTP expired or not found. Please login again." },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: record._id });
      return Response.json(
        { success: false, message: "OTP has expired. Please login again." },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return Response.json(
        { success: false, message: "Invalid OTP." },
        { status: 401 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    // ---- Generate JWT (only now, after OTP success) ----
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ---- Save Login History using data captured in step 1 ----
    try {
      await LoginHistory.create({
        userId: user._id,
        selfie: record.selfie || null,
        latitude: record.latitude ?? null,
        longitude: record.longitude ?? null,
        ip: record.ip,
        browser: record.browser,
      });
    } catch (logErr) {
      console.log("LoginHistory save error:", logErr.message);
    }

    // OTP used — remove it so it can't be reused
    await OtpVerification.deleteOne({ _id: record._id });

    return Response.json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}