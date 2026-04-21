import express from 'express';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const DB_PATH = path.resolve(process.cwd(), 'amber_memory.db');
const GEORGE_PASSWORD = process.env.DASHBOARD_PASSWORD || process.env.CONSOLE_PASSWORD || 'indvstry2024';

function getDb(readonly = true) {
  return new Database(DB_PATH, { readonly });
}

function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + 'amber_salt_2024').digest('hex');
}

// ─── AUTH ─────────────────────────────────────────────────────────

function getAuthUser(req: express.Request): { id: number | 'george'; name: string; role: string } | null {
  const token = (req.headers['x-auth-token'] || req.query.token || '') as string;
  if (!token) return null;

  // George uses env password directly
  if (token === GEORGE_PASSWORD) return { id: 'george', name: 'George', role: 'admin' };

  // Team members use token = email:passwordhash
  const [email, hash] = token.split(':');
  if (!email || !hash) return null;

  const db = getDb();
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE email = ? AND is_active = 1').get(email) as any;
    if (!member) return null;
    if (member.password_hash !== hash) return null;
    return { id: member.id, name: member.name, role: member.role };
  } finally {
    db.close();
  }
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorised' });
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  (req as any).user = user;
  next();
}

// ─── TEAM MEMBER MANAGEMENT (admin only) ─────────────────────────

router.get('/api/team', requireAdmin, (req, res) => {
  const db = getDb();
  try {
    const members = db.prepare('SELECT id, name, email, role, is_active, created_at FROM team_members').all();
    res.json(members);
  } finally { db.close(); }
});

router.post('/api/team', requireAdmin, (req, res) => {
  const { name, email, password, role = 'agent' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
  const db2 = getDb(false);
  try {
    const hash = hashPassword(password);
    db2.prepare('INSERT INTO team_members (name, email, role, password_hash) VALUES (?, ?, ?, ?)').run(name, email, role, hash);
    res.json({ ok: true, token: `${email}:${hash}` });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  } finally { db2.close(); }
});

router.delete('/api/team/:id', requireAdmin, (req, res) => {
  const db2 = getDb(false);
  try {
    db2.prepare('UPDATE team_members SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } finally { db2.close(); }
});

// ─── CONVERSATIONS API ────────────────────────────────────────────

router.get('/api/conversations', requireAuth, (req, res) => {
  const db = getDb();
  const user = (req as any).user;
  try {
    const platform = req.query.platform as string;
    const search = req.query.search as string;
    const assignedToMe = req.query.mine === '1';
    const limit = parseInt(req.query.limit as string) || 60;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = `
      SELECT c.id, c.contact_id, c.platform, c.direction, c.content, c.sent_at,
             c.amber_replied, c.needs_reply, c.approved_by_george,
             co.first_name, co.last_name, co.whatsapp_number, co.phone,
             co.email, co.contact_type, co.status, co.notes,
             ca.assigned_to, tm.name as assigned_name
      FROM conversations c
      LEFT JOIN contacts co ON c.contact_id = co.id
      LEFT JOIN conversation_assignments ca ON ca.contact_id = co.id AND ca.resolved_at IS NULL
      LEFT JOIN team_members tm ON tm.id = ca.assigned_to
      WHERE 1=1
    `;
    const params: any[] = [];

    if (platform && platform !== 'all') { query += ' AND c.platform = ?'; params.push(platform); }
    if (search) {
      query += ' AND (c.content LIKE ? OR co.first_name LIKE ? OR co.last_name LIKE ? OR co.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (assignedToMe && user.id !== 'george') {
      query += ' AND ca.assigned_to = ?';
      params.push(user.id);
    }

    query += ' ORDER BY c.sent_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    res.json(db.prepare(query).all(...params));
  } finally { db.close(); }
});

router.get('/api/thread/:contactId', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.contactId);
    const messages = db.prepare('SELECT * FROM conversations WHERE contact_id = ? ORDER BY sent_at ASC').all(req.params.contactId);
    const assignment = db.prepare(`
      SELECT ca.*, tm.name as assignee_name
      FROM conversation_assignments ca
      LEFT JOIN team_members tm ON tm.id = ca.assigned_to
      WHERE ca.contact_id = ? AND ca.resolved_at IS NULL
      ORDER BY ca.assigned_at DESC LIMIT 1
    `).get(req.params.contactId);
    const team = db.prepare('SELECT id, name, role FROM team_members WHERE is_active = 1').all();
    res.json({ contact, messages, assignment, team });
  } finally { db.close(); }
});

