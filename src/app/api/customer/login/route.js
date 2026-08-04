import { connectDB } from "@/config/db";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import bcrypt from "bcryptjs";
import { sendOtpEmail } from "@/config/mailer";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password, selfie, latitude, longitude } = await req.json();

    if (!email || !password) {
      return Response.json(
        { success: false, message: "Email and Password are required." },
        { status: 400 }
      );
    }

    if (!selfie || latitude == null || longitude == null) {
      return Response.json(
        {
          success: false,
          message: "Camera and location verification are required to login.",
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    if (user.role !== "user") {
      return Response.json(
        { success: false, message: "Customer login only." },
        { status: 403 }
      );
    }

    if (user.status === "blocked") {
      return Response.json(
        { success: false, message: "Your account is blocked." },
        { status: 403 }
      );
    }

    if (user.status === "suspended") {
      return Response.json(
        { success: false, message: "Your account is suspended." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return Response.json(
        { success: false, message: "Invalid password." },
        { status: 401 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "Unknown";

    const browser = req.headers.get("user-agent") || "Unknown";

    // NEW: filter scoped to purpose: "login" so it never touches an email_change record
    await OtpVerification.findOneAndUpdate(
      { email, purpose: "login" },
      {
        email,
        otp,
        purpose: "login",
        selfie,
        latitude,
        longitude,
        ip,
        browser,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.log("Email send error:", mailErr.message);
      return Response.json(
        { success: false, message: "Failed to send OTP email. Try again." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      step: "otp_required",
      message: "OTP sent to your registered email.",
      email,
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}