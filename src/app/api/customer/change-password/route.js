import { connectDB } from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordChangedEmail } from "@/config/mailer";

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return Response.json(
        { success: false, message: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return Response.json(
        { success: false, message: "Please fill all password fields." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return Response.json(
        { success: false, message: "New passwords do not match." },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return Response.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return Response.json(
        { success: false, message: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return Response.json(
        { success: false, message: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    try {
      await sendPasswordChangedEmail(user.email, { time: new Date().toLocaleString() });
    } catch (mailErr) {
      console.log("Password changed email error:", mailErr.message);
    }

    return Response.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}