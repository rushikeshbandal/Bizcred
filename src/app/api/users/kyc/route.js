import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function POST(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId, pan, aadhaar } = await req.json();

    if (!pan || !aadhaar) {
      return Response.json({
        success: false,
        message: "PAN and Aadhaar required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { kyc: { pan, aadhaar } },
      { new: true }
    );

    return Response.json({
      success: true,
      message: "KYC updated",
      user
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error updating KYC"
    });
  }
}