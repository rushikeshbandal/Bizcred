import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function PUT(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId, status } = await req.json();

    // ✅ Validation
    if (!userId || !status) {
      return Response.json({
        success: false,
        message: "UserId and status required"
      });
    }

    if (!["active", "blocked", "suspended"].includes(status)) {
      return Response.json({
        success: false,
        message: "Invalid status"
      });
    }

    // ✅ Update user status
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!user) {
      return Response.json({
        success: false,
        message: "User not found"
      });
    }

    return Response.json({
      success: true,
      message: `User ${status} successfully`,
      user
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      message: "Error updating status"
    });
  }
}