// みんなのご意見とお返事：サイトに「掲載中」のご意見だけを返す
// 鍵（SUPABASE_KEY）は Vercel の環境変数に置き、ブラウザには渡さない。
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  const query = new URLSearchParams({
    select: 'id,created_at,nickname,message,reply,replied_at',
    is_published: 'eq.true',
    order: 'created_at.desc',
    limit: '50',
  });

  try {
    const r = await fetch(`${url}/rest/v1/feedback?${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: 'load_failed' });
    }
    const items = await r.json();
    // 少しのあいだキャッシュして、表示を速くする
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ ok: true, items });
  } catch {
    return res.status(502).json({ ok: false, error: 'load_failed' });
  }
}
