import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

interface ContactFormBody {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  website?: string;
  pageLoadTime?: number;
  turnstileToken?: string;
}

async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY not set — rejecting submission');
    return false;
  }
  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (ip) params.append('remoteip', ip);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await verifyRes.json() as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      website,
      pageLoadTime,
      turnstileToken,
    } = req.body as ContactFormBody;

    // Honeypot — return success to bot, do nothing
    if (website && website.trim().length > 0) {
      console.log('Contact form spam blocked: honeypot filled');
      return res.status(200).json({ success: true });
    }

    // Time trap — humans take longer than 2 seconds
    if (pageLoadTime && typeof pageLoadTime === 'number') {
      const elapsedMs = Date.now() - pageLoadTime;
      if (elapsedMs < 2000) {
        console.log('Contact form spam blocked: submitted in', elapsedMs, 'ms');
        return res.status(200).json({ success: true });
      }
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Cloudflare Turnstile verification
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security check required' });
    }
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      console.log('Contact form spam blocked: Turnstile verification failed');
      return res.status(403).json({ error: 'Security check failed — please try again' });
    }

    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      });

    if (insertError) {
      console.error('Error saving contact submission:', insertError);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && telegramChatId) {
      let telegramMessage = `<b>📬 New Contact Form Submission</b>\n\n`;
      telegramMessage += `<b>Name:</b> ${name}\n`;
      telegramMessage += `<b>Email:</b> ${email}\n`;
      if (phone) telegramMessage += `<b>Phone:</b> ${phone}\n`;
      if (subject) telegramMessage += `<b>Subject:</b> ${subject}\n`;
      telegramMessage += `\n<b>Message:</b>\n${message.length > 500 ? message.substring(0, 500) + '...' : message}`;

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
          parse_mode: 'HTML',
        }),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
