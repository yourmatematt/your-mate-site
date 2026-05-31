# Phantom Chat Investigation — 2026-04-20

**Question:** 8 rows exist in the production `chat_conversations` table, but no chat widget is live on yourmateagency.com.au. Where are the writes coming from?

**Verdict:** **No code anywhere in the local workspace writes to `chat_conversations` — including full git history across v1, v2, and yma-business-hub.** The writes are coming from outside what we can see. The most plausible source is direct-to-PostgREST inserts using the production Supabase anon key, which is **currently exposed in a public JS bundle** at `https://yma-business-hub.vercel.app`.

This is a security issue, not an analytics issue.

---

## 1. Where the writes are coming from

### What I ruled out

| Candidate | Checked | Result |
| --- | --- | --- |
| yourmateagency.com.au (v1, live) | `grep -iE "chat_conversations\|MateChat\|supabase" index.html contact.html main.js` on the shipped bundle (HTTP fetched directly) | None. Live homepage is 21.5KB HTML + 9.1KB main.js, zero chat code. |
| your-mate-site v1 repo code | `Grep chat_conversations` | No match. `MateChat` no match. `from('chat_conversations')` no match. Only API route that inserts anywhere is `api/contact-form.ts` → `contact_submissions`. |
| yma-site-v2 (rebuild) | `Grep chat_conversations\|MateChat` across whole project | Zero. Components dir has no Chat component. |
| yma-business-hub (CRM app) | `Grep` entire tree incl. `supabase/functions/` edge functions | Zero writes to `chat_conversations`. 40+ files reference `supabase.from(...)` but none target this table. |
| Git history (all branches, all pickaxe S) | `git log --all -S chat_conversations` and `-S MateChat` on v1, v2, hub | **Zero commits ever added/removed either string.** The string has never lived in any of these repos. |
| n8n workflows | `search_workflows query=chat` | Zero results. |
| Supabase Edge Functions (hub) | `ls yma-business-hub/supabase/functions/` + grep | 9 functions exist (content notifications, blog generation, slack, etc). None touch `chat_conversations`. |

### What's actually serving prod Supabase credentials

**`https://yma-business-hub.vercel.app/` responds HTTP 200.** It's the YMA admin/CRM hub, Vite/React, gated behind a client-side password (`yma2026`). The JS bundle at `https://yma-business-hub.vercel.app/assets/index-BqPsX9Zc.js` (3.5 MB) contains:

- `https://viokprqqvsknamafrfmy.supabase.co` — the **production** Supabase project URL
- The Supabase anon key (starts `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpb2twcnFxdnNrbmFtYWZyZm15Iiw...`) — this matches the anon key in `your-mate-site/.env.local`

The bundle is publicly fetchable without the password — client-side password gates are decorative, not security. Anyone who hits the JS file gets the anon key and the project URL.

**The anon key can insert into any table whose RLS doesn't block `anon`.** Given that writes to `chat_conversations` are landing, RLS on that table is either disabled or permits `anon INSERT`.

### The .env file is unusually risky in the hub

`yma-business-hub/.env` (not `.env.local`) contains — in addition to the items above:

