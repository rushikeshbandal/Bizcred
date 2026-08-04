import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function POST(req) {
  try {
    await connectDB();

    const decoded = verifyAdmin(req);

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return Response.json(
        { success: false, message: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return Response.json({ success: false, message: "Admin not found." }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, admin.password);
    if (!matches) {
      return Response.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return Response.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    return Response.json(
      { success: false, message: error.message || "Something went wrong." },
      { status: 500 }
    );
  }
}