// ご意見ボックス：送られた内容を Supabase の feedback 表に保存する
// 鍵（SUPABASE_KEY）は Vercel の環境変数に置き、ブラウザには渡さない。
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  // スパム対策：人には見えない欄に何か入っていたら、保存せずに成功扱いで返す
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const nicknameRaw = typeof body.nickname === 'string' ? body.nickname.trim() : '';
  const nickname = nicknameRaw === '' ? null : nicknameRaw;
  const allowPublish = body.allow_publish === true;

  if (message.length < 1 || message.length > 2000) {
    return res.status(400).json({ ok: false, error: 'message_length' });
  }
  if (nickname && nickname.length > 50) {
    return res.status(400).json({ ok: false, error: 'nickname_length' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  try {
    const r = await fetch(`${url}/rest/v1/feedback`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ message, nickname, allow_publish: allowPublish }),
    });
    if (!r.ok) {
      return res.status(502).json({ ok: false, error: 'save_failed' });
    }
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, error: 'save_failed' });
  }
}
