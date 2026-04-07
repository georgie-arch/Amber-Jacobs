import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getToken() {
  const tenantId = process.env.OUTLOOK_TENANT_ID || 'common';
  const r = await axios.post(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
      refresh_token: process.env.OUTLOOK_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Mail.ReadWrite offline_access'
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return r.data.access_token;
}

async function search(token: string, q: string) {
  const r = await axios.get(
    `https://graph.microsoft.com/v1.0/me/messages?$search="${q}"&$top=20`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return r.data.value || [];
}

async function main() {
  const token = await getToken();

  const transportTerms = ['transportation', 'transfer', 'limousine', 'chauffeur', 'shuttle', 'transponyx', 'kingdom limousines', 'azur', 'riviera', 'eden cab', 'flash azur', 'avantgarde', 'chabe', 'classedriver', 'travel-limousines', 'wheelsfrance'];
  const dinnerTerms = ['dinner enquiry', 'plage', 'bijou', 'mome', 'epi beach', 'belles rives', 'paseo', 'miramar', 'vega', 'long beach', 'cbeach', 'plage du festival'];

  console.log('\n======= TRANSPORT REPLIES =======');
  const transportSeen = new Set<string>();
  for (const term of transportTerms) {
    const msgs = await search(token, term);
    for (const m of msgs) {
      if (transportSeen.has(m.id)) continue;
      transportSeen.add(m.id);
      const fromAddr = m.from?.emailAddress?.address || '';
      if (fromAddr.toLowerCase().includes('indvstryclvb')) continue; // skip our sent
      console.log(`\nFROM: ${m.from?.emailAddress?.name} <${fromAddr}>`);
      console.log(`SUBJECT: ${m.subject}`);
      console.log(`DATE: ${m.receivedDateTime}`);
      console.log(`ID: ${m.id}`);
      console.log(`PREVIEW: ${m.bodyPreview?.substring(0, 400)}`);
      console.log('---');
    }
  }

  console.log('\n\n======= DINNER/VENUE REPLIES =======');
  const dinnerSeen = new Set<string>();
  for (const term of dinnerTerms) {
    const msgs = await search(token, term);
    for (const m of msgs) {
      if (dinnerSeen.has(m.id)) continue;
      dinnerSeen.add(m.id);
      const fromAddr = m.from?.emailAddress?.address || '';
      if (fromAddr.toLowerCase().includes('indvstryclvb')) continue;
      console.log(`\nFROM: ${m.from?.emailAddress?.name} <${fromAddr}>`);
      console.log(`SUBJECT: ${m.subject}`);
      console.log(`DATE: ${m.receivedDateTime}`);
      console.log(`ID: ${m.id}`);
      console.log(`PREVIEW: ${m.bodyPreview?.substring(0, 400)}`);
      console.log('---');
    }
  }
}
main().catch(console.error);
