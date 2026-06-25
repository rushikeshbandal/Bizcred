import { NextResponse } from "next/server";

import connectDB from "@/lib/connectDB";
import User from "@/models/User";

export async function POST(req) {

  try {

    await connectDB();

    const body = await req.json();

    const {
      userId,
      pan,
      aadhaar,
      bankAccount,
      ifsc,
      accountHolder,
      panImage,
      aadhaarImage,
      selfie,
    } = body;

    const user = await User.findById(userId);

    if (!user) {

      return NextResponse.json({
        success: false,
        message: "User not found",
      });

    }

    user.kyc = {

      pan,
      aadhaar,

      bankAccount,
      ifsc,
      accountHolder,

      panImage,
      aadhaarImage,
      selfie,

      status: "pending",

    };

    await user.save();

    return NextResponse.json({

      success: true,
      message: "KYC submitted successfully",

    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({

      success: false,
      message: "Server error",

    });

  }

}