// ─── ASSIGN CONVERSATION ──────────────────────────────────────────

router.post('/api/assign/:contactId', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { assignedTo, note } = req.body;
  const db2 = getDb(false);
  try {
    // Close existing open assignment
    db2.prepare('UPDATE conversation_assignments SET resolved_at = CURRENT_TIMESTAMP WHERE contact_id = ? AND resolved_at IS NULL').run(req.params.contactId);
    if (assignedTo) {
      db2.prepare(`
        INSERT INTO conversation_assignments (contact_id, assigned_to, assigned_by, note)
        VALUES (?, ?, ?, ?)
      `).run(req.params.contactId, assignedTo, user.id === 'george' ? null : user.id, note || null);
    }
    res.json({ ok: true });
  } finally { db2.close(); }
});

// ─── FLAG / NOTE CONTACT ──────────────────────────────────────────

router.post('/api/flag/:contactId', requireAuth, (req, res) => {
  const { notes, status } = req.body;
  const db2 = getDb(false);
  try {
    const updates: string[] = [];
    const params: any[] = [];
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });
    params.push(req.params.contactId);
    db2.prepare(`UPDATE contacts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);
    res.json({ ok: true });
  } finally { db2.close(); }
});

// ─── STATS ────────────────────────────────────────────────────────

router.get('/api/stats', requireAuth, (req, res) => {
  const db = getDb();
  try {
    const total = (db.prepare('SELECT COUNT(*) as n FROM conversations').get() as any).n;
    const today = (db.prepare("SELECT COUNT(*) as n FROM conversations WHERE DATE(sent_at) = DATE('now')").get() as any).n;
    const needsReply = (db.prepare('SELECT COUNT(*) as n FROM conversations WHERE needs_reply = 1 AND amber_replied = 0').get() as any).n;
    const members = (db.prepare("SELECT COUNT(*) as n FROM contacts WHERE contact_type = 'member'").get() as any).n;
    const unassigned = (db.prepare(`
      SELECT COUNT(DISTINCT co.id) as n FROM contacts co
      LEFT JOIN conversation_assignments ca ON ca.contact_id = co.id AND ca.resolved_at IS NULL
      WHERE ca.id IS NULL AND co.id IN (SELECT DISTINCT contact_id FROM conversations WHERE needs_reply = 1 AND amber_replied = 0)
    `).get() as any).n;
    const byPlatform = db.prepare('SELECT platform, COUNT(*) as n FROM conversations GROUP BY platform').all();
    res.json({ total, today, needsReply, members, unassigned, byPlatform });
  } finally { db.close(); }
});

// ─── LOGIN PAGE ───────────────────────────────────────────────────

router.get('/login', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amber Dashboard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}
  .card{background:#141414;border:1px solid #222;border-radius:16px;padding:40px;width:380px}
  h1{font-size:22px;font-weight:700;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  p{color:#666;font-size:13px;margin:6px 0 28px}
  label{font-size:12px;color:#888;display:block;margin-bottom:6px}
  input{width:100%;padding:11px 14px;background:#1e1e1e;border:1px solid #333;border-radius:8px;color:#fff;font-size:14px;margin-bottom:14px;outline:none}
  input:focus{border-color:#a855f7}
  button{width:100%;padding:12px;background:linear-gradient(135deg,#a855f7,#ec4899);border:none;border-radius:8px;color:#fff;font-size:15px;font-weight:600;cursor:pointer}
  .err{color:#f87171;font-size:12px;margin-top:10px;display:none}
</style>
</head>
<body>
<div class="card">
  <h1>Amber Dashboard</h1>
  <p>Indvstry Clvb — Community Intelligence</p>
  <label>Email or username</label>
  <input id="email" type="text" placeholder="george or team@email.com" />
  <label>Password</label>
  <input id="pw" type="password" placeholder="Password" onkeydown="if(event.key==='Enter')login()" />
  <button onclick="login()">Sign in</button>
  <p class="err" id="err">Invalid credentials</p>
</div>
<script>
async function login() {
  const email = document.getElementById('email').value.trim();
  const pw = document.getElementById('pw').value;
  // George shortcut
  if (email === 'george' || email === '') {
    window.location.href = '/dashboard?token=' + encodeURIComponent(pw);
    return;
  }
  // Team member: hash pw and form token
  const msgBuffer = new TextEncoder().encode(pw + 'amber_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  window.location.href = '/dashboard?token=' + encodeURIComponent(email + ':' + hash);
}
</script>
</body></html>`);
});

