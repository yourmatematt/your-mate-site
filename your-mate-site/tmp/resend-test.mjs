// Throwaway: send ONE test email via Resend to prove the pipe.
// Run: node tmp/resend-test.mjs
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env.local');
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z][A-Z0-9_]+)\s*=\s*(.*)$/);
  if (!m) continue;
  let val = m[2];
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  if (!process.env[m[1]]) process.env[m[1]] = val;
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error('RESEND_API_KEY missing from .env.local');
  process.exit(1);
}
console.log('RESEND_API_KEY length:', apiKey.length, 'prefix:', apiKey.slice(0, 4));

const text = [
  "G'day — this is a Resend isolation test from the YMA codebase.",
  "",
  "If you're reading this, the pipe works.",
  "",
  "Test link (sample checklist URL):",
  "https://yourmateagency.com.au/downloads/gbp-checklist.pdf",
  "",
  "— sent by tmp/resend-test.mjs",
].join('\n');

const html = `<p>G'day — this is a Resend isolation test from the YMA codebase.</p>
<p>If you're reading this, the pipe works.</p>
<p>Test link (sample checklist URL):<br>
<a href="https://yourmateagency.com.au/downloads/gbp-checklist.pdf">https://yourmateagency.com.au/downloads/gbp-checklist.pdf</a></p>
<p style="color:#999;font-size:12px">— sent by tmp/resend-test.mjs</p>`;

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Matt from Your Mate Agency <matt@yourmateagency.com.au>',
    to: ['matt@yourmateagency.com.au'],
    subject: 'Resend test',
    text,
    html,
  }),
});

const body = await res.text();
console.log('STATUS:', res.status, res.statusText);
console.log('BODY:', body);
process.exit(res.ok ? 0 : 1);
