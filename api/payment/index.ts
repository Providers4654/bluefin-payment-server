export default async function handler(req, res) {
  // ✅ CORS setup
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

const { eToken, amount, name } = req.body;
const token = eToken; // alias for backward compatibility

if (!token || !amount) {
  return res.status(400).json({ error: "Missing token or amount" });
}


  try {
    const formData = new URLSearchParams();
    formData.append("account_id", process.env.PAYCONEX_ACCOUNT_ID);
    formData.append("api_accesskey", process.env.PAYCONEX_API_KEY);
    formData.append("tender_type", "CARD");
    formData.append("transaction_type", "SALE");
    formData.append("transaction_amount", amount);
    formData.append("etoken", token);
    formData.append("response_format", "JSON");
    if (name) formData.append("name", name);

     console.log("🔁 Sending to PayConex:", formData.toString());
    
    const response = await fetch("https://secure.payconex.net/api/qsapi/3.8", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });

    const result = await response.json();

    console.log("✅ PayConex response:", result);

    if (result.error) {
      return res.status(400).json({ success: false, result });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}
