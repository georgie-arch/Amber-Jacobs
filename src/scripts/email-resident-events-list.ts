/**
 * Send full event registration list (successful only) to wetheindvstry@gmail.com
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const events = [
  { name: 'FQ Beach @ Cannes Lions 2026',                     url: 'https://events.thefemalequotient.com/canneslions26',                                    notes: 'All residents' },
  { name: 'Financial Times Cannes 2026',                       url: 'https://ftcannes.live.ft.com/',                                                         notes: 'All villa residents except LaToya (failed)' },
  { name: 'Adweek House @ Cannes 2026',                        url: 'https://event.adweek.com/awh-cannes-2026?i=gho58DOhLPQoqP4RT-KYMmCZ0vfBYPxe',          notes: 'All residents' },
  { name: 'DEPT Agency @ Cannes Lions 2026',                   url: 'https://www.deptagency.com/event/cannes-lions-2026/?utm_source=mailing&utm_medium=email&utm_campaign=gl-cannes-2026-invite-oi', notes: 'All residents' },
  { name: 'The Cannes Social 2026 (ExchangeWire)',             url: 'https://events.exchangewire.com/TheCannesSocial2026',                                    notes: 'All residents' },
  { name: 'AI & Tech Sandbox @ Cannes Lions 2026',             url: 'https://aiandtechsandbox.com/',                                                         notes: 'All residents' },
  { name: 'Pinterest Manifestival @ Cannes Lions 2026',        url: 'https://pinterestcannes.com/',                                                          notes: 'All residents' },
  { name: 'ADWEEK House',                                      url: 'https://event.adweek.com/awh-cannes-2026',                                              notes: 'All residents' },
  { name: 'Brands & Culture Villa',                            url: 'https://www.brandsnculture.com/bc-cannes/',                                             notes: 'All residents' },
  { name: 'Cannes Lions Creators Beach',                       url: 'https://www.canneslions.com/festival/experiences/lions-creators',                       notes: 'All residents' },
  { name: 'Digiday @ Cannes',                                  url: 'https://digiday.com/events/digiday-in-cannes/',                                         notes: 'All residents' },
  { name: 'Maison New Digital Age',                            url: 'https://newdigitalage.co/nda-events/cannes-2026/',                                      notes: 'All residents' },
  { name: 'The LWS Salon',                                     url: 'https://www.canva.com/design/DAG_vknJW98/1kOxDg1YPeKrail4eCpouw/view',                 notes: 'All residents' },
  { name: 'Cannes Brand Leaders Dinner (Digiday)',             url: 'https://digiday.com/events/cannes-brand-leaders-dinner/',                               notes: 'All residents' },
  { name: 'Cannes Marketing Leaders Brunch (Digiday)',         url: 'https://digiday.com/events/cannes-marketing-leaders-brunch/',                           notes: 'All residents' },
  { name: 'Cannes Panel & Cocktail Reception (Digiday)',       url: 'https://ti.to/digiday/cannes-panel-cocktail-reception/with/7jc925nhcsa',                notes: 'All residents' },
  { name: 'Le Club MSQ',                                       url: 'https://connect.msqpartners.com/le-club-msq-2026',                                      notes: 'All residents' },
  { name: 'Cocktail Hour in Cannes (Covatic)',                 url: 'https://covatic.com/join-us-for-cocktails-at-the-barrel-pub-in-cannes/',                 notes: 'All residents' },
  { name: 'WIN Lounge',                                        url: 'https://www.womeninspiringnetwork.com/cannes-2026/',                                    notes: 'All residents' },
  { name: 'Sport Beach @ Cannes 2026',                         url: 'https://www.sportbeach.com/cannes2026/register',                                        notes: 'All residents' },
];

function buildHtml(): string {
  const rows = events.map((e, i) =>
    `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'};">
      <td style="padding:10px 12px;font-size:13px;font-weight:500;">${i + 1}. ${e.name}</td>
      <td style="padding:10px 12px;font-size:12px;"><a href="${e.url}" style="color:#1a1a1a;word-break:break-all;">${e.url}</a></td>
      <td style="padding:10px 12px;font-size:12px;color:#666;">${e.notes}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:900px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <p>Hi George,</p>
  <p>Here is the full list of events all Indvstry Power House residents have been successfully registered for so far. <strong>${events.length} events total.</strong></p>
  <p style="font-size:12px;color:#888;margin-bottom:20px;">Note: LaToya Shambo did not complete registration for Financial Times Cannes 2026 (technical failure on that form). All other residents are confirmed on that event.</p>

  <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:13px;">
    <thead>
      <tr style="background:#1a1a1a;color:#ffffff;">
        <th style="padding:10px 12px;text-align:left;width:35%;">Event</th>
        <th style="padding:10px 12px;text-align:left;width:45%;">Registration Link</th>
        <th style="padding:10px 12px;text-align:left;width:20%;">Residents</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <p style="margin-top:24px;font-size:12px;color:#888;">We continue to add new events as they open up. This list will be updated and resent as more registrations are confirmed.</p>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:14px;font-weight:bold;">Amber Jacobs</p>
    <p style="margin:0;font-size:12px;color:#555;">Community Manager, Indvstry Clvb</p>
  </div>
</body></html>`;
}

async function main() {
  const token = await getToken();

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: `IPH Resident Event Registrations — ${events.length} events confirmed`,
        body: { contentType: 'HTML', content: buildHtml() },
        toRecipients: [{ emailAddress: { address: 'wetheindvstry@gmail.com', name: 'George' } }],
        from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'Amber Jacobs' } },
      }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log(`Sent to wetheindvstry@gmail.com — ${events.length} events listed`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
