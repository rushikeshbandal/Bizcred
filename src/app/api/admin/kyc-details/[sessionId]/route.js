export async function GET(req, { params }) {
  try {
    const response = await fetch(
      `https://verification.didit.me/v3/session/${params.sessionId}/decision/`,
      {
        headers: {
          "x-api-key": process.env.DIDIT_API_KEY,
        },
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