export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const expected = `Bearer ${process.env.PAYCONEX_API_KEY}`;

  if (!authHeader || authHeader !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { card_number, amount } = req.body;

  if (!card_number || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulated success response (replace with PayConex call later)
  return res.status(200).json({
    message: 'Payment request received',
    card_last4: card_number.slice(-4),
    amount: amount
  });
}