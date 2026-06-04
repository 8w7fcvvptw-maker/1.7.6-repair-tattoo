/**
 * Serverless function: /api/send
 * Compatible with Vercel (functions) and Netlify Functions.
 *
 * Accepts POST { name, phone, service, date, message }
 * Validates input server-side, then forwards to Telegram Bot API.
 * Credentials are read from environment variables only — never from client code.
 */

const TELEGRAM_API = 'https://api.telegram.org';

const SERVICE_LABELS = {
  tattoo:     'Татуировка',
  coverup:    'Перекрытие',
  correction: 'Коррекция',
  sketch:     'Разработка эскиза',
};

/**
 * Validate incoming request body.
 * @param {object} body
 * @returns {string|null} error message or null if valid
 */
function validate(body) {
  const { name, phone, service } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'Поле "name" обязательно (минимум 2 символа)';
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 10) {
    return 'Поле "phone" обязательно (минимум 10 символов)';
  }
  if (!service || !Object.prototype.hasOwnProperty.call(SERVICE_LABELS, service)) {
    return `Поле "service" должно быть одним из: ${Object.keys(SERVICE_LABELS).join(', ')}`;
  }

  return null;
}

/**
 * Build Telegram message text from form data (plain text — no Markdown).
 * @param {object} data
 * @returns {string}
 */
function buildMessage(data) {
  return [
    '📋 Новая заявка на запись',
    '',
    `👤 Имя: ${data.name.trim()}`,
    `📞 Телефон: ${data.phone.trim()}`,
    `🔧 Услуга: ${SERVICE_LABELS[data.service]}`,
    data.date    ? `📅 Дата: ${data.date}` : '',
    data.message ? `💬 Комментарий: ${data.message.trim()}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Normalize chat id from env (supports numeric ids and @channel usernames).
 * @param {string|undefined} raw
 * @returns {string|number}
 */
function normalizeChatId(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return trimmed;
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

/**
 * Main handler — compatible with Vercel serverless functions.
 * For Netlify: wrap with exports.handler = async (event) => { ... }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token  = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = normalizeChatId(process.env.TELEGRAM_CHAT_ID);

  if (!token || !chatId) {
    console.error('[send] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const validationError = validate(body);
  if (validationError) {
    return res.status(422).json({ error: validationError });
  }

  const text = buildMessage(body);

  try {
    const telegramRes = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });

    if (!telegramRes.ok) {
      const detail = await telegramRes.text();
      console.error('[send] Telegram API error:', detail);
      return res.status(502).json({ error: 'Telegram API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send] Network error:', err);
    return res.status(502).json({ error: 'Network error sending to Telegram' });
  }
}
