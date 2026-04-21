import express from 'express';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const DB_PATH = path.resolve(process.cwd(), 'amber_memory.db');
const PASSWORD = process.env.DASHBOARD_PASSWORD || process.env.CONSOLE_PASSWORD || 'indvstry2024';

function getDb() {
  return new Database(DB_PATH, { readonly: true });
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-auth-token'] || req.query.token || req.cookies?.dashToken;
  if (token === PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorised' });
}

// ─── API: conversations list ──────────────────────────────────────

router.get('/api/conversations', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const platform = req.query.platform as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = `
      SELECT
        c.id, c.contact_id, c.platform, c.direction, c.content,
        c.sent_at, c.amber_replied, c.needs_reply, c.approved_by_george,
        co.first_name, co.last_name, co.whatsapp_number, co.phone,
        co.email, co.contact_type, co.status, co.notes
      FROM conversations c
      LEFT JOIN contacts co ON c.contact_id = co.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (platform && platform !== 'all') {
      query += ' AND c.platform = ?';
      params.push(platform);
    }
    if (search) {
      query += ' AND (c.content LIKE ? OR co.first_name LIKE ? OR co.last_name LIKE ? OR co.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY c.sent_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } finally {
    db.close();
  }
});

// ─── API: single contact thread ───────────────────────────────────

router.get('/api/thread/:contactId', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.contactId);
    const messages = db.prepare(`
      SELECT * FROM conversations WHERE contact_id = ? ORDER BY sent_at ASC
    `).all(req.params.contactId);
    res.json({ contact, messages });
  } finally {
    db.close();
  }
});

// ─── API: stats ───────────────────────────────────────────────────

router.get('/api/stats', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const total = (db.prepare('SELECT COUNT(*) as n FROM conversations').get() as any).n;
    const today = (db.prepare("SELECT COUNT(*) as n FROM conversations WHERE DATE(sent_at) = DATE('now')").get() as any).n;
    const needsReply = (db.prepare('SELECT COUNT(*) as n FROM conversations WHERE needs_reply = 1 AND amber_replied = 0').get() as any).n;
    const members = (db.prepare("SELECT COUNT(*) as n FROM contacts WHERE contact_type = 'member'").get() as any).n;
    const byPlatform = db.prepare("SELECT platform, COUNT(*) as n FROM conversations GROUP BY platform").all();
    res.json({ total, today, needsReply, members, byPlatform });
  } finally {
    db.close();
  }
});

// ─── API: flag contact ────────────────────────────────────────────

router.post('/api/flag/:contactId', requireAuth, (req, res) => {
  const db2 = new Database(DB_PATH);
  try {
    const { notes, status } = req.body;
    const updates: string[] = [];
    const params: any[] = [];
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (updates.length === 0) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.contactId);
    db2.prepare(`UPDATE contacts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    res.json({ ok: true });
  } finally {
    db2.close();
  }
});

// ─── DASHBOARD HTML ───────────────────────────────────────────────

