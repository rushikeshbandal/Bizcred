import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const tickets = await SupportTicket.find().sort({ createdAt: -1 });

    return Response.json({ success: true, tickets });
  } catch (error) {
    console.error("Admin support list error:", error);
    return Response.json(
      { success: false, message: error.message || "Failed to load tickets." },
      { status: 500 }
    );
  }
}