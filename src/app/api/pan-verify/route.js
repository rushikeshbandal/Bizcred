export async function POST(req) {
  try {
    const { pan } = await req.json();

    const response = await fetch(
      "https://production.deepvue.tech/v1/verification/pan",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.DEEPVUE_API_KEY,
        },
        body: JSON.stringify({
          id_number: pan,
        }),
      }
    );

    const data = await response.json();

    console.log("Deepvue Response:", data);

    return Response.json(data);

  } catch (error) {
    console.log(error);

    return Response.json({
      success: false,
      message: error.message,
    });
  }
}