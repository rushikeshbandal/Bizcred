import { connectDB } from "@/config/db";
import AdminSettings from "@/models/AdminSettings";

export async function GET() {
  try {
    await connectDB();

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = await AdminSettings.create({});
    }

    return Response.json({
      success: true,
      settings,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();

    return Response.json({
      success: true,
      message: "Settings Saved Successfully",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}