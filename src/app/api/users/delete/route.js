import { connectDB } from "@/config/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function DELETE(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId } = await req.json();

    if (!userId) {
      return Response.json({
        success: false,
        message: "UserId is required"
      });
    }

    // 🔥 delete user + wallet
    await User.findByIdAndDelete(userId);
    await Wallet.findOneAndDelete({ userId });

    return Response.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error deleting user"
    });
  }
}