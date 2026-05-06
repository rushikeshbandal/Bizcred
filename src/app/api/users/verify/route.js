import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function PUT(req) {
  try {
    await connectDB();
    verifyAdmin(req);

    const { userId, status } = await req.json();

    if (!userId || !status) {
      return Response.json({
        success: false,
        message: "UserId and status required"
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return Response.json({
        success: false,
        message: "Invalid KYC status"
      });
    }

    // ✅ AUTO BLOCK LOGIC
    const updateData = {
      "kyc.status": status
    };

    if (status === "rejected") {
      updateData.status = "blocked"; // 🔥 AUTO BLOCK USER
    }

    if (status === "approved") {
      updateData.status = "active"; // 🔓 UNBLOCK IF APPROVED
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    return Response.json({
      success: true,
      message:
        status === "rejected"
          ? "KYC rejected → User blocked"
          : "KYC approved → User activated",
      user
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error updating KYC"
    });
  }
}