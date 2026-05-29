/**
 * George follows up with UTA (Charlotte Perman + COP assistant) re: Dr. Marcus Collins
 * for DEPT Secret Garden panel at Cannes Lions 2026.
 * Clarifies: fringe event (not official Cannes program), covers travel/accom/ground.
 * CC: Dr. Marcus Collins directly.
 *
 * Run: npx ts-node --project tsconfig.json src/scripts/email-uta-marcus-george-followup.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id:     process.env.OUTLOOK_CLIENT_ID     || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type:    'refresh_token',
      scope:         'https://graph.microsoft.com/Mail.Send offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

const body = `Hi Charlotte,

My name is George Guise, founder of Indvstry Clvb. My colleague Amber reached out a while back about the possibility of having Marcus join our panel at Cannes Lions. We did not hear back and wanted to follow up directly, with a couple of important things to clarify.

First, the event is not part of the official Cannes Lions programme. It is a separate fringe event hosted at DEPT Agency's Secret Garden activation on the Croisette, which is one of the most premium invite-only environments at the festival during Lions week. DEPT have shown real interest in having Marcus as a speaker, and it is something we would love to make happen.

Second, we are able to cover Marcus's travel, accommodation and ground arrangements in Cannes in full. We want to make this as straightforward as possible for him and for your team.

The panel, "The Algorithm Doesn't Know Your Culture", is on Wednesday 25 June. The audience is C-suite brand, marketing and tech leaders and Marcus's work in For The Culture is genuinely the intellectual foundation of the whole conversation.

Would love to know if this is a possibility. Happy to jump on a call at any time that suits.

George Guise
Founder, Indvstry Clvb
Powerhouse.indvstryclvb.com`;

async function main() {
  const token = await getAccessToken();

  await axios.post(
    'https://graph.microsoft.com/v1.0/me/sendMail',
    {
      message: {
        subject: 'Following up — Marcus Collins, DEPT Secret Garden panel, Cannes Lions 2026',
        body: { contentType: 'Text', content: body },
        toRecipients: [
          { emailAddress: { address: 'copassistant@unitedtalent.com', name: 'UTA COP Assistant' } },
          { emailAddress: { address: 'Charlotte.Perman@unitedtalent.com', name: 'Charlotte Perman' } },
        ],
        ccRecipients: [
          { emailAddress: { address: 'collinsm@umich.edu', name: 'Dr. Marcus Collins' } },
        ],
        from: { emailAddress: { address: 'access@indvstryclvb.com', name: 'George Guise' } },
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  console.log('Email sent to Charlotte Perman + COP assistant, CC: Dr. Marcus Collins.');
}

main().catch(e => {
  console.error(e?.response?.data || e.message);
  process.exit(1);
});
