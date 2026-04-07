#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// LinkedIn OAuth2 Auth Flow — Interactive CLI
// Run: npm run linkedin:auth
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import http from 'http';
import { URL } from 'url';
import readline from 'readline';
import { getLinkedInAuthUrl, exchangeLinkedInCode, getLinkedInMe } from '../integrations/linkedin';

dotenv.config();

const REDIRECT_URI = 'http://localhost:3333/auth/linkedin/callback';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer.trim()); }));
}

// ─── Spin up a one-shot local server to catch the redirect ───────

function waitForCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, `http://localhost:3333`);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(400);
        res.end(`<h2>Auth failed: ${error}</h2><p>Close this tab.</p>`);
        server.close();
        reject(new Error(`LinkedIn auth error: ${error}`));
        return;
      }

      if (code) {
        res.writeHead(200);
        res.end(`<h2>✅ Authorised!</h2><p>You can close this tab. Return to your terminal.</p>`);
        server.close();
        resolve(code);
      }
    });

    server.listen(3333, () => {
      console.log('\n🔁 Waiting for LinkedIn redirect on http://localhost:3333 ...');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Timed out waiting for LinkedIn callback'));
    }, 5 * 60 * 1000);
  });
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔐  LinkedIn OAuth2 — Amber Jacobs Auth Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    console.error('❌  LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET missing in .env');
    process.exit(1);
  }

  // Make sure redirect URI is registered in your LinkedIn app settings
  console.log('ℹ️  Make sure this redirect URI is added in your LinkedIn app settings:');
  console.log(`   ${REDIRECT_URI}\n`);

  const proceed = await prompt('Continue? (y/n): ');
  if (proceed.toLowerCase() !== 'y') { console.log('Aborted.'); process.exit(0); }

  // Step 1 — Generate auth URL
  const authUrl = getLinkedInAuthUrl(REDIRECT_URI);
  console.log('\n📎 Opening auth URL...');
  console.log(`\n${authUrl}\n`);
  console.log('👆 Open that URL in your browser and log in with the Indvstry Clvb LinkedIn account.\n');

  // Step 2 — Wait for redirect
  let code: string;
  try {
    code = await waitForCode();
    console.log(`\n✅ Auth code received.`);
  } catch (err: any) {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
  }

  // Step 3 — Exchange for token
  console.log('\n🔄 Exchanging code for access token...');
  const token = await exchangeLinkedInCode(code, REDIRECT_URI);

  if (!token) {
    console.error('❌ Token exchange failed. Check your Client ID and Secret.');
    process.exit(1);
  }

  console.log('\n✅ Access token saved to .env (LINKEDIN_ACCESS_TOKEN)');

  // Step 4 — Verify
  console.log('\n🧪 Verifying token with GET /v2/me...');
  const profile = await getLinkedInMe();

  if (profile) {
    console.log('\n✅ LinkedIn connected successfully!');
    console.log(`   Name: ${profile.localizedFirstName} ${profile.localizedLastName}`);
    console.log(`   ID:   ${profile.id}`);
  } else {
    console.log('\n⚠️  Token saved but /v2/me returned nothing — scope may be limited.');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Done. Amber is ready to use LinkedIn.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
