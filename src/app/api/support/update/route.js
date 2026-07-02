import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";

export async function PUT(req) {
  await connectDB();

  const { ticketId, status } =
    await req.json();

  await SupportTicket.findByIdAndUpdate(
    ticketId,
    {
      status,
    }
  );

  return Response.json({
    success: true,
  });
}