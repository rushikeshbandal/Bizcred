import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const users = await User.find({ role: "user" }).lean();

    const customers = users.map((u) => {
      const kyc = u.kyc || {};

      // Never send the encrypted Aadhaar blob to the browser
      const { aadhaarEncrypted, ...safeKyc } = kyc;

      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        mobile: u.mobile || "-",
        status: u.status,
        kyc: safeKyc,
        createdAt: u.createdAt,
      };
    });

    return Response.json({ success: true, customers });
  } catch (error) {
    console.error("KYC USERS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Failed to load customers.",
      },
      { status: 500 }
    );
  }
}