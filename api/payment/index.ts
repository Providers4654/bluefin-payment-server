import { parse } from "querystring";
import type { IncomingMessage, ServerResponse } from "http";

export const config = {
  api: {
    bodyParser: false,
  },
};

// normalize helper
function normalize(field: string | string[] | undefined): string | undefined {
  if (!field) return undefined;
  return Array.isArray(field) ? field[0] : field;
}

// extend res with json + status like Next.js
function enhanceRes(res: ServerResponse) {
  (res as any).status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  (res as any).json = (obj: any) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(obj));
  };
  return res as ServerResponse & { status: (c: number) => any; json: (o: any) => void };
}

export default async function handler(
  req: IncomingMessage & { method?: string },
  resRaw: ServerResponse & { setHeader: any }
) {
  const res = enhanceRes(resRaw);

  // ✅ CORS
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

  // 🔁 Manual body parsing
  let body = "";
  await new Promise<void>((resolve, reject) => {
    req.on("data", chunk => { body += chunk.toString(); });
    req.on("end", () => resolve());
    req.on("error", err => reject(err));
  });

  const parsed = parse(body);
  const token = normalize(parsed.eToken);
  const amount = normalize(parsed.amount);
  const name = normalize(parsed.name);

  if (!token || !amount) {
    return res.status(400).json({ error: "Missing token or amount" });
  }

  try {
    // ✅ Pick endpoint based on environment
    const endpoint =
      process.env.PAYCONEX_ENV === "live"
        ? "https://secure.payconex.net/api/qsapi/3.8/"
        : "https://sandbox.payconex.net/api/qsapi/3.8/";

    const formData = new URLSearchParams();
    formData.append("account_id", process.env.PAYCONEX_ACCOUNT_ID || "");
    formData.append("api_accesskey", process.env.PAYCONEX_API_KEY || "");
    formData.append("tender_type", "CARD");
    formData.append("transaction_type", "SALE");
    formData.append("transaction_amount", amount);
    formData.append("etoken", token);
    formData.append("response_format", "JSON");
    if (name) formData.append("first_name", name);

    console.log(`🔁 Sending to PayConex [${process.env.PAYCONEX_ENV}]`, formData.toString());

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const result = await response.json();
    console.log("✅ PayConex response:", result);

    if (result.error) {
      return res.status(400).json({ success: false, result });
    }

    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
