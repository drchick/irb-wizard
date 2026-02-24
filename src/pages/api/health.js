export default function handler(req, res) {
  res.status(200).json({
    status:              'ok',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    supabaseConfigured:  !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    adminConfigured:     !!process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  });
}
