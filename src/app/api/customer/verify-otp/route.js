import { connectDB } from "@/config/db";
import User from "@/models/User";
import OtpVerification from "@/models/OtpVerification";
import LoginHistory from "@/models/LoginHistory";
import jwt from "jsonwebtoken";
import { sendLoginAlertEmail } from "@/config/mailer";

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
        { success: false, message: "OTP expired or not found. Please try again." },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      await OtpVerification.deleteOne({ _id: record._id });
      return Response.json(
        { success: false, message: "OTP has expired. Please try again." },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return Response.json(
        { success: false, message: "Invalid OTP." },
        { status: 401 }
      );
    }

    // ===== NEW: email-change branch — completely separate from login flow below =====
    if (record.purpose === "email_change") {
      const user = await User.findOne({ email });

      if (!user) {
        return Response.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }

      user.email = record.newEmail;
      user.isEmailVerified = true;
      await user.save();

      await OtpVerification.deleteOne({ _id: record._id });

      return Response.json({
        success: true,
        purpose: "email_change",
        message: "Email updated and verified successfully.",
        newEmail: record.newEmail,
      });
    }

    // ===== EVERYTHING BELOW THIS LINE IS THE ORIGINAL, UNCHANGED LOGIN LOGIC =====

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "Customer not found." },
        { status: 404 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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

    try {
      await sendLoginAlertEmail(user.email, {
        ip: record.ip,
        browser: record.browser,
        latitude: record.latitude,
        longitude: record.longitude,
        time: new Date().toLocaleString(),
      });
    } catch (mailErr) {
      console.log("Login alert email error:", mailErr.message);
    }

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