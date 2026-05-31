import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Industry → checklist PDF. Add a line per industry as new checklists ship.
const CHECKLIST_BY_INDUSTRY: Record<string, { url: string; label: string }> = {
  accommodation: {
    url: 'https://yourmateagency.com.au/downloads/gbp-checklist.pdf',
    label: 'GBP Checklist for Accommodation Operators',
  },
};

interface ChecklistRequestBody {
  first_name?: string;
  business_name?: string;
  town_postcode?: string;
  email?: string;
  industry?: string;
  website?: string;
  pageLoadTime?: number;
  turnstileToken?: string;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
    const data = (await verifyRes.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

async function sendChecklistEmail(opts: {
  firstName: string;
  toEmail: string;
  checklistUrl: string;
  checklistLabel: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const first = opts.firstName;
  const url = opts.checklistUrl;
  const label = opts.checklistLabel;

  const text = [
    `G'day ${first},`,
    ``,
    `Cheers for grabbing the ${label} — here it is:`,
    ``,
    url,
    ``,
    `It's a 4-page A4 print-friendly thing. Print it, scribble on it, tick the boxes as you go. Takes about an hour if you sit down and just plough through.`,
    ``,
    `The photo section (4) and the Direct Booking bit (5) are where most operators see the biggest lift — that's where the OTA commission savings actually start.`,
    ``,
    `Stuck on any of it? Book a quick call and I'll walk you through it:`,
    `https://calendar.app.google/9nYnoQdALsTNo6wp6`,
    ``,
    `— Matt`,
    `Your Mate Agency, Mallacoota`,
    `0478 101 521`,
  ].join('\n');

  const safeFirst = escapeHtml(first);
  const safeLabel = escapeHtml(label);

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.65;color:#000;max-width:560px;margin:0 auto;padding:32px 24px;background:#ffffff">
  <p style="margin:0 0 1rem 0">G'day ${safeFirst},</p>
  <p style="margin:0 0 1rem 0">Cheers for grabbing the <strong>${safeLabel}</strong> — here it is:</p>
  <p style="margin:1.5rem 0"><a href="${url}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-weight:500;padding:14px 22px;border-radius:6px">Open the checklist (PDF) →</a></p>
  <p style="margin:0 0 1rem 0">It's a 4-page A4 print-friendly thing. Print it, scribble on it, tick the boxes as you go. Takes about an hour if you sit down and just plough through.</p>
  <p style="margin:0 0 1rem 0">The <strong>photo section (4)</strong> and the <strong>Direct Booking bit (5)</strong> are where most operators see the biggest lift — that's where the OTA commission savings actually start.</p>
  <p style="margin:0 0 0.75rem 0"><strong>Stuck on any of it? Book a quick call and I'll walk you through it.</strong></p>
  <p style="margin:0 0 1rem 0"><a href="https://calendar.app.google/9nYnoQdALsTNo6wp6" style="display:inline-block;background:#ffffff;color:#2D9F5E;text-decoration:none;font-weight:500;padding:12px 20px;border:1.5px solid #2D9F5E;border-radius:6px">Book a quick call →</a></p>
  <p style="margin:2rem 0 0 0">— Matt<br>Your Mate Agency, Mallacoota<br><a href="tel:+61478101521" style="color:#2D9F5E;text-decoration:none;font-weight:500">0478 101 521</a></p>
</div></body></html>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Matt from Your Mate Agency <matt@yourmateagency.com.au>',
        to: [opts.toEmail],
        subject: `Your GBP checklist — ${label}`,
        text,
        html,
      }),
    });
    const body = await resp.text();
    if (!resp.ok) return { ok: false, error: `Resend ${resp.status}: ${body.slice(0, 400)}` };
    let id: string | undefined;
    try {
      id = (JSON.parse(body) as { id?: string }).id;
    } catch {
      /* ignore parse error */
    }
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function sendLeadNotificationEmail(opts: {
  firstName: string;
  businessName: string;
  townPostcode: string;
  email: string;
  industry: string;
  emailSent: boolean;
  emailError?: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('Lead notification skipped: RESEND_API_KEY not configured');
    return;
  }
  try {
    const statusText = opts.emailSent
      ? '✅ Checklist email sent to the lead.'
      : `⚠️ The checklist email to them FAILED — send it manually.${
          opts.emailError ? `\nError: ${opts.emailError}` : ''
        }`;

    const text = [
      `New checklist lead via ${opts.industry}.`,
      ``,
      `First name:    ${opts.firstName}`,
      `Business:      ${opts.businessName}`,
      `Town/postcode: ${opts.townPostcode}`,
      `Email:         ${opts.email}`,
      `Industry:      ${opts.industry}`,
      ``,
      statusText,
      ``,
      `(Reply to this email to write back to the lead directly.)`,
    ].join('\n');

    const safe = {
      firstName: escapeHtml(opts.firstName),
      businessName: escapeHtml(opts.businessName),
      townPostcode: escapeHtml(opts.townPostcode),
      email: escapeHtml(opts.email),
      industry: escapeHtml(opts.industry),
    };
    const statusHtml = opts.emailSent
      ? `<p style="margin:1.25rem 0 0 0;color:#15803d"><strong>✅ Checklist email sent to the lead.</strong></p>`
      : `<p style="margin:1.25rem 0 0 0;color:#991b1b;background:#fef2f2;border-left:3px solid #dc2626;padding:0.75rem 1rem"><strong>⚠️ The checklist email to them FAILED — send it manually.</strong>${
          opts.emailError ? `<br><code style="font-size:12px">${escapeHtml(opts.emailError)}</code>` : ''
        }</p>`;

    const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5">
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#000;max-width:560px;margin:0 auto;padding:24px;background:#ffffff">
  <p style="margin:0 0 1rem 0;font-size:14px;color:#737373;letter-spacing:0.04em;text-transform:uppercase;font-weight:600">New checklist lead · ${safe.industry}</p>
  <table style="width:100%;border-collapse:collapse;font-size:15px">
    <tr><td style="padding:0.4rem 0;color:#737373;width:140px">First name</td><td style="padding:0.4rem 0"><strong>${safe.firstName}</strong></td></tr>
    <tr><td style="padding:0.4rem 0;color:#737373">Business</td><td style="padding:0.4rem 0"><strong>${safe.businessName}</strong></td></tr>
    <tr><td style="padding:0.4rem 0;color:#737373">Town / postcode</td><td style="padding:0.4rem 0">${safe.townPostcode}</td></tr>
    <tr><td style="padding:0.4rem 0;color:#737373">Email</td><td style="padding:0.4rem 0"><a href="mailto:${safe.email}" style="color:#000">${safe.email}</a></td></tr>
    <tr><td style="padding:0.4rem 0;color:#737373">Industry</td><td style="padding:0.4rem 0">${safe.industry}</td></tr>
  </table>
  ${statusHtml}
  <p style="margin:1.5rem 0 0 0;font-size:13px;color:#737373">Reply to this email to write back to the lead directly.</p>
</div></body></html>`;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Matt from Your Mate Agency <matt@yourmateagency.com.au>',
        to: ['matt@yourmateagency.com.au'],
        reply_to: opts.email,
        subject: `New checklist lead — ${opts.businessName} (${opts.industry})`,
        text,
        html,
      }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      console.error('Lead notification Resend non-OK:', resp.status, body.slice(0, 300));
    }
  } catch (err) {
    console.error('Lead notification send threw:', err);
  }
}

async function pingTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('Telegram ping failed:', err);
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
      first_name,
      business_name,
      town_postcode,
      email,
      industry,
      website,
      pageLoadTime,
      turnstileToken,
    } = req.body as ChecklistRequestBody;

    // Honeypot — return success to bot, do nothing
    if (website && website.trim().length > 0) {
      console.log('Checklist form spam blocked: honeypot filled');
      return res.status(200).json({ success: true });
    }

    // Time trap — humans take longer than 2 seconds
    if (pageLoadTime && typeof pageLoadTime === 'number') {
      const elapsedMs = Date.now() - pageLoadTime;
      if (elapsedMs < 2000) {
        console.log('Checklist form spam blocked: submitted in', elapsedMs, 'ms');
        return res.status(200).json({ success: true });
      }
    }

    if (!first_name || !business_name || !town_postcode || !email || !industry) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    const checklist = CHECKLIST_BY_INDUSTRY[industry];
    if (!checklist) {
      console.error('Unknown industry submitted:', industry);
      return res.status(400).json({ error: 'Unknown industry.' });
    }

    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security check required' });
    }
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
    const userAgent = (req.headers['user-agent'] as string) || null;
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      console.log('Checklist form spam blocked: Turnstile failed');
      return res.status(403).json({ error: 'Security check failed — please try again' });
    }

    // 1. Capture the lead first. Email failure must never lose it.
    const { data: insertData, error: insertError } = await supabase
      .from('checklist_requests')
      .insert({
        first_name,
        business_name,
        town_postcode,
        email,
        industry,
        ip: ip || null,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('checklist_requests insert error:', insertError);
      return res.status(500).json({ error: 'Failed to save submission' });
    }

    const leadId = insertData?.id as string | undefined;

    // 2. Send the checklist email via Resend.
    const sendResult = await sendChecklistEmail({
      firstName: first_name,
      toEmail: email,
      checklistUrl: checklist.url,
      checklistLabel: checklist.label,
    });

    // 3. Record the send result on the lead row.
    if (leadId) {
      const { error: updateError } = await supabase
        .from('checklist_requests')
        .update({
          email_sent: sendResult.ok,
          email_error: sendResult.ok ? null : (sendResult.error ?? '').slice(0, 500),
        })
        .eq('id', leadId);
      if (updateError) console.error('checklist_requests update error:', updateError);
    }

    // 4. Telegram ping — celebrate on success, warn loudly on failure.
    const emoji = sendResult.ok ? '📥' : '⚠️';
    const status = sendResult.ok
      ? 'Checklist email sent'
      : 'EMAIL FAILED — send manually';
    let tg = `<b>${emoji} Checklist lead — ${escapeHtml(industry)}</b>\n\n`;
    tg += `<b>Name:</b> ${escapeHtml(first_name)}\n`;
    tg += `<b>Business:</b> ${escapeHtml(business_name)}\n`;
    tg += `<b>Town / postcode:</b> ${escapeHtml(town_postcode)}\n`;
    tg += `<b>Email:</b> ${escapeHtml(email)}\n\n`;
    tg += `<b>${status}</b>`;
    if (!sendResult.ok && sendResult.error) {
      tg += `\n<code>${escapeHtml(sendResult.error)}</code>`;
    }
    await pingTelegram(tg);

    // 5. Notification email to Matt — own try/catch inside the helper,
    //    so a failure here cannot affect the lead, the row, the Telegram, or the response.
    await sendLeadNotificationEmail({
      firstName: first_name,
      businessName: business_name,
      townPostcode: town_postcode,
      email,
      industry,
      emailSent: sendResult.ok,
      emailError: sendResult.error,
    });

    // 6. Always 200 to the user — lead is safely captured even if email failed.
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Checklist request API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
