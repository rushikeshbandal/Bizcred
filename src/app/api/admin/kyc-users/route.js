import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const users = await User.find().lean();

    const customers = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "-",

      pan: u.kyc?.pan || "-",
      aadhaar: u.kyc?.aadhaar || "-",

      kycStatus: u.kyc?.status || "pending",

      // Credit Score from MongoDB
      creditScore: u.creditScore || 0,

      sessionId: u.kyc?.sessionId,
    }));

    return Response.json(customers);
  } catch (error) {
    console.error("KYC USERS ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}