- `SUPABASE_SERVICE_KEY` (full service role key — bypasses all RLS)
- `ANTHROPIC_API_KEY` (new/separate from v1's key)
- `VERCEL_TOKEN` (full API access)
- `VERCEL_DEPLOY_HOOK_URL`
- `VITE_SLACK_WEBHOOK_URL` (gets inlined into the public bundle — already leaked)
- `GOOGLE_PAGESPEED_API_KEY`
- `GSC_CLIENT_SECRET`
- `VITE_APP_PASSWORD=yma2026`

`.env` is **not** tracked in git (`git ls-files` shows only `.env.example`). So these haven't hit GitHub. But the fact that the file is named `.env` rather than `.env.local` is a footgun — `.env` is loaded by Vite in all modes including build, and any `VITE_*` key in it gets inlined into the public bundle. The Slack webhook URL has already leaked this way and is callable by anyone. **Anyone with the bundle can post to Matt's Slack and impersonate YMA.**

### The most plausible write source

Given: no local code writes to the table, the anon key is publicly fetchable, and the burst rows show **no assistant response** (see Section 3), the simplest explanation is:

**Someone outside Matt's local repos is hitting the Supabase PostgREST endpoint directly** — using the leaked anon key — to POST rows into `chat_conversations` and `chat_messages`. Not through an app, not through a widget. Just `curl` or equivalent.

The single 2026-02-16 row is an outlier — it shows an assistant reply. That means at least *once*, something with Anthropic API access was also wired to this table. Most likely:
- A prototype chat widget that was deployed briefly (to a Vercel preview, a Bolt/v0/Replit project, or a local dev server Matt opened to the internet for a demo) — and then binned. Code never made it into a commit.
- OR: a Supabase Edge Function on a **previous schema version** that has since been deleted from both Supabase and the local repo.

A Vercel deployment audit is required to confirm which. The Vercel MCP requires OAuth that I can't complete in a timeboxed read-only pass — flag for Matt to run `vercel ls` / `vercel inspect` himself to enumerate every domain alias + deployment still serving.

---

## 2. Was the one "ghosted" conversation actually real?

### Timestamp & updated_at forensics

| conversation_id (prefix) | created_at | updated_at | Δ | bot response? |
| --- | --- | --- | --- | --- |
| `bd576f60…` (Feb 16, funnel=seo) | 03:31:28.783 | 03:31:31.518 | **2.73s** | Yes — assistant row exists |
| `b5ab322f…` (burst) | 02:00:16.548 | 02:00:16.548 | 0 ms | No |
| `f6cd07a9…` (burst) | 02:00:25.524 | 02:00:25.524 | 0 ms | No |
| `953cc6cd…` (burst) | 02:00:36.268 | 02:00:36.268 | 0 ms | No |
| `1412e4ce…` (burst) | 02:00:40.987 | 02:00:40.987 | 0 ms | No |
| `270bfbb6…` (burst) | 02:00:46.525 | 02:00:46.525 | 0 ms | No |
| `5af715e9…` (burst) | 02:00:51.309 | 02:00:51.309 | 0 ms | No |
| `3e7b2ec0…` (burst) | 02:00:57.093 | 02:00:57.093 | 0 ms | No |

**The 41-second span is between distinct conversations**, not one conversation lasting 41s. Seven separate conversation_ids created at 02:00:16 → 02:00:57, each with a single user message and nothing else. Inter-arrival ~5–10 seconds. Consistent with a human tapping through a form, or a simple test script with a small sleep.

### Content of the burst (all user-role, no assistant reply)

1. "you are gay"
2. "you are a homosexualle"
3. "can i talk to you in french"
4. "help"
5. "please help"
6. "please help"
7. "need website"

**Read:** adversarial/probing content. Someone testing whether the endpoint accepts arbitrary inserts. The first two messages are attempts to get an offensive auto-reply from an assumed chatbot — when nothing comes back, they switch to neutral strings ("help", "please help", "need website") to test whether the endpoint validates content. Nothing came back because **there is no bot consumer** — they were inserting directly into the DB, bypassing any app logic.

### Is the Feb 16 conversation real?

`funnel=seo` (valid per the discovery-doc schema `website/seo/ai/content`), single user message "Just read an article and think I need help", assistant replied 2.7s later with "Fair enough - what kind of business are you running?". Plausibly a real visitor on whatever prototype was live that day. No follow-up — so even if real, they didn't convert.

**The burst rows (2026-03-24) use `funnel=general`, which is NOT one of the expected enum values.** This strongly implies a different client wrote them — one that doesn't know the intended enum. Either:
- A test harness that used a default/literal string, or
- A direct `curl` with an arbitrary field value.

The Feb 16 and March 24 events are almost certainly from **different sources**. One from a real-ish app (Feb 16, with bot reply and correct funnel). The others from direct DB access by someone probing (March 24, no bot reply, off-enum funnel).

### What I couldn't forensically check

- Supabase Auth logs (who made the request, from which IP, with which key)
- Supabase PostgREST access logs
- RLS policies on `chat_conversations` and `chat_messages`

These require Supabase dashboard access, which is out of scope for this read-only investigation. **Matt should check the Supabase dashboard `Auth Logs` and `Database Logs` for the 7 requests around 2026-03-24 02:00:16–57 UTC.** IPs from those logs will narrow the source significantly.

---

## 3. Proposed fix (not implementing — discussion)

Ranked by impact × ease:

### FIX-1 (do first, same day): Rotate the anon and service keys

Both Supabase keys in `.env.local` / `.env` are in a public bundle (anon) or in an untracked but unrotated file (service). Rotate in the Supabase dashboard:
- `Settings → API → Regenerate anon key`
- `Settings → API → Regenerate service_role key`

Then update the env var in every consuming environment (your-mate-site v1 Vercel prod env, v2 env, hub env, local `.env.local`s). Also rotate the Slack webhook URL — also leaked in the public bundle.

### FIX-2: Lock down `chat_conversations` and `chat_messages` RLS

Current behaviour (rows are landing from anon calls) implies:
- Either RLS is disabled, or
- An INSERT policy allows `role = anon` with no further filter.

Options:
1. **Strictest:** Disable anon INSERT entirely. Require `service_role` (i.e. server-side). If/when a real chat widget ships, route writes through an API route (`/api/chat-insert`) that holds the service key, so the table is never anon-writable. This is how `contact-form.ts` already works.
2. **Middle:** Anon can INSERT but only if `funnel IN ('website','seo','ai','content')` and only rate-limited to ~5 per minute per IP via a Supabase `function` or middleware. This preserves the "public chat widget writes directly" shape but adds validation.
3. **Loose:** Keep anon INSERT, add a CHECK constraint on funnel + a rate limit on IP. Cheapest — not recommended given we've just learned the key is loose in the wild.

**Recommendation:** Option 1. The site has a mature server-side API pattern already (via Vercel API routes + service key). When the MateChat widget does ship, it should POST to `/api/chat/start` and `/api/chat/message`, and the API route inserts with the service key. This also lets you trivially add Anthropic moderation / Telegram alerts on the server side.

### FIX-3: Stop inlining secrets into the hub bundle

- Rename `yma-business-hub/.env` → `.env.local` so Vite doesn't pick it up during `vercel build`. Verify neither file is tracked (`.env.local` is not, `.env` also isn't — good).
- Anything VITE-prefixed that isn't safe to expose should move to a server-side-only key (no `VITE_` prefix) and be read in Vercel API routes or Supabase Edge Functions, not in client code.
- `VITE_APP_PASSWORD=yma2026` is decorative — replace the hub's auth with Supabase Auth (or Clerk/Auth0/etc). A real authenticated session gives you row-level access enforcement and removes the bundle-secret dependency altogether.

