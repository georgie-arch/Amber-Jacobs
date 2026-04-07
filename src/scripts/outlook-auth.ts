#!/usr/bin/env ts-node
// ─────────────────────────────────────────────────────────────────
// Outlook OAuth2 — get refresh token for access@indvstryclvb.com
// Run: npx ts-node src/scripts/outlook-auth.ts
// ─────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { exec } from 'child_process';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const TENANT_ID = process.env.OUTLOOK_TENANT_ID!;
const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID!;
const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET!;
const REDIRECT_URI = 'http://localhost:3333/callback';
const SCOPES = 'https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite offline_access';

const authUrl =
  `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&response_mode=query`;

function persistEnvValue(key: string, value: string) {
  const envPath = path.resolve(process.cwd(), '.env');
  let content = fs.readFileSync(envPath, 'utf-8');
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, content, 'utf-8');
}

async function exchangeCode(code: string): Promise<void> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    scope: SCOPES,
  });

  const res = await axios.post(
    `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    params.toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const { access_token, refresh_token } = res.data;

  if (!refresh_token) throw new Error('No refresh token returned — make sure offline_access scope is granted');

  persistEnvValue('OUTLOOK_REFRESH_TOKEN', refresh_token);
  console.log('\n✅ Refresh token saved to .env');
  console.log('✅ Email is ready — access@indvstryclvb.com can now send via Amber\n');
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  📧  Outlook OAuth2 — Amber Jacobs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Opening browser... Sign in as access@indvstryclvb.com\n');

  // Open browser
  exec(`open "${authUrl}"`);

  // Start local server to catch redirect
  await new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, 'http://localhost:3333');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`<h2>Error: ${error}</h2><p>${url.searchParams.get('error_description')}</p>`);
        server.close();
        reject(new Error(error));
        return;
      }

      if (code) {
        res.end('<h2>✅ Authenticated! You can close this tab.</h2>');
        server.close();
        try {
          await exchangeCode(code);
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    });

    server.listen(3333, () => {
      console.log('Waiting for login at http://localhost:3333/callback ...');
    });
  });
}

main().catch(err => {
  console.error('Auth failed:', err.message);
  process.exit(1);
});
