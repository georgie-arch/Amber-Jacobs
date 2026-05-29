/**
 * refresh-instagram-token.ts
 *
 * Exchanges the current Instagram access token for a fresh long-lived token
 * (valid for 60 days from today). Run this every ~55 days to keep Amber alive.
 *
 * Two modes:
 *   --check    Print current token expiry date, do nothing else
 *   (default)  Refresh the token and print the new value + expiry
 *
 * After running, paste the new INSTAGRAM_ACCESS_TOKEN value into .env.
 *
 * Run:
 *   npx ts-node --project tsconfig.json src/scripts/refresh-instagram-token.ts --check
 *   npx ts-node --project tsconfig.json src/scripts/refresh-instagram-token.ts
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const GRAPH_API = 'https://graph.facebook.com/v21.0';
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN!;
const META_APP_ID = process.env.META_APP_ID!;
const META_APP_SECRET = process.env.META_APP_SECRET!;

async function checkToken(): Promise<void> {
  console.log('\nChecking current token...');
  try {
    const res = await axios.get(`https://graph.facebook.com/debug_token`, {
      params: {
        input_token: ACCESS_TOKEN,
        access_token: `${META_APP_ID}|${META_APP_SECRET}`,
      },
    });

    const data = res.data?.data;
    if (!data) {
      console.log('No token debug data returned.');
      return;
    }

    const isValid: boolean = data.is_valid;
    const expiresAt: number = data.expires_at;
    const expiryDate = expiresAt ? new Date(expiresAt * 1000).toISOString() : 'never (permanent)';
    const daysLeft = expiresAt
      ? Math.round((expiresAt * 1000 - Date.now()) / 86_400_000)
      : Infinity;

    console.log(`\nToken status   : ${isValid ? 'VALID' : 'INVALID / EXPIRED'}`);
    console.log(`Expires at     : ${expiryDate}`);
    console.log(`Days remaining : ${isFinite(daysLeft) ? daysLeft : 'unlimited'}`);
    console.log(`App ID         : ${data.app_id}`);
    console.log(`Scopes         : ${(data.scopes || []).join(', ')}`);

    if (isValid && isFinite(daysLeft) && daysLeft < 14) {
      console.log('\n⚠️  Token expires in under 14 days — run without --check to refresh it now.');
    } else if (!isValid) {
      console.log('\n❌  Token is invalid. You need to generate a new one from Meta Business Manager.');
      console.log('   Go to: https://developers.facebook.com → Your App → Tools → Graph API Explorer');
    } else {
      console.log('\n✅  Token is healthy.');
    }
  } catch (err: any) {
    console.error('Token check failed:', err.response?.data || err.message);
  }
}

async function refreshToken(): Promise<void> {
  console.log('\nRefreshing Instagram access token...');
  try {
    // Exchange current token for a new long-lived token (another 60 days)
    const res = await axios.get(`https://graph.instagram.com/refresh_access_token`, {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: ACCESS_TOKEN,
      },
    });

    const newToken: string = res.data?.access_token;
    const expiresIn: number = res.data?.expires_in; // seconds
    const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString();

    if (!newToken) {
      console.error('No token returned. Response:', res.data);
      process.exit(1);
    }

    console.log('\n✅ Token refreshed successfully!');
    console.log(`New expiry: ${expiryDate} (${Math.round(expiresIn / 86400)} days)`);
    console.log('\n─────────────────────────────────────────────────────');
    console.log('Paste this into .env as INSTAGRAM_ACCESS_TOKEN:');
    console.log('─────────────────────────────────────────────────────');
    console.log(newToken);
    console.log('─────────────────────────────────────────────────────\n');
  } catch (err: any) {
    const errData = err.response?.data;
    console.error('Token refresh failed:', errData || err.message);

    if (errData?.error?.code === 190) {
      console.log('\n❌  Token has already expired — cannot refresh. You must generate a new one.');
      console.log('   Go to: https://developers.facebook.com → Your App → Tools → Graph API Explorer');
      console.log('   Request permissions: instagram_basic, instagram_manage_messages, instagram_manage_comments, pages_messaging');
      console.log('   Then exchange for a long-lived token via:');
      console.log(`   GET https://graph.facebook.com/v21.0/oauth/access_token`);
      console.log(`      ?grant_type=fb_exchange_token`);
      console.log(`      &client_id=${META_APP_ID}`);
      console.log(`      &client_secret=${META_APP_SECRET}`);
      console.log(`      &fb_exchange_token={your_short_lived_token}`);
    }
    process.exit(1);
  }
}

async function main(): Promise<void> {
  if (!ACCESS_TOKEN) {
    console.error('INSTAGRAM_ACCESS_TOKEN not set in .env');
    process.exit(1);
  }
  if (!META_APP_ID || !META_APP_SECRET) {
    console.error('META_APP_ID and META_APP_SECRET must be set in .env for token check');
    process.exit(1);
  }

  const isCheck = process.argv.includes('--check');
  if (isCheck) {
    await checkToken();
  } else {
    await checkToken();
    await refreshToken();
  }
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