// ─── MAIN DASHBOARD ───────────────────────────────────────────────

router.get('/', requireAuth, (req, res) => {
  const user = (req as any).user;
  const token = req.query.token || '';
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Amber Dashboard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#e5e5e5;display:flex;height:100vh;overflow:hidden}
  .sidebar{width:300px;min-width:300px;background:#111;border-right:1px solid #1e1e1e;display:flex;flex-direction:column}
  .sh{padding:16px;border-bottom:1px solid #1e1e1e}
  .sh h1{font-size:17px;font-weight:700;background:linear-gradient(135deg,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
  .sh-meta{font-size:11px;color:#555;margin-top:3px}
  .stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:10px}
  .stat{background:#1a1a1a;border-radius:8px;padding:8px 10px}
  .stat-n{font-size:20px;font-weight:700;color:#a855f7}
  .stat-l{font-size:10px;color:#555;margin-top:1px}
  .filters{padding:8px 10px;display:flex;gap:5px;flex-wrap:wrap;border-bottom:1px solid #1a1a1a}
  .fb{padding:3px 9px;border-radius:20px;border:1px solid #2a2a2a;background:transparent;color:#666;font-size:11px;cursor:pointer}
  .fb.on{background:#a855f7;border-color:#a855f7;color:#fff}
  .sb{padding:8px 10px;border-bottom:1px solid #1a1a1a}
  .sb input{width:100%;padding:7px 10px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;font-size:12px;outline:none}
  .cl{flex:1;overflow-y:auto}
  .ci{padding:10px;border-bottom:1px solid #141414;cursor:pointer;transition:background .1s}
  .ci:hover,.ci.on{background:#1a1a1a}
  .ci.on{border-left:2px solid #a855f7}
  .ci.unread{background:#14101a}
  .ci-top{font-size:13px;font-weight:600;display:flex;justify-content:space-between}
  .ci-pre{font-size:11px;color:#555;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ci-meta{display:flex;gap:4px;margin-top:3px;flex-wrap:wrap}
  .badge{font-size:9px;padding:1px 5px;border-radius:8px}
  .bwa{background:#0d2a1a;color:#4ade80}.bem{background:#0d1e3a;color:#60a5fa}.btg{background:#0d2236;color:#38bdf8}.big{background:#2a0d2a;color:#e879f9}.bli{background:#0d1e3a;color:#818cf8}.bnr{background:#3a1a0d;color:#fb923c}.bhi{background:#2a1a0d;color:#fbbf24}
  .ct{font-size:9px;color:#444}
  .main{flex:1;display:flex;flex-direction:column;overflow:hidden}
  .mh{padding:14px 20px;border-bottom:1px solid #1a1a1a;display:flex;align-items:center;justify-content:space-between;min-height:58px}
  .ci-name h2{font-size:15px;font-weight:600}
  .ci-name p{font-size:11px;color:#555}
  .hacts{display:flex;gap:6px;align-items:center}
  .btn{padding:5px 12px;border-radius:7px;border:1px solid #2a2a2a;background:transparent;color:#aaa;font-size:11px;cursor:pointer}
  .btn:hover{background:#1e1e1e}
  .btnp{background:#a855f7;border-color:#a855f7;color:#fff}
  .btnp:hover{opacity:.9}
  .msgs{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px}
  .msg{max-width:68%}
  .msg.inbound{align-self:flex-start}
  .msg.outbound{align-self:flex-end}
  .mb{padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
  .msg.inbound .mb{background:#1a1a1a;border-bottom-left-radius:3px}
  .msg.outbound .mb{background:linear-gradient(135deg,#5b21b6,#7c3aed);border-bottom-right-radius:3px}
  .mt{font-size:9px;color:#444;margin-top:3px;padding:0 3px}
  .msg.outbound .mt{text-align:right}
  .panel{padding:14px 20px;border-top:1px solid #1a1a1a;background:#0f0f0f}
  .assign-row{display:flex;gap:8px;margin-bottom:8px;align-items:center}
  .assign-row select,.assign-row input{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;padding:6px 10px;font-size:12px;outline:none}
  .note-area{width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;font-size:12px;padding:8px;outline:none;resize:none;height:52px}
  .prow{display:flex;gap:6px;margin-top:6px}
  .prow select{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;padding:5px 8px;font-size:11px;outline:none;flex:1}
  .es{flex:1;display:flex;align-items:center;justify-content:center;color:#333;font-size:14px}
  .team-panel{padding:16px 20px}
  .team-panel h3{font-size:14px;margin-bottom:12px;color:#aaa}
  .tm-row{display:flex;gap:8px;margin-bottom:8px}
  .tm-row input{flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;padding:7px 10px;font-size:12px;outline:none}
  .member-list{margin-top:12px}
  .ml-item{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a1a;font-size:12px}
  .ml-name{color:#ccc}
  .ml-email{color:#555;font-size:11px}
  .rm-btn{padding:3px 8px;border:1px solid #2a2a2a;border-radius:5px;background:transparent;color:#666;font-size:10px;cursor:pointer}
  .rm-btn:hover{background:#3a1a1a;color:#f87171;border-color:#f87171}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
  .tab{padding:5px 12px;border-radius:7px;border:1px solid #2a2a2a;background:transparent;color:#666;font-size:11px;cursor:pointer;margin-right:4px}
  .tab.on{background:#1e1e1e;color:#ccc;border-color:#444}
  .assigned-tag{font-size:10px;color:#a855f7;background:#1a0d2a;padding:2px 6px;border-radius:5px}
</style>
</head>
<body>
<div class="sidebar">
  <div class="sh">
    <h1>Amber</h1>
    <div class="sh-meta">Indvstry Clvb &nbsp;|&nbsp; ${user.name} (${user.role}) &nbsp;<a href="/dashboard/login" style="color:#555;font-size:10px">sign out</a></div>
  </div>
  <div class="stats">
    <div class="stat"><div class="stat-n" id="s-total">0</div><div class="stat-l">Total</div></div>
    <div class="stat"><div class="stat-n" id="s-today">0</div><div class="stat-l">Today</div></div>
    <div class="stat"><div class="stat-n" id="s-needs">0</div><div class="stat-l">Needs reply</div></div>
  </div>
  <div style="padding:0 10px 8px;display:flex;gap:4px">
    <button class="tab on" onclick="setView('inbox',this)">Inbox</button>
    <button class="tab" onclick="setView('mine',this)">Mine</button>
    ${user.role === 'admin' ? '<button class="tab" onclick="setView(\'team\',this)">Team</button>' : ''}
  </div>
  <div class="filters" id="filters">
    <button class="fb on" onclick="setFilter('all',this)">All</button>
    <button class="fb" onclick="setFilter('whatsapp',this)">WhatsApp</button>
    <button class="fb" onclick="setFilter('email',this)">Email</button>
    <button class="fb" onclick="setFilter('telegram',this)">Telegram</button>
    <button class="fb" onclick="setFilter('instagram',this)">Instagram</button>
  </div>
  <div class="sb"><input id="search" type="text" placeholder="Search..." oninput="debounce()" /></div>
  <div class="cl" id="conv-list"></div>
</div>
<div class="main" id="main"><div class="es">Select a conversation</div></div>

<script>
const TOKEN='${token}', H={'x-auth-token':TOKEN,'Content-Type':'application/json'};
const IS_ADMIN=${user.role === 'admin'};
let filter='all', view='inbox', timer=null, currentContact=null;

function debounce(){clearTimeout(timer);timer=setTimeout(load,350)}
function setFilter(f,btn){filter=f;document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));btn.classList.add('on');load()}
function setView(v,btn){view=v;document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));btn.classList.add('on');
  document.getElementById('filters').style.display=v==='team'?'none':'flex';
  if(v==='team'){showTeamPanel();document.getElementById('conv-list').innerHTML=''}else{load()}}

function badge(p){const m={whatsapp:'bwa',email:'bem',telegram:'btg',instagram:'big',linkedin:'bli'};return '<span class="badge '+(m[p]||'bwa')+'">'+p+'</span>'}
function ago(d){const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return 'now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';return Math.floor(s/86400)+'d'}
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

async function load(){
  let url='/dashboard/api/conversations?limit=80&token='+TOKEN;
  if(filter!=='all')url+='&platform='+filter;
  const q=document.getElementById('search').value;
  if(q)url+='&search='+encodeURIComponent(q);
  if(view==='mine')url+='&mine=1';
  const rows=await(await fetch(url,{headers:H})).json();
  const seen=new Set(),grouped=[];
  for(const r of rows){if(!seen.has(r.contact_id)){seen.add(r.contact_id);grouped.push(r)}}
  const list=document.getElementById('conv-list');
  if(!grouped.length){list.innerHTML='<div style="padding:16px;color:#444;font-size:12px;text-align:center">No conversations</div>';return}
  list.innerHTML=grouped.map(r=>{
    const name=[r.first_name,r.last_name].filter(Boolean).join(' ')||r.whatsapp_number||r.email||'Unknown';
    const pre=(r.content||'').replace(/\\n/g,' ').substring(0,55);
    const nr=r.needs_reply&&!r.amber_replied;
    const assigned=r.assigned_name?'<span class="assigned-tag">'+r.assigned_name+'</span>':'';
    return '<div class="ci'+(nr?' unread':'')+(currentContact==r.contact_id?' on':'')+'" onclick="openThread('+r.contact_id+',\''+name.replace(/'/g,"\\'")+'\')" >'
      +'<div class="ci-top"><span>'+esc(name)+'</span><span class="ct">'+ago(r.sent_at)+'</span></div>'
      +'<div class="ci-pre">'+(r.direction==='outbound'?'Amber: ':'')+esc(pre)+'</div>'
      +'<div class="ci-meta">'+badge(r.platform)+(nr?'<span class="badge bnr">reply</span>':'')+assigned+'</div>'
      +'</div>'
  }).join('');
}

async function openThread(cid,name){
  currentContact=cid;
  load();
  const{contact,messages,assignment,team}=await(await fetch('/dashboard/api/thread/'+cid+'?token='+TOKEN,{headers:H})).json();
  const statOpts=['cold','warm','hot','active','inactive','declined'].map(s=>'<option value="'+s+'"'+(contact?.status===s?' selected':'')+'>'+s+'</option>').join('');
  const teamOpts='<option value="">Unassigned</option>'+(team||[]).map(t=>'<option value="'+t.id+'"'+(assignment?.assigned_to==t.id?' selected':'')+'>'+t.name+'</option>').join('');
  const assignNote=assignment?'<div style="font-size:11px;color:#a855f7;margin-bottom:6px">Assigned to '+assignment.assignee_name+(assignment.note?' — '+assignment.note:'')+'</div>':'';
  document.getElementById('main').innerHTML=
    '<div class="mh"><div class="ci-name"><h2>'+esc(name)+'</h2><p>'+esc([contact?.email,contact?.whatsapp_number,contact?.company,contact?.job_title].filter(Boolean).join(' · '))+'</p></div>'
    +'<div class="hacts"><span style="font-size:10px;color:#444" id="refreshed">live</span></div></div>'
    +'<div class="msgs" id="msgs">'+renderMsgs(messages)+'</div>'
    +'<div class="panel">'
    +assignNote
    +(IS_ADMIN?'<div class="assign-row"><label style="font-size:11px;color:#555;white-space:nowrap">Assign to</label><select id="assignee" onchange="assign('+cid+')">'+teamOpts+'</select><input id="anote" placeholder="note (optional)" /></div>':'')
    +'<textarea class="note-area" id="note-input" placeholder="Add a note about this contact...">'+esc(contact?.notes||'')+'</textarea>'
    +'<div class="prow"><select id="status-select">'+statOpts+'</select><button class="btn btnp" onclick="saveFlag('+cid+')">Save</button></div>'
    +'</div>';
  const el=document.getElementById('msgs');if(el)el.scrollTop=el.scrollHeight;
}

function renderMsgs(msgs){
  if(!msgs?.length)return '<div style="color:#333;font-size:12px;padding:20px;text-align:center">No messages yet</div>';
  return msgs.map(m=>'<div class="msg '+m.direction+'">'
    +'<div class="mb">'+esc(m.content)+'</div>'
    +'<div class="mt">'+new Date(m.sent_at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+'</div>'
    +'</div>').join('');
}

async function assign(cid){
  const assignedTo=document.getElementById('assignee')?.value||'';
  const note=document.getElementById('anote')?.value||'';
  await fetch('/dashboard/api/assign/'+cid+'?token='+TOKEN,{method:'POST',headers:H,body:JSON.stringify({assignedTo:assignedTo||null,note})});
  load();
}

async function saveFlag(cid){
  const notes=document.getElementById('note-input')?.value;
  const status=document.getElementById('status-select')?.value;
  await fetch('/dashboard/api/flag/'+cid+'?token='+TOKEN,{method:'POST',headers:H,body:JSON.stringify({notes,status})});
  const b=document.querySelector('.btnp');if(b){b.textContent='Saved';setTimeout(()=>b.textContent='Save',1500)}
}

async function loadStats(){
  const s=await(await fetch('/dashboard/api/stats?token='+TOKEN,{headers:H})).json();
  document.getElementById('s-total').textContent=s.total;
  document.getElementById('s-today').textContent=s.today;
  document.getElementById('s-needs').textContent=s.needsReply;
}

async function showTeamPanel(){
  const team=await(await fetch('/dashboard/api/team?token='+TOKEN,{headers:H})).json();
  document.getElementById('main').innerHTML='<div class="mh"><div class="ci-name"><h2>Team Members</h2><p>Manage who has access to Amber Dashboard</p></div></div>'
    +'<div class="team-panel">'
    +'<h3>Add team member</h3>'
    +'<div class="tm-row"><input id="tn" placeholder="Name" /><input id="te" placeholder="Email" /><input id="tp" type="password" placeholder="Password" />'
    +'<select id="tr" style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:7px;color:#ccc;padding:7px 10px;font-size:12px;outline:none"><option value="agent">Agent</option><option value="admin">Admin</option></select>'
    +'<button class="btn btnp" onclick="addMember()">Add</button></div>'
    +'<div class="member-list" id="ml">'
    +team.map(t=>'<div class="ml-item"><div><div class="ml-name">'+esc(t.name)+'</div><div class="ml-email">'+esc(t.email)+' &bull; '+t.role+'</div></div>'
      +'<button class="rm-btn" onclick="removeMember('+t.id+')">Remove</button></div>').join('')
    +'</div></div>';
}

async function addMember(){
  const name=document.getElementById('tn').value,email=document.getElementById('te').value,pw=document.getElementById('tp').value,role=document.getElementById('tr').value;
  if(!name||!email||!pw)return alert('All fields required');
  const res=await fetch('/dashboard/api/team?token='+TOKEN,{method:'POST',headers:H,body:JSON.stringify({name,email,password:pw,role})});
  const data=await res.json();
  if(data.ok){alert('Added. Their login token: '+data.token);showTeamPanel()}
  else alert('Error: '+data.error);
}

async function removeMember(id){
  if(!confirm('Remove this team member?'))return;
  await fetch('/dashboard/api/team/'+id+'?token='+TOKEN,{method:'DELETE',headers:H});
  showTeamPanel();
}

load();loadStats();
setInterval(()=>{load();loadStats();if(currentContact){const el=document.getElementById('refreshed');if(el)el.textContent='updated '+new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}},30000);
</script>
</body></html>`);
});

export default router;
