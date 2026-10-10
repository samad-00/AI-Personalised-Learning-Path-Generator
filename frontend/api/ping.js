export default async function handler(req, res) {
  try {
    // VITE_ prefix vars are build-time only — use non-prefixed versions at runtime.
    // Add SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Dashboard → Settings → Environment Variables.
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        status: 'error',
        message: 'Missing Supabase env vars (SUPABASE_URL / SUPABASE_ANON_KEY)',
      });
    }

    // Ping Supabase REST API to keep the project active
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    return res.status(200).json({
      status: 'ok',
      message: 'Supabase is alive!',
      supabase_status: response.status,
      time: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
      hint: 'Check that SUPABASE_URL and SUPABASE_ANON_KEY are set in Vercel env vars (without VITE_ prefix).',
    });
  }
}
