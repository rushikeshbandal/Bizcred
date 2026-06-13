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
      kycStatus: u.kyc?.status || "Pending",
      sessionId: u.kyc?.sessionId,
    }));

    return Response.json(customers);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}