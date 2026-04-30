import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function PUT(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId, name, email, pan, aadhaar } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email, //  ADD THIS
        kyc: { pan, aadhaar }
      },
      { new: true }
    );

    return Response.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error updating user"
    });
  }
}