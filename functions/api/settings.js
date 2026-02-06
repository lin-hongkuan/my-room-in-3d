/**
 * 云端设置 API：所有人读写同一份「显示设置」
 * 需在 Cloudflare Pages 控制台绑定 KV：名称 ROOMTOUR_SETTINGS
 */
const KEY = 'roomtour_settings'
const DEFAULT = { showSettings: false }

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet(context) {
  const { env } = context
  const kv = env.ROOMTOUR_SETTINGS
  if (!kv) {
    return json(DEFAULT)
  }
  try {
    const raw = await kv.get(KEY)
    const data = raw ? JSON.parse(raw) : DEFAULT
    return json(data)
  } catch (_) {
    return json(DEFAULT)
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  const kv = env.ROOMTOUR_SETTINGS
  if (!kv) {
    return json({ error: 'KV not configured' }, 500)
  }
  try {
    const body = await request.json()
    const data = {
      showSettings: Boolean(body.showSettings),
    }
    await kv.put(KEY, JSON.stringify(data))
    return json(data)
  } catch (e) {
    return json({ error: String(e.message) }, 400)
  }
}
