/**
 * email-awe-targets-followup.ts
 *
 * Follow-up to all AWE / Cannes outreach targets we have already contacted.
 * Sent from George as a warm check-in re: Power House Cannes Lions 2026.
 *
 * Excludes bounced contacts:
 *   - Jason Mander (GWI) — bounced
 *   - Rob Gillies (Vevo) — unverified
 *   - Lindsay Sheridan (Trainline) — bounced
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-awe-targets-followup.ts
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

function buildHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 20px;line-height:1.6;">
  <div>
    Hi ${firstName},<br><br>

    Just circling back on my previous note about Indvstry Power House at Cannes Lions 2026.<br><br>

    We are building something genuinely different this year — a private villa activation running 21-26 June with a curated group of senior brand leaders, CMOs and cultural operators. It is designed to be the alternative to the overcrowded beach activations: intimate, high-level and actually worth your time.<br><br>

    Would love to get 20 minutes with you to walk through how we see your brand fitting into it. You can book directly here: <a href="https://calendly.com/itsvisionnaire/30min" style="color:#1a1a1a;">calendly.com/itsvisionnaire/30min</a><br><br>

    Or take a look at what we are building: <a href="https://powerhouse.indvstryclvb.com" style="color:#1a1a1a;">powerhouse.indvstryclvb.com</a><br><br>

    Hope to connect soon.
  </div>
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e0e0e0;">
    <p style="margin:0 0 2px 0;font-size:16px;font-weight:bold;">George Guise</p>
    <p style="margin:0 0 14px 0;font-size:13px;color:#555;">Founder, Indvstry Clvb</p>
    <p style="margin:0 0 16px 0;"><a href="http://www.indvstryclvb.com" style="color:#1a1a1a;">www.indvstryclvb.com</a></p>
    <p style="margin:0 0 8px 0;font-size:11px;color:#888;">&copy; Copyright 2026 INDVSTRY CLVB, All Rights Reserved.</p>
    <p style="margin:0;font-size:10px;color:#aaa;line-height:1.5;">Confidential Information: This e-mail is intended only for the individual named on this transmission; it is not to be forwarded to third parties. You are hereby notified that any disclosure or distribution, without the express written consent of the sender, is unauthorised. If you received this e-mail in error, please delete the message immediately.</p>
  </div>
</body>
</html>`;
}

const recipients: { name: string; email: string; firstName: string }[] = [
  // SPOTIFY
  { name: 'Brian Berner',        email: 'brian.berner@spotify.com',         firstName: 'Brian' },
  { name: 'Bridget Evans',       email: 'bridget.evans@spotify.com',        firstName: 'Bridget' },
  { name: 'Emma Vaughn',         email: 'emma.vaughn@spotify.com',          firstName: 'Emma' },
  { name: 'Keyana Kashfi',       email: 'keyana.kashfi@spotify.com',        firstName: 'Keyana' },
  { name: 'Kay Hsu',             email: 'kay.hsu@spotify.com',              firstName: 'Kay' },
  // META
  { name: 'Nicola Mendelsohn',   email: 'nicola.mendelsohn@meta.com',       firstName: 'Nicola' },
  { name: 'Damien Baines',       email: 'damien.baines@meta.com',           firstName: 'Damien' },
  { name: 'Helen Ma',            email: 'helen.ma@meta.com',                firstName: 'Helen' },
  // LINKEDIN
  { name: 'Matthew Derella',     email: 'matthew.derella@linkedin.com',     firstName: 'Matthew' },
  { name: 'Jessica Jensen',      email: 'jessica.jensen@linkedin.com',      firstName: 'Jessica' },
  { name: 'Danielle Damiano',    email: 'danielle.damiano@linkedin.com',    firstName: 'Danielle' },
  { name: 'Allyson Hugley',      email: 'allyson.hugley@linkedin.com',      firstName: 'Allyson' },
  // DISNEY
  { name: 'Rita Ferro',          email: 'rita.ferro@disney.com',            firstName: 'Rita' },
  { name: 'Dana McGraw',         email: 'dana.mcgraw@disney.com',           firstName: 'Dana' },
  { name: 'Jamie Power',         email: 'jamie.power@disney.com',           firstName: 'Jamie' },
  // LIVERAMP
  { name: 'Vihan Sharma',        email: 'vihan.sharma@liveramp.com',        firstName: 'Vihan' },
  { name: 'Scott Howe',          email: 'scott.howe@liveramp.com',          firstName: 'Scott' },
  // MAGNITE
  { name: 'Michael Barrett',     email: 'mbarrett@magnite.com',             firstName: 'Michael' },
  { name: 'Kristen Williams',    email: 'kristen.williams@magnite.com',     firstName: 'Kristen' },
  { name: 'Sean Buckley',        email: 'sean.buckley@magnite.com',         firstName: 'Sean' },
  // PAYPAL ADS
  { name: 'Mark Grether',        email: 'mark.grether@paypal.com',          firstName: 'Mark' },
  // EXPEDIA
  { name: 'Ariane Gorin',        email: 'ariane.gorin@expediagroup.com',    firstName: 'Ariane' },
  { name: 'Jochen Koedijk',      email: 'jochen.koedijk@expediagroup.com',  firstName: 'Jochen' },
  // GWI
  { name: 'GWI Partnerships',    email: 'partnerships@gwi.com',             firstName: 'team' },
  // MICROSOFT / XBOX
  { name: 'Marcos Waltenberg',   email: 'marcos.waltenberg@microsoft.com',  firstName: 'Marcos' },
  // VEVO
  { name: 'Kevin McGurn',        email: 'kevin.mcgurn@vevo.com',            firstName: 'Kevin' },
  // EXPERIAN
  { name: 'Greg Koerner',        email: 'greg.koerner@experian.com',        firstName: 'Greg' },
  { name: 'Budi Tanzi',          email: 'budi.tanzi@experian.com',          firstName: 'Budi' },
  // MONKS
  { name: 'Victor Knaap',        email: 'victor.knaap@monks.com',           firstName: 'Victor' },
  { name: 'Justin Billingsley',  email: 'justin.billingsley@monks.com',     firstName: 'Justin' },
  { name: 'Dave Meeker',         email: 'dave.meeker@monks.com',            firstName: 'Dave' },
  // YMU
  { name: 'Mary Bekhait',        email: 'mary.bekhait@ymugroup.com',        firstName: 'Mary' },
  // MEDIA PARTNERS
  { name: 'The Drum',            email: 'hello@thedrum.com',                firstName: 'team' },
  { name: 'New Digital Age',     email: 'editorial@newdigitalage.co.uk',    firstName: 'team' },
];

async function sendAll(): Promise<void> {
  const token = await getToken();
  let sent = 0;

  for (const r of recipients) {
    try {
      await axios.post(
        'https://graph.microsoft.com/v1.0/me/sendMail',
        {
          message: {
            subject: 'Indvstry Power House x Cannes Lions 2026 — following up',
            body: { contentType: 'HTML', content: buildHtml(r.firstName) },
            toRecipients: [{ emailAddress: { address: r.email, name: r.name } }],
            from: { emailAddress: { address: process.env.EMAIL_USER || '', name: 'George Guise' } },
          }
        },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      sent++;
      console.log(`[${sent}/${recipients.length}] Sent to ${r.name} <${r.email}>`);
    } catch (err: any) {
      console.error(`FAILED: ${r.name} <${r.email}> — ${err?.response?.data?.error?.message || err.message}`);
    }
    await new Promise(res => setTimeout(res, 1200));
  }

  console.log(`\nDone. ${sent}/${recipients.length} follow-up emails sent.`);
}

sendAll().catch(console.error);
