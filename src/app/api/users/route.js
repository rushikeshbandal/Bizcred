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
        message: "UserId and status required",
      });
    }

    await User.findByIdAndUpdate(userId, { status });

    return Response.json({
      success: true,
      message: "User status updated successfully",
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error updating status",
    });
  }
}