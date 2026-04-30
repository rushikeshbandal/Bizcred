import { connectDB } from "@/config/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const users = await User.find().lean();

    //  attach wallet balance
    const usersWithWallet = await Promise.all(
      users.map(async (u) => {
        const wallet = await Wallet.findOne({ userId: u._id });
        return {
          ...u,
          wallet: wallet || { balance: 0 }
        };
      })
    );

    return Response.json({
      success: true,
      users: usersWithWallet
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Unauthorized"
    });
  }
}