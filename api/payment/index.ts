export default async function handler(req, res) {
  const origin = req.headers.origin;

  // ✅ CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://www.mtnhlth.com");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");


  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, amount, name } = req.body;

  try {
    const response = await fetch("https://secure.payconex.net/pay/qsapi/3.8", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": process.env.PAYCONEX_API_KEY
      },
      body: JSON.stringify({
        etoken: token,
        amount,
        name,
        currency: "usd"
      })
    });

    const result = await response.text();

    // if (response.ok) {
      return res.status(200).json({ success: true, result, auth: process.env.PAYCONEX_API_KEY, body: JSON.stringify({
        etoken: token,
        amount,
        name,
        currency: "usd"
      }) });
    // } else {
    //   return res.status(response.status).json({ error: result });
    // }
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
