// Vercel serverless function — GET /api/health
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    keySet: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString(),
  });
}
