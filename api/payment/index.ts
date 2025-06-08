export default async function handler(req, res) {
  const allowedOrigin = "https://www.mtnhlth.com";

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    });
    return res.end();
  }

  // Set for all other requests
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Method not allowed" });
  }

  const { token, amount, name } = req.body;

  try {
    const response = await fetch("https://api.payconex.net/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + process.env.PAYCONEX_API_KEY,
      },
      body: JSON.stringify({
        eToken: token,
        amount,
        name,
        currency: "usd",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      return res
        .status(200)
        .json({ success: true, result });
    } else {
      return res
        .status(response.status)
        .json({ error: result });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
}
