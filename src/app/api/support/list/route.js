import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";

export async function GET() {
  await connectDB();

  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 });

  return Response.json({
    success: true,
    tickets,
  });
}