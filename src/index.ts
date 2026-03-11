import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import AmberAgent from './agent/amber';
import { setupDatabase } from './database/migrations';
import { startScheduler } from './tools/scheduler';
import { setupInstagramWebhook } from './integrations/instagram';
import { setupWhatsAppWebhooks } from './integrations/whatsapp';
import { startTelegramBot } from './integrations/telegram';
import { logger } from './utils/logger';

dotenv.config();

async function main() {
  console.log(`
 █████╗ ███╗   ███╗██████╗ ███████╗██████╗ 
██╔══██╗████╗ ████║██╔══██╗██╔════╝██╔══██╗
███████║██╔████╔██║██████╔╝█████╗  ██████╔╝
██╔══██║██║╚██╔╝██║██╔══██╗██╔══╝  ██╔══██╗
██║  ██║██║ ╚═╝ ██║██████╔╝███████╗██║  ██║
╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝

Amber Jacobs — Community Manager
Indvstry Clvb
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  // 1. Setup database
  logger.info('🗄️  Initialising memory database...');
  setupDatabase();

  // 2. Initialise Amber agent
  logger.info('🤖 Waking up Amber...');
  const agent = new AmberAgent();

  // 3. Determine which services to run
  const args = process.argv.slice(2);
  const serviceArg = args.find(a => a.startsWith('--service='));
  const service = serviceArg ? serviceArg.split('=')[1] : 'all';

  // 4. Start Express server for webhooks
  if (service === 'all' || ['instagram', 'whatsapp'].includes(service)) {
    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Health check
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'online', 
        agent: 'Amber Jacobs',
        club: 'Indvstry Clvb',
        timestamp: new Date().toISOString()
      });
    });

    // Instagram webhooks
    if (service === 'all' || service === 'instagram') {
      setupInstagramWebhook(app, agent);
    }

    // WhatsApp webhooks
    if (service === 'all' || service === 'whatsapp') {
      setupWhatsAppWebhooks(app, agent);
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🌐 Webhook server running on port ${PORT}`);
      logger.info(`   Health: http://localhost:${PORT}/health`);
      logger.info(`   Instagram: http://localhost:${PORT}/webhooks/instagram`);
      logger.info(`   WhatsApp (Twilio): http://localhost:${PORT}/webhooks/whatsapp/twilio`);
      logger.info(`   WhatsApp (Meta): http://localhost:${PORT}/webhooks/whatsapp/meta`);
    });
  }

  // 5. Start Telegram bot
  if (service === 'all' || service === 'telegram') {
    try {
      await startTelegramBot(agent);
    } catch (error) {
      logger.warn('Telegram bot failed to start (check TELEGRAM_BOT_TOKEN):', error);
    }
  }

  // 6. Start scheduler
  if (service === 'all' || service === 'email') {
    startScheduler(agent);
  }

  logger.info(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Amber is online and ready.

Active services:
  ${service === 'all' ? '✓ Email (checking every 15 mins)' : service === 'email' ? '✓ Email' : '✗ Email'}
  ${service === 'all' ? '✓ Instagram (webhooks + polling)' : service === 'instagram' ? '✓ Instagram' : '✗ Instagram'}
  ${service === 'all' ? '✓ WhatsApp (webhooks)' : service === 'whatsapp' ? '✓ WhatsApp' : '✗ WhatsApp'}
  ${service === 'all' ? '✓ Telegram (bot)' : service === 'telegram' ? '✓ Telegram' : '✗ Telegram'}
  ${service === 'all' ? '✓ LinkedIn (daily discovery)' : '✗ LinkedIn'}
  ${service === 'all' ? '✓ Scheduler (automated tasks)' : '✗ Scheduler'}

Approval mode: ${process.env.AUTO_SEND === 'true' ? '🟢 Auto-send enabled' : '🟡 Manual approval required'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch(err => {
  logger.error('Fatal error:', err);
  process.exit(1);
});
