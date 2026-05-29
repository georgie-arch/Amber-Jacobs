import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const response = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

async function main() {
  const token = await getAccessToken();

  // Check if folder already exists
  const existingRes = await axios.get(
    'https://graph.microsoft.com/v1.0/me/mailFolders',
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const folders = existingRes.data.value || [];
  const existing = folders.find((f: any) =>
    f.displayName === 'Speaker Enquiries — Cannes 2026'
  );

  if (existing) {
    console.log(`📁 Folder already exists: "${existing.displayName}" (${existing.id})`);
    return;
  }

  // Create the folder
  const createRes = await axios.post(
    'https://graph.microsoft.com/v1.0/me/mailFolders',
    { displayName: 'Speaker Enquiries — Cannes 2026' },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log(`✅ Folder created: "${createRes.data.displayName}" (${createRes.data.id})`);
  console.log('Move speaker enquiry emails into this folder in access@indvstryclvb.com');
}

main().catch(err => {
  console.error('❌ Error:', err?.response?.data || err.message);
  process.exit(1);
});
