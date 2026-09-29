import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'
// @ts-ignore - CommonJS module shared with the local `node smtp-tester.js` server
import tester from '../../smtp-tester.js'

const { HTML, runTest, runSms, setViberWebhook } = tester

const text = (body: string, status = 200, headers: Record<string, string> = {}) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...headers } })

// Same rule as the local server: a public deployment is only usable with ACCESS_PASS (HTTP Basic auth, any username).
function checkAuth(req: Request): Response | null {
  const pw = process.env.ACCESS_PASS || ''
  if (!pw) return text('SMTP Tester is deployed but locked. Set the ACCESS_PASS environment variable in Netlify (Project configuration > Environment variables) and redeploy.', 503)
  const raw = (req.headers.get('authorization') || '').split(' ')[1] || ''
  const given = Buffer.from(raw, 'base64').toString().split(':').slice(1).join(':')
  const a = Buffer.from(given), c = Buffer.from(pw)
  if (a.length === c.length && timingSafeEqual(a, c)) return null
  return text('Password required', 401, { 'WWW-Authenticate': 'Basic realm="SMTP Tester"' })
}

// Viber subscribers are persisted in Netlify Blobs (one key per user) instead of the local server's in-memory Map.
const viberStore = () => getStore('viber-users')

async function viberEvent(j: any) {
  if (!j || typeof j !== 'object') return
  if (j.event === 'unsubscribed' && j.user_id) return viberStore().delete(String(j.user_id))
  const u = j.user || j.sender
  if (u && u.id && ['subscribed', 'conversation_started', 'message'].includes(j.event))
    await viberStore().setJSON(String(u.id), { id: u.id, name: u.name || '', event: j.event, t: Date.now() })
}

async function viberUsers() {
  const store = viberStore()
  const { blobs } = await store.list()
  const users = await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' })))
  return users.filter(Boolean).sort((a: any, b: any) => b.t - a.t)
}

function streamRun(req: Request, run: typeof runTest) {
  const enc = new TextEncoder()
  let aborted = false
  const stream = new ReadableStream({
    async start(ctl) {
      const send = (o: object) => { if (!aborted) ctl.enqueue(enc.encode(JSON.stringify({ t: Date.now(), ...o }) + '\n')) }
      try {
        const r = await run(await req.json().catch(() => ({})), send, () => aborted)
        send({ done: true, ok: r.ok, summary: r.summary })
      } catch (e: any) {
        send({ level: 'error', msg: 'Unexpected error: ' + e.message })
        send({ done: true, ok: false })
      }
      if (!aborted) ctl.close()
    },
    cancel() { aborted = true },
  })
  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-cache' } })
}

export default async (req: Request) => {
  const path = new URL(req.url).pathname
  const m = req.method

  // Viber calls this directly, so it stays public (same as the local server).
  if (m === 'POST' && path === '/viber/webhook') {
    try { await viberEvent(await req.json()) } catch (_) {}
    return text('ok')
  }
  if (m === 'GET' && path === '/healthz') return text('ok')

  const denied = checkAuth(req)
  if (denied) return denied

  if (m === 'GET' && (path === '/' || path === '/index.html'))
    return new Response(HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  if (m === 'GET' && path === '/api/viber/users') return Response.json(await viberUsers())
  if (m === 'POST' && path === '/api/viber/webhook') {
    const b = await req.json().catch(() => ({}))
    return Response.json(await setViberWebhook(b))
  }
  if (m === 'POST' && path === '/api/test') return streamRun(req, runTest)
  if (m === 'POST' && path === '/api/sms') return streamRun(req, runSms)
  return text('Not found', 404)
}

export const config: Config = {
  path: ['/', '/index.html', '/healthz', '/viber/webhook', '/api/*'],
}
