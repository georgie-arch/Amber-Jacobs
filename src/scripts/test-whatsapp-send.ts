import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const TO = '447516572963';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function main() {
  console.log('─── WhatsApp API Debug ───');
  console.log('PHONE_NUMBER_ID:', PHONE_NUMBER_ID);
  console.log('ACCESS_TOKEN (first 20 chars):', ACCESS_TOKEN?.substring(0, 20) + '...');
  console.log('Sending to:', TO);
  console.log('─────────────────────────');

  try {
    const res = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: TO,
        type: 'text',
        text: { body: "Hey George, test message from Amber. Can you see this?" }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ API Response:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.log('❌ API Error:');
    console.log(JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

main();
