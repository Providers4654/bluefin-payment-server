const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = 3000;

// ✅ Your Bluefin credentials
const BLUEFIN_ACCOUNT_ID = "120615633284";
const BLUEFIN_API_KEY = "5cbfaa52157d86ab39ab6d0c099316c0";

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Route to process payment
app.post("/process-payment", async (req, res) => {
  const { token, amount } = req.body;

  if (!token || !amount) {
    return res.status(400).json({ error: "Missing token or amount." });
  }

  try {
    const response = await axios.post(
      "https://secure.payconex.net/api/qsapi/3.8/",
      new URLSearchParams({
        response_format: "JSON",
        account_id: BLUEFIN_ACCOUNT_ID,
        api_accesskey: BLUEFIN_API_KEY,
        tender_type: "CARD",
        transaction_type: "SALE",
        transaction_amount: amount.toFixed(2),
        etoken: token,
        first_name: "MTN HLTH",
        custom_id: `txn_${Date.now()}`
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const result = response.data;

    if (result.status === "success") {
      res.json({ message: "✅ Payment successful", result });
    } else {
      res.status(500).json({ error: "❌ Payment failed", result });
    }
  } catch (err) {
    console.error("Bluefin QSAPI Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

// ✅ Start the server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
