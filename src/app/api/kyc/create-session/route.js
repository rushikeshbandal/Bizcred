// app/api/kyc/create-session/route.js

export async function POST(req) {
  try {
    const { userId } = await req.json();

    const response = await fetch(
      "https://verification.didit.me/v3/session/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DIDIT_API_KEY,
        },
        body: JSON.stringify({
          workflow_id: process.env.DIDIT_WORKFLOW_ID,
          vendor_data: userId,
          callback: "http://localhost:3000/kyc-success",
          callback_method: "both",
        }),
      }
    );

    const data = await response.json();

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}