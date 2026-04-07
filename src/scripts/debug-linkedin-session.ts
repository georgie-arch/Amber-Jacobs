import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const liAtOld = process.env.LINKEDIN_LI_AT_COOKIE || '';

async function main() {
  // Step 1: Visit profile page — get fresh cookies AND profile page context
  console.log('Fetching Cindy Gallop profile page for fresh cookies...');
  const profileResp = await axios.get('https://www.linkedin.com/in/cindygallop', {
    headers: {
      'Cookie': `li_at=${liAtOld}`,
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const profileCookies: string[] = (profileResp.headers['set-cookie'] as string[]) || [];
  const cookieMap: Record<string, string> = {};

  for (const c of profileCookies) {
    const nameVal = c.split(';')[0];
    const [name, ...rest] = nameVal.split('=');
    cookieMap[name.trim()] = rest.join('=').trim();
  }

  // Use the freshest li_at if server rotated it
  const freshLiAt = cookieMap['li_at'] ? cookieMap['li_at'].replace(/^"|"$/g, '') : liAtOld;
  const csrf = (cookieMap['JSESSIONID'] || '').replace(/^"|"$/g, '');

  console.log('Fresh li_at (first 30):', freshLiAt.substring(0, 30));
  console.log('Fresh CSRF:', csrf);

  // Build full cookie string mimicking browser
  const fullCookie = [
    `li_at=${freshLiAt}`,
    csrf ? `JSESSIONID="${csrf}"` : '',
    cookieMap['bcookie'] ? `bcookie=${cookieMap['bcookie']}` : '',
    cookieMap['bscookie'] ? `bscookie=${cookieMap['bscookie']}` : '',
    cookieMap['lidc'] ? `lidc=${cookieMap['lidc']}` : '',
    cookieMap['lang'] ? `lang=${cookieMap['lang']}` : '',
  ].filter(Boolean).join('; ');

  if (!csrf) {
    console.log('\n⚠️  No JSESSIONID returned from profile page — using env value');
  }

  const envCsrf = (process.env.LINKEDIN_CSRF_TOKEN || '').replace(/^"|"$/g, '');
  const finalCsrf = csrf || envCsrf;
  const finalCookie = csrf ? fullCookie : `li_at=${freshLiAt}; JSESSIONID="${envCsrf}"`;

  console.log('\nAttempting connection request...');
  try {
    const r = await axios.post(
      'https://www.linkedin.com/voyager/api/growth/normInvitations',
      {
        emberEntityName: 'growth/invitation/norm-invitation',
        invitee: {
          'com.linkedin.voyager.growth.invitation.InviteeMember': {
            profileId: 'ACoAAABcaIUB4DthJNNC2W29-wiYS5WGZQLDtwc'
          }
        },
        trackingId: Buffer.from(String(Date.now())).toString('base64'),
        message: 'Hi Cindy, admire your Cannes presence and the conversations you spark. Building a curated creative community. Would love to connect.',
      },
      {
        headers: {
          'Cookie': finalCookie,
          'Csrf-Token': finalCsrf,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Li-Lang': 'en_US',
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.linkedin.normalized+json+2.1',
          'Referer': 'https://www.linkedin.com/in/cindygallop',
          'Origin': 'https://www.linkedin.com',
        }
      }
    );
    console.log('✅ SUCCESS! Status:', r.status);
    console.log('Response:', JSON.stringify(r.data).substring(0, 200));
  } catch(e: any) {
    console.log('❌ FAILED:', e.response?.status);
    console.log('Error body:', JSON.stringify(e.response?.data || {}).substring(0, 300));

    // Check if it's a "can't connect to this person" vs auth error
    const msg = JSON.stringify(e.response?.data || {});
    if (msg.includes('403') || e.response?.status === 403) {
      console.log('\n-> Auth issue: li_at cookie may need refreshing');
    } else if (e.response?.status === 422) {
      console.log('\n-> 422 can mean: already connected, privacy settings, or API format changed');
      console.log('-> Try with a different profile that definitely is not yet connected');
    }
  }
}

main().catch(e => console.error('Fatal:', e.message));
