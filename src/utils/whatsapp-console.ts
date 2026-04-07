import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const router = express.Router();

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const CONSOLE_PASSWORD = process.env.CONSOLE_PASSWORD || 'indvstry2024';
const WA_BASE = 'https://graph.facebook.com/v18.0';

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers['x-console-token'] || req.query.token;
  if (token === CONSOLE_PASSWORD) return next();
  res.status(401).json({ error: 'Unauthorised' });
}

// ─── SEND MESSAGE API ─────────────────────────────────────────────

router.post('/api/send', requireAuth, async (req, res) => {
  const { to, message, type = 'text', mediaUrl, caption, filename } = req.body;

  if (!to || (!message && !mediaUrl)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Normalise number — strip spaces, ensure no + prefix issue
  const toNumber = to.replace(/\s+/g, '').replace(/^\+/, '');

  let body: any = { messaging_product: 'whatsapp', to: toNumber };

  if (type === 'text') {
    body.type = 'text';
    body.text = { body: message, preview_url: true };
  } else if (type === 'image') {
    body.type = 'image';
    body.image = { link: mediaUrl, ...(caption && { caption }) };
  } else if (type === 'document') {
    body.type = 'document';
    body.document = { link: mediaUrl, filename: filename || 'document.pdf', ...(caption && { caption }) };
  } else if (type === 'video') {
    body.type = 'video';
    body.video = { link: mediaUrl, ...(caption && { caption }) };
  }

  try {
    const response = await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json() as any;

    if (!response.ok) {
      return res.status(400).json({ error: data.error?.message || 'Send failed', detail: data });
    }

    res.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET CONTACTS / RECENT MESSAGES ──────────────────────────────

router.get('/api/contacts', requireAuth, async (req, res) => {
  // Return contacts from WhatsApp Business account
  try {
    const response = await fetch(
      `${WA_BASE}/${PHONE_NUMBER_ID}?fields=display_phone_number,verified_name&access_token=${ACCESS_TOKEN}`
    );
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SERVE THE CONSOLE UI ─────────────────────────────────────────

router.get('/', (req, res) => {
  const password = req.query.token as string;
  const html = buildConsoleHtml(password || '');
  res.send(html);
});

// ─── HTML UI ─────────────────────────────────────────────────────

function buildConsoleHtml(token: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Amber — WhatsApp Console</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0d0d0d;
      color: #f0f0f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    header {
      background: #111;
      border-bottom: 1px solid #222;
      padding: 18px 32px;
      display: flex;
      align-items: center;
      gap: 14px;
    }

    header .logo {
      width: 36px; height: 36px;
      background: #25D366;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }

    header h1 { font-size: 16px; font-weight: 600; letter-spacing: 0.3px; }
    header p  { font-size: 12px; color: #666; margin-top: 1px; }

    .badge {
      margin-left: auto;
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 11px;
      color: #888;
    }

    main {
      flex: 1;
      max-width: 640px;
      width: 100%;
      margin: 40px auto;
      padding: 0 20px;
    }

    .card {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 20px;
    }

    .card h2 {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #666;
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 12px;
      color: #888;
      margin-bottom: 6px;
      margin-top: 16px;
    }
    label:first-of-type { margin-top: 0; }

    input, textarea, select {
      width: 100%;
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      border-radius: 8px;
      color: #f0f0f0;
      padding: 10px 14px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
      outline: none;
    }

    input:focus, textarea:focus, select:focus {
      border-color: #25D366;
    }

    textarea { resize: vertical; min-height: 100px; line-height: 1.5; }

    select option { background: #1a1a1a; }

    .media-fields { display: none; margin-top: 0; }
    .media-fields.visible { display: block; }

    .send-btn {
      width: 100%;
      background: #25D366;
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      transition: background 0.2s, transform 0.1s;
    }

    .send-btn:hover  { background: #20c25a; }
    .send-btn:active { transform: scale(0.99); }
    .send-btn:disabled { background: #1a3d27; color: #3a7a4a; cursor: not-allowed; }

    .toast {
      display: none;
      margin-top: 14px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.4;
    }
    .toast.success { background: #0d2b18; border: 1px solid #1a5c30; color: #4ade80; display: block; }
    .toast.error   { background: #2b0d0d; border: 1px solid #5c1a1a; color: #f87171; display: block; }

    .quick-replies {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .quick-btn {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 20px;
      color: #ccc;
      font-size: 12px;
      padding: 5px 12px;
      cursor: pointer;
      transition: border-color 0.2s;
    }
    .quick-btn:hover { border-color: #25D366; color: #25D366; }

    .recent {
      margin-top: 8px;
    }

    .sent-item {
      background: #0d0d0d;
      border: 1px solid #1a1a1a;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .sent-item .meta {
      display: flex;
      justify-content: space-between;
      color: #555;
      font-size: 11px;
      margin-bottom: 4px;
    }

    .sent-item .to   { color: #25D366; }
    .sent-item .body { color: #ccc; line-height: 1.4; }

    .auth-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 16px;
    }

    .auth-screen h2 { font-size: 18px; color: #ccc; }
    .auth-screen p  { font-size: 13px; color: #555; }

    .auth-form {
      background: #111;
      border: 1px solid #222;
      border-radius: 12px;
      padding: 28px;
      width: 320px;
    }
  </style>
</head>
<body>

${token ? `
<!-- AUTHENTICATED UI -->
<header>
  <div class="logo">💬</div>
  <div>
    <h1>Amber — WhatsApp Console</h1>
    <p>Send messages manually from Amber's number</p>
  </div>
  <div class="badge">Indvstry Clvb</div>
</header>

<main>
  <div class="card">
    <h2>Send Message</h2>

    <label>To (WhatsApp number with country code)</label>
    <input type="tel" id="to" placeholder="447700000000" />

    <label>Type</label>
    <select id="type" onchange="toggleMediaFields()">
      <option value="text">Text</option>
      <option value="image">Image</option>
      <option value="video">Video</option>
      <option value="document">Document / PDF</option>
    </select>

    <div id="textField">
      <label>Message</label>
      <textarea id="message" placeholder="Type your message..."></textarea>
      <div class="quick-replies">
        <button class="quick-btn" onclick="setQuick('Hey, just wanted to follow up on your application to Indvstry Clvb.')">Follow up</button>
        <button class="quick-btn" onclick="setQuick('Welcome to Indvstry Clvb! Really glad to have you with us.')">Welcome</button>
        <button class="quick-btn" onclick="setQuick('Happy to jump on a quick call — grab a time here: https://calendar.app.google/t3KmgEHdeiAi6MGm7')">Book call</button>
        <button class="quick-btn" onclick="setQuick('Thanks for reaching out! Let me know if you have any questions about membership.')">Thanks</button>
      </div>
    </div>

    <div class="media-fields" id="mediaFields">
      <label>Media URL (publicly accessible link)</label>
      <input type="url" id="mediaUrl" placeholder="https://..." />
      <label>Caption (optional)</label>
      <input type="text" id="caption" placeholder="Optional caption..." />
      <div id="filenameField" style="display:none">
        <label>Filename</label>
        <input type="text" id="filename" placeholder="document.pdf" />
      </div>
    </div>

    <button class="send-btn" id="sendBtn" onclick="sendMessage()">Send from Amber</button>
    <div class="toast" id="toast"></div>
  </div>

  <div class="card">
    <h2>Sent This Session</h2>
    <div class="recent" id="recent">
      <p style="color:#444; font-size:13px;">Messages sent this session will appear here.</p>
    </div>
  </div>
</main>

<script>
  const TOKEN = '${token}';

  function toggleMediaFields() {
    const type = document.getElementById('type').value;
    document.getElementById('textField').style.display   = type === 'text' ? 'block' : 'none';
    document.getElementById('mediaFields').className = type !== 'text' ? 'media-fields visible' : 'media-fields';
    document.getElementById('filenameField').style.display = type === 'document' ? 'block' : 'none';
  }

  function setQuick(text) {
    document.getElementById('message').value = text;
    document.getElementById('message').focus();
  }

  async function sendMessage() {
    const btn  = document.getElementById('sendBtn');
    const toast = document.getElementById('toast');
    const type  = document.getElementById('type').value;
    const to    = document.getElementById('to').value.trim();

    if (!to) { showToast('error', 'Enter a phone number'); return; }

    const payload = { to, type };
    if (type === 'text') {
      payload.message = document.getElementById('message').value.trim();
      if (!payload.message) { showToast('error', 'Enter a message'); return; }
    } else {
      payload.mediaUrl = document.getElementById('mediaUrl').value.trim();
      payload.caption  = document.getElementById('caption').value.trim();
      if (type === 'document') payload.filename = document.getElementById('filename').value.trim();
      if (!payload.mediaUrl) { showToast('error', 'Enter a media URL'); return; }
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    toast.className = 'toast';

    try {
      const res  = await fetch('/console/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-console-token': TOKEN },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast('success', 'Sent ✓  ID: ' + data.messageId);
        addToRecent(to, type === 'text' ? payload.message : '[' + type + ']');
        document.getElementById('message').value = '';
      } else {
        showToast('error', data.error || 'Send failed');
      }
    } catch (e) {
      showToast('error', 'Network error: ' + e.message);
    }

    btn.disabled = false;
    btn.textContent = 'Send from Amber';
  }

  function showToast(type, msg) {
    const toast = document.getElementById('toast');
    toast.className = 'toast ' + type;
    toast.textContent = msg;
  }

  function addToRecent(to, body) {
    const recent = document.getElementById('recent');
    const time   = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const html   = '<div class="sent-item"><div class="meta"><span class="to">+' + to + '</span><span>' + time + '</span></div><div class="body">' + body + '</div></div>';
    if (recent.querySelector('p')) recent.innerHTML = '';
    recent.insertAdjacentHTML('afterbegin', html);
  }

  // Allow Cmd/Ctrl+Enter to send
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') sendMessage();
  });
</script>
` : `
<!-- LOGIN SCREEN -->
<div class="auth-screen">
  <div class="auth-form">
    <h2 style="margin-bottom:8px">Amber Console</h2>
    <p style="margin-bottom:20px">WhatsApp manual messaging</p>
    <label>Password</label>
    <input type="password" id="pw" placeholder="Enter password" onkeydown="if(event.key==='Enter')login()" />
    <button class="send-btn" onclick="login()" style="margin-top:16px">Sign in</button>
    <div class="toast" id="loginToast"></div>
  </div>
</div>
<script>
  function login() {
    const pw = document.getElementById('pw').value;
    if (!pw) return;
    window.location.href = '/console?token=' + encodeURIComponent(pw);
  }
</script>
`}

</body>
</html>`;
}

export default router;
