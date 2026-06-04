/**
 * Local Telegram connectivity check.
 * Usage: node scripts/test-telegram.js
 *
 * Reads .env from project root. Does not print secrets.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = join(root, '.env');

if (!existsSync(envPath)) {
  console.error('[test-telegram] .env not found. Create it from .env.example');
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith('#'))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
);

const token = env.TELEGRAM_BOT_TOKEN;
const chatIdRaw = env.TELEGRAM_CHAT_ID;

if (!token || !chatIdRaw) {
  console.error('[test-telegram] TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are required in .env');
  process.exit(1);
}

const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw;

async function call(method, payload = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

console.log('[test-telegram] Checking bot token...');

try {
  const me = await call('getMe');
  if (!me.ok) {
    console.error('[test-telegram] Invalid token:', me.data.description);
    process.exit(1);
  }
  console.log('[test-telegram] OK: bot @' + me.data.result.username);

  console.log('[test-telegram] Sending test message to chat_id', chatIdRaw, '...');
  const send = await call('sendMessage', {
    chat_id: chatId,
    text: '✅ Тест с сайта Anji — Telegram подключён.',
  });

  if (!send.ok) {
    console.error('[test-telegram] sendMessage failed:', send.data.description);
    console.error('');
    console.error('Common fixes:');
    console.error('  1. Open your bot in Telegram and send /start');
    console.error('  2. Verify TELEGRAM_CHAT_ID (use @userinfobot for personal id)');
    console.error('  3. On Vercel: set env vars in dashboard and Redeploy');
    process.exit(1);
  }

  console.log('[test-telegram] OK: test message sent. Check Telegram.');
} catch (error) {
  console.error('[test-telegram] Network error:', error.message);
  console.error('');
  console.error('If api.telegram.org is blocked on your network, test on the deployed Vercel site instead.');
  process.exit(1);
}
