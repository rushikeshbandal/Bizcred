import { connectDB } from "@/config/db";
import AdminSettings from "@/models/AdminSettings";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    let settings =
      await AdminSettings.findOne();

    if (!settings) {
      settings =
        await AdminSettings.create({});
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
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const body = await req.json();

    let settings =
      await AdminSettings.findOne();

    if (!settings) {
      settings =
        new AdminSettings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();

    return Response.json({
      success: true,
      message:
        "Settings updated successfully",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}