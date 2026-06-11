import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";
import { sendEmail } from "@/utils/sendEmail";

export async function POST(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId, pan, aadhaar } = await req.json();

    if (!userId || !pan || !aadhaar) {
      return Response.json({
        success: false,
        message: "UserId, PAN and Aadhaar required"
      });
    }

    // PAN Format Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!panRegex.test(pan.toUpperCase())) {
      return Response.json({
        success: false,
        message: "Invalid PAN format"
      });
    }

    console.log("🔍 Verifying PAN:", pan);

    // DEEPVUE API CALL
    const response = await fetch(
      "YOUR_DEEPVUE_PAN_API_URL",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DEEPVUE_API_KEY,
        },
        body: JSON.stringify({
          id_number: pan.toUpperCase(),
        }),
      }
    );

    const panData = await response.json();

    console.log(
      "✅ Deepvue Response:",
      JSON.stringify(panData, null, 2)
    );

    if (!panData?.data) {
      return Response.json({
        success: false,
        message: "PAN Verification Failed"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        kyc: {
          pan: panData.data.pan,
          aadhaar,

          panName: panData.data.full_name,
          panCategory: panData.data.category,
          panStatus: panData.data.status,

          status: "pending"
        }
      },
      { new: true }
    );

    // EMAIL ALERT
    await sendEmail(
      user.email,
      "KYC Submitted Successfully",
      `
      <h2>KYC Submitted Successfully</h2>

      <p>Hello ${user.name},</p>

      <p>Your PAN has been verified successfully.</p>

      <table border="1" cellpadding="8">
        <tr>
          <td><b>PAN</b></td>
          <td>${panData.data.pan}</td>
        </tr>

        <tr>
          <td><b>Name</b></td>
          <td>${panData.data.full_name}</td>
        </tr>

        <tr>
          <td><b>Status</b></td>
          <td>${panData.data.status}</td>
        </tr>

        <tr>
          <td><b>Category</b></td>
          <td>${panData.data.category}</td>
        </tr>
      </table>

      <br/>

      <p>Your KYC request is now under admin review.</p>

      <p>Thank you for using BizCred.</p>
      `
    );

    return Response.json({
      success: true,
      message: "KYC submitted successfully",
      user
    });

  } catch (error) {
    console.error("❌ KYC ERROR:", error);

    return Response.json({
      success: false,
      message: error.message
    });
  }
}