### FIX-4: Audit every environment that currently holds prod Supabase credentials

Three projects have production Supabase URLs in their envs:
- `your-mate-matt/your-mate-site/.env.local` (v1)
- `yma-site-v2/.env.local` (v2)
- `yma-business-hub/.env` (hub)

Each Vercel project's `Preview` environment variables should be pointed at a **separate staging Supabase project** (Supabase free tier is free — spin up `viokprqqvsknamafrfmy-staging` and use it for preview deploys + local dev). Preview URLs can be found by anyone poking at the Vercel `*.vercel.app` pattern; they shouldn't be able to write to prod from there.

Without the Vercel MCP authed, I can't enumerate which envs have which vars. **Matt:** run `vercel env ls` for each of the three projects and confirm the `Preview` and `Development` rows either point at staging Supabase or are empty.

### FIX-5: Decide what you actually want `chat_conversations` to be

Right now the table exists, has 8 rows, is tracked as the "conversion event" in the conversion audit, but has no producer in the current codebase. Three options:

1. **Ship the real MateChat widget onto v1 (or v2).** Wire it to POST via `/api/chat/*` routes that use the service key. Then the conversion audit metric actually works.
2. **Retire the table.** Replace the "conversion event" concept with `contact_submissions` (which *is* wired up). Drop the table or archive it.
3. **Keep the table for v2 migration.** If v2 is the place where chat ships, scope the prod Supabase access out of v1 and over to v2 only, and treat the current phantom rows as test pollution.

My guess is (1) is what Matt intended — the table, the discovery doc, the funnel column, even the `DATABASE_SCHEMA` doc all describe an ambitious chat CRM. Someone started implementing it, never finished, and the table is now an attack surface without the benefit.

---

## 4. Security concerns summary

| # | Finding | Severity |
| --- | --- | --- |
| 1 | Supabase anon key + prod URL inlined into the public JS bundle at `yma-business-hub.vercel.app/assets/index-BqPsX9Zc.js`. Anyone can read it. | High |
| 2 | Slack webhook URL inlined into same bundle — anyone can post to Matt's Slack as YMA | Medium-High |
| 3 | `chat_conversations` accepts anon INSERTs (confirmed by the burst writes) | High |
| 4 | Three projects share production Supabase credentials; Preview/local dev may be able to write to prod | Medium |
| 5 | `.env` (not `.env.local`) in hub project — any VITE-prefixed secret lands in bundle | Medium |
| 6 | `VITE_APP_PASSWORD=yma2026` — trivially guessable gate on the admin UI | Medium |
| 7 | Service key also present in the same `.env` file — if this ever leaks (accidental commit, zip to a client, leaked backup) it bypasses all RLS | High if realised |
| 8 | No Supabase auth log review yet — IP/UA of the burst writer unknown | (not a vuln, a gap) |

Anon key rotation alone (FIX-1) neutralises findings 1, 2, 3, 4, 5 *for now* — the leaked key becomes useless. Everything else is about not making the same mistake again.

---

## Caveats & what I didn't do

- No code changed. No records deleted. No env vars touched. No redeploys.
- Vercel MCP requires OAuth — did not complete it. Deployment/alias audit (Step 3 in the brief) is incomplete. Matt should run `vercel ls` and `vercel env ls` locally, or complete the MCP auth in a follow-up session.
- No Supabase dashboard access — RLS policies and access logs are inferred from behaviour, not directly read.
- Investigation timeboxed to ~30 minutes. Stopped at the point where the leak source and the most likely write mechanism were identified with high confidence.
