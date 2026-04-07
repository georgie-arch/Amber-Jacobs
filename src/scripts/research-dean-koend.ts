/**
 * research-dean-koend.ts
 * Scrape Dean Koend's LinkedIn profile via Apify.
 * Run: npx ts-node --project tsconfig.json src/scripts/research-dean-koend.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const APIFY_KEY = process.env.APIFY_API_KEY || '';
const ACTOR = 'dev_fusion~linkedin-profile-scraper';

async function runActor(profileUrl: string): Promise<any> {
  // Start the run
  const start = await axios.post(
    `https://api.apify.com/v2/acts/${ACTOR}/runs`,
    { profileUrls: [profileUrl] },
    { headers: { Authorization: `Bearer ${APIFY_KEY}`, 'Content-Type': 'application/json' } }
  );
  const runId = start.data.data.id;
  console.log(`Apify run started: ${runId}`);

  // Poll until finished
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const status = await axios.get(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: { Authorization: `Bearer ${APIFY_KEY}` } }
    );
    const s = status.data.data.status;
    console.log(`Status: ${s}`);
    if (s === 'SUCCEEDED') {
      const results = await axios.get(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items`,
        { headers: { Authorization: `Bearer ${APIFY_KEY}` } }
      );
      return results.data;
    }
    if (s === 'FAILED' || s === 'ABORTED') throw new Error(`Run ${s}`);
  }
  throw new Error('Timed out');
}

async function main() {
  // Try to find Dean Koend on LinkedIn
  console.log('Searching for Dean Koend on LinkedIn via Apify...\n');

  const profileUrl = 'https://www.linkedin.com/in/dean-koend/';
  try {
    const data = await runActor(profileUrl);
    console.log('\n=== PROFILE DATA ===');
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Profile scrape failed:', err.message);
    // Try alternate slug
    console.log('\nTrying alternate slug...');
    try {
      const data2 = await runActor('https://www.linkedin.com/in/deankoend/');
      console.log('\n=== PROFILE DATA (alt slug) ===');
      console.log(JSON.stringify(data2, null, 2));
    } catch (err2: any) {
      console.error('Alt slug also failed:', err2.message);
    }
  }
}

main().catch(console.error);
