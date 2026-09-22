export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ status: 'error', message: 'Missing Supabase env vars' });
    }

    // Ping Supabase REST API health endpoint — no table needed
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
    return res.status(500).json({ status: 'error', message: err.message });
  }
}