router.get('/login', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amber Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 40px; width: 360px; }
  h1 { font-size: 20px; margin-bottom: 6px; }
  p { color: #888; font-size: 14px; margin-bottom: 24px; }
  input { width: 100%; padding: 12px; background: #252525; border: 1px solid #444; border-radius: 8px; color: #fff; font-size: 15px; margin-bottom: 16px; outline: none; }
  input:focus { border-color: #a855f7; }
  button { width: 100%; padding: 12px; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; border-radius: 8px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }
  button:hover { opacity: 0.9; }
</style>
</head>
<body>
<div class="card">
  <h1>Amber Dashboard</h1>
  <p>Indvstry Clvb — Community Intelligence</p>
  <input type="password" id="pw" placeholder="Password" onkeydown="if(event.key==='Enter')login()">
  <button onclick="login()">Sign in</button>
</div>
<script>
function login() {
  const pw = document.getElementById('pw').value;
  document.cookie = 'dashToken=' + pw + ';path=/';
  window.location.href = '/dashboard?token=' + encodeURIComponent(pw);
}
</script>
</body></html>`);
});

router.get('/', requireAuth, (req, res) => {
  const token = req.query.token || '';
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amber Dashboard</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e5e5e5; display: flex; height: 100vh; overflow: hidden; }

  /* Sidebar */
  .sidebar { width: 320px; min-width: 320px; background: #141414; border-right: 1px solid #222; display: flex; flex-direction: column; }
  .sidebar-header { padding: 20px 16px 12px; border-bottom: 1px solid #222; }
  .sidebar-header h1 { font-size: 18px; font-weight: 700; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .sidebar-header p { font-size: 12px; color: #666; margin-top: 2px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #222; }
  .stat { background: #1e1e1e; border-radius: 8px; padding: 10px; }
  .stat-num { font-size: 22px; font-weight: 700; color: #a855f7; }
  .stat-label { font-size: 11px; color: #666; margin-top: 2px; }
  .filters { padding: 10px 16px; border-bottom: 1px solid #222; display: flex; gap: 6px; flex-wrap: wrap; }
  .filter-btn { padding: 4px 10px; border-radius: 20px; border: 1px solid #333; background: transparent; color: #888; font-size: 12px; cursor: pointer; }
  .filter-btn.active { background: #a855f7; border-color: #a855f7; color: #fff; }
  .search-box { padding: 8px 16px; border-bottom: 1px solid #222; }
  .search-box input { width: 100%; padding: 8px 12px; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 13px; outline: none; }
  .conv-list { flex: 1; overflow-y: auto; }
  .conv-item { padding: 12px 16px; border-bottom: 1px solid #1a1a1a; cursor: pointer; transition: background 0.15s; }
  .conv-item:hover { background: #1e1e1e; }
  .conv-item.active { background: #1e1e1e; border-left: 3px solid #a855f7; }
  .conv-item.unread { background: #1a1520; }
  .conv-name { font-size: 14px; font-weight: 600; display: flex; justify-content: space-between; }
  .conv-preview { font-size: 12px; color: #666; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .conv-meta { display: flex; gap: 6px; margin-top: 4px; align-items: center; }
  .badge { font-size: 10px; padding: 2px 6px; border-radius: 10px; }
  .badge-wa { background: #1a4a2e; color: #4ade80; }
  .badge-email { background: #1a2a4a; color: #60a5fa; }
  .badge-tg { background: #1a354a; color: #38bdf8; }
  .badge-ig { background: #3a1a3a; color: #e879f9; }
  .badge-li { background: #1a2a4a; color: #818cf8; }
  .badge-needs { background: #4a2a1a; color: #fb923c; }
  .conv-time { font-size: 10px; color: #555; }

  /* Main panel */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .main-header { padding: 16px 24px; border-bottom: 1px solid #222; display: flex; align-items: center; justify-content: space-between; min-height: 64px; }
  .contact-info h2 { font-size: 16px; font-weight: 600; }
  .contact-info p { font-size: 12px; color: #666; }
  .header-actions { display: flex; gap: 8px; }
  .btn { padding: 6px 14px; border-radius: 8px; border: 1px solid #333; background: transparent; color: #ccc; font-size: 12px; cursor: pointer; }
  .btn:hover { background: #222; }
  .btn-primary { background: #a855f7; border-color: #a855f7; color: #fff; }
  .btn-primary:hover { opacity: 0.9; }
  .messages { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
  .msg { max-width: 70%; }
  .msg.inbound { align-self: flex-start; }
  .msg.outbound { align-self: flex-end; }
  .msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
  .msg.inbound .msg-bubble { background: #1e1e1e; border-bottom-left-radius: 4px; }
  .msg.outbound .msg-bubble { background: linear-gradient(135deg, #6d28d9, #9333ea); border-bottom-right-radius: 4px; }
  .msg-time { font-size: 10px; color: #555; margin-top: 4px; padding: 0 4px; }
  .msg.outbound .msg-time { text-align: right; }
  .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #444; font-size: 15px; }

  /* Flag panel */
  .flag-panel { padding: 16px 24px; border-top: 1px solid #222; background: #141414; }
  .flag-panel textarea { width: 100%; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; color: #ccc; font-size: 13px; padding: 10px; outline: none; resize: none; height: 60px; }
  .flag-row { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
  .flag-row select { background: #1e1e1e; border: 1px solid #333; border-radius: 8px; color: #ccc; padding: 6px 10px; font-size: 12px; outline: none; flex: 1; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  .refresh-indicator { font-size: 11px; color: #555; }
</style>
</head>
<body>
<div class="sidebar">
  <div class="sidebar-header">
    <h1>Amber</h1>
    <p>Indvstry Clvb — Community Intelligence</p>
  </div>
  <div class="stats" id="stats">
    <div class="stat"><div class="stat-num" id="s-total">-</div><div class="stat-label">Total msgs</div></div>
    <div class="stat"><div class="stat-num" id="s-today">-</div><div class="stat-label">Today</div></div>
    <div class="stat"><div class="stat-num" id="s-needs">-</div><div class="stat-label">Need reply</div></div>
    <div class="stat"><div class="stat-num" id="s-members">-</div><div class="stat-label">Members</div></div>
  </div>
  <div class="filters">
    <button class="filter-btn active" onclick="setFilter('all',this)">All</button>
    <button class="filter-btn" onclick="setFilter('whatsapp',this)">WhatsApp</button>
    <button class="filter-btn" onclick="setFilter('email',this)">Email</button>
    <button class="filter-btn" onclick="setFilter('telegram',this)">Telegram</button>
    <button class="filter-btn" onclick="setFilter('instagram',this)">Instagram</button>
  </div>
  <div class="search-box">
    <input type="text" id="search" placeholder="Search conversations..." oninput="debounceLoad()" />
  </div>
  <div class="conv-list" id="conv-list"></div>
</div>
<div class="main" id="main">
  <div class="empty-state">Select a conversation</div>
</div>

<script>
const TOKEN = '${token}';
const headers = { 'x-auth-token': TOKEN, 'Content-Type': 'application/json' };
let currentFilter = 'all';
let currentContact = null;
let searchTimer = null;

function debounceLoad() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadConversations, 400);
}

function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  loadConversations();
}

function platformBadge(p) {
  const map = { whatsapp: 'wa', email: 'email', telegram: 'tg', instagram: 'ig', linkedin: 'li' };
  const k = map[p] || 'wa';
  return '<span class="badge badge-' + k + '">' + p + '</span>';
}

function timeAgo(dt) {
  const diff = Date.now() - new Date(dt).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

async function loadConversations() {
  const search = document.getElementById('search').value;
  let url = '/dashboard/api/conversations?limit=60&token=' + TOKEN;
  if (currentFilter !== 'all') url += '&platform=' + currentFilter;
  if (search) url += '&search=' + encodeURIComponent(search);
  const res = await fetch(url, { headers });
  const rows = await res.json();

  const list = document.getElementById('conv-list');
  if (!rows.length) { list.innerHTML = '<div style="padding:20px;color:#555;font-size:13px;text-align:center">No conversations found</div>'; return; }

  const seen = new Set();
  const grouped = [];
  for (const r of rows) {
    if (!seen.has(r.contact_id)) {
      seen.add(r.contact_id);
      grouped.push(r);
    }
  }

  list.innerHTML = grouped.map(r => {
    const name = [r.first_name, r.last_name].filter(Boolean).join(' ') || r.whatsapp_number || r.email || 'Unknown';
    const preview = (r.content || '').replace(/\\n/g, ' ').substring(0, 60);
    const needsBadge = r.needs_reply && !r.amber_replied ? '<span class="badge badge-needs">needs reply</span>' : '';
    return \`<div class="conv-item \${r.needs_reply && !r.amber_replied ? 'unread' : ''}" onclick="openThread(\${r.contact_id}, '\${name.replace(/'/g,"\\\\'")}')">
      <div class="conv-name"><span>\${name}</span><span class="conv-time">\${timeAgo(r.sent_at)}</span></div>
      <div class="conv-preview">\${r.direction === 'outbound' ? 'Amber: ' : ''}\${preview}</div>
      <div class="conv-meta">\${platformBadge(r.platform)}\${needsBadge}</div>
    </div>\`;
  }).join('');
}

async function openThread(contactId, name) {
  currentContact = contactId;
  document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
  event.currentTarget.classList.add('active');

  const res = await fetch('/dashboard/api/thread/' + contactId + '?token=' + TOKEN, { headers });
  const { contact, messages } = await res.json();

  const statusOptions = ['cold','warm','hot','active','inactive','declined'].map(s =>
    \`<option value="\${s}" \${contact?.status === s ? 'selected' : ''}>\${s}</option>\`
  ).join('');

  document.getElementById('main').innerHTML = \`
    <div class="main-header">
      <div class="contact-info">
        <h2>\${name}</h2>
        <p>\${[contact?.email, contact?.whatsapp_number, contact?.company, contact?.job_title].filter(Boolean).join(' · ')}</p>
      </div>
      <div class="header-actions">
        <span class="refresh-indicator" id="last-refreshed">Live</span>
      </div>
    </div>
    <div class="messages" id="msgs">\${renderMessages(messages)}</div>
    <div class="flag-panel">
      <textarea id="note-input" placeholder="Add a note about this contact (visible only to you)...">\${contact?.notes || ''}</textarea>
      <div class="flag-row">
        <select id="status-select">\${statusOptions}</select>
        <button class="btn btn-primary" onclick="saveFlag(\${contactId})">Save note</button>
      </div>
    </div>
  \`;

  const msgsEl = document.getElementById('msgs');
  if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
}

function renderMessages(messages) {
  if (!messages?.length) return '<div style="color:#555;font-size:13px;text-align:center;padding:20px">No messages yet</div>';
  return messages.map(m => \`
    <div class="msg \${m.direction}">
      <div class="msg-bubble">\${escapeHtml(m.content)}</div>
      <div class="msg-time">\${new Date(m.sent_at).toLocaleString('en-GB', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
    </div>
  \`).join('');
}

function escapeHtml(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function saveFlag(contactId) {
  const notes = document.getElementById('note-input')?.value;
  const status = document.getElementById('status-select')?.value;
  await fetch('/dashboard/api/flag/' + contactId + '?token=' + TOKEN, {
    method: 'POST', headers,
    body: JSON.stringify({ notes, status })
  });
  const btn = document.querySelector('.btn-primary');
  if (btn) { btn.textContent = 'Saved'; setTimeout(() => { btn.textContent = 'Save note'; }, 1500); }
}

async function loadStats() {
  const res = await fetch('/dashboard/api/stats?token=' + TOKEN, { headers });
  const s = await res.json();
  document.getElementById('s-total').textContent = s.total;
  document.getElementById('s-today').textContent = s.today;
  document.getElementById('s-needs').textContent = s.needsReply;
  document.getElementById('s-members').textContent = s.members;
}

loadConversations();
loadStats();
setInterval(() => {
  loadConversations();
  loadStats();
  if (currentContact) {
    const el = document.getElementById('last-refreshed');
    if (el) el.textContent = 'Updated ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}, 30000);
</script>
</body></html>`);
});

export default router;
