export default function handler(req, res) {
  const origin = req.headers.origin || "none";
  console.log("🔍 TEST endpoint hit by origin:", origin);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  res.status(200).json({ message: "You reached the test endpoint", origin });
}
