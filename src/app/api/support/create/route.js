import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const ticket = await SupportTicket.create(body);

    return Response.json({
      success: true,
      ticket,
    });
  } catch {
    return Response.json({
      success: false,
    });
  }
}