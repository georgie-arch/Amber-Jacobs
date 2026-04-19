import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import AmberAgent from '../agent/amber';
import { logger } from '../utils/logger';

dotenv.config();

// ─── TELEGRAM BOT SETUP ──────────────────────────────────────────

export function createTelegramBot(agent: AmberAgent): Telegraf {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

  // ─── COMMANDS ───────────────────────────────────────────────────

  bot.start(async (ctx) => {
    const user = ctx.from;
    logger.info(`🤖 Telegram /start from ${user.first_name} (${user.id})`);

    const amberResponse = await agent.handleInbound({
      platform: 'telegram',
      from: {
        first_name: user.first_name,
        last_name: user.last_name,
        telegram_id: String(user.id),
        source: 'telegram'
      },
      content: '/start - User initiated conversation',
      message_type: 'dm'
    });

    const welcomeMessage = amberResponse?.message || 
      `Hey ${user.first_name} 👋 I'm Amber, community manager at Indvstry Clvb — a digital private members club for creative professionals.\n\nHow can I help you today?`;

    await ctx.reply(welcomeMessage);
  });

  bot.command('apply', async (ctx) => {
    await ctx.reply(
      `To apply for membership at Indvstry Clvb, head to:\n${process.env.CLUB_APPLICATION_URL || 'indvstryclvb.com/apply'}\n\nFeel free to message me if you have any questions first.`
    );
  });

  bot.command('about', async (ctx) => {
    await ctx.reply(
      `Indvstry Clvb is a digital private members club for creative professionals.\n\nWe're building a curated network where the right people get to know each other — through exclusive events, introductions, and a space designed around creative work and culture.\n\nFounded by George Guise.\n\n${process.env.CLUB_WEBSITE || 'indvstryclvb.com'}`
    );
  });

  bot.command('contact', async (ctx) => {
    await ctx.reply(
      `You can reach me here, by email at ${process.env.AMBER_EMAIL || 'hello@indvstryclvb.com'}, or via Instagram @indvstryclvb.`
    );
  });

  // ─── HANDLE ALL MESSAGES ────────────────────────────────────────

  bot.on('text', async (ctx) => {
    const user = ctx.from;
    const text = ctx.message.text;

    // Skip commands (handled above)
    if (text.startsWith('/')) return;

    const isGeorge = String(user.id) === process.env.TELEGRAM_ADMIN_ID;

    if (isGeorge) {
      logger.info(`👑 GEORGE command via Telegram: ${text.substring(0, 80)}`);
    } else {
      logger.info(`💬 Telegram message from ${user.first_name}: ${text.substring(0, 50)}`);
    }

    // Show typing indicator while Amber thinks
    await ctx.sendChatAction('typing');

    const holdingTimer = setTimeout(async () => {
      await ctx.reply('one sec');
    }, 10000);

    // George gets command mode — Amber treats his messages as operational instructions
    const contentWithContext = isGeorge
      ? `[COMMAND FROM GEORGE — founder. Execute this as an operational task, not a member query]: ${text}`
      : text;

    const amberResponse = await agent.handleInbound({
      platform: 'telegram',
      from: {
        first_name: isGeorge ? 'George' : user.first_name,
        last_name: isGeorge ? 'Guise' : user.last_name,
        telegram_id: String(user.id),
        source: 'telegram'
      },
      content: contentWithContext,
      message_type: 'dm',
      thread_id: String(ctx.chat.id),
      message_id: String(ctx.message.message_id)
    });

    clearTimeout(holdingTimer);

    if (amberResponse) {
      await ctx.reply(amberResponse.message);
    }
  });

  // ─── HANDLE PHOTOS / MEDIA ───────────────────────────────────────

  bot.on('photo', async (ctx) => {
    await ctx.reply("Thanks for sharing! Drop me a message if there's something specific you'd like to discuss.");
  });

  // ─── ERROR HANDLING ─────────────────────────────────────────────

  bot.catch((err: any, ctx: Context) => {
    logger.error(`Telegram error for update ${ctx.updateType}:`, err);
  });

  return bot;
}

// ─── SEND MESSAGE TO USER ────────────────────────────────────────

export async function sendTelegramMessage(bot: Telegraf, chatId: string | number, message: string): Promise<boolean> {
  try {
    await bot.telegram.sendMessage(chatId, message);
    logger.info(`✅ Telegram message sent to ${chatId}`);
    return true;
  } catch (error) {
    logger.error('Telegram send failed:', error);
    return false;
  }
}

// ─── NOTIFY ADMIN (GEORGE) ───────────────────────────────────────

export async function notifyAdmin(bot: Telegraf, message: string, _fromName: string): Promise<void> {
  if (!process.env.TELEGRAM_ADMIN_ID) return;

  try {
    await bot.telegram.sendMessage(
      process.env.TELEGRAM_ADMIN_ID,
      `${message}`,
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    logger.error('Could not notify admin:', error);
  }
}

// ─── START BOT ───────────────────────────────────────────────────

export async function startTelegramBot(agent: AmberAgent): Promise<Telegraf> {
  const bot = createTelegramBot(agent);
  
  bot.launch(() => {
    logger.info(`🤖 Telegram bot @${process.env.TELEGRAM_BOT_USERNAME || 'AmberBot'} is running`);
  });

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));

  return bot;
}
