import { connectDB } from "@/config/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Invalid Token",
        },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Customer not found",
        },
        { status: 404 }
      );
    }

    if (user.role !== "user") {
      return Response.json(
        {
          success: false,
          message: "Access Denied",
        },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);

    return Response.json(
      {
        success: false,
        message: "Invalid Token",
      },
      { status: 401 }
    );
  }
}