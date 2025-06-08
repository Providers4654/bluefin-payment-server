export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "https://www.mtnhlth.com");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://www.mtnhlth.com");

  const { token, amount, name } = req.body;

  try {
    const response = await fetch("https://api.payconex.net/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + process.env.PAYCONEX_API_KEY
      },
      body: JSON.stringify({
        eToken: token,
        amount: amount,
        name: name,
        currency: "usd"
      })
    });

    const result = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true, result });
    } else {
      return res.status(response.status).json({ error: result });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
