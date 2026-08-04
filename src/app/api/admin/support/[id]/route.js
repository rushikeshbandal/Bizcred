import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { id } = params;
    const { status } = await req.json();

    const validStatuses = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return Response.json({ success: false, message: "Invalid status." }, { status: 400 });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });

    if (!ticket) {
      return Response.json({ success: false, message: "Ticket not found." }, { status: 404 });
    }

    return Response.json({ success: true, ticket });
  } catch (error) {
    console.error("Admin support update error:", error);
    return Response.json(
      { success: false, message: error.message || "Failed to update ticket." },
      { status: 500 }
    );
  }
}