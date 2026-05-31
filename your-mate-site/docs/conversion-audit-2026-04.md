# YMA Conversion Audit — April 2026

**Window:** 2026-01-20 → 2026-04-20 (90 days)
**Site:** yourmateagency.com.au (v1, production)
**Author:** CTO agent, diagnosis-only pass (no front-end changes)

---

## TL;DR for Matt

1. The site got **~107 organic clicks in 90 days** — about **1.2 clicks/day**. Traffic is real but tiny, and it's landing on the wrong pages for buyer intent.
2. **Zero real sales leads from the live site in 90 days.** 13 `contact_submissions` exist, but 8 are workshop sign-ups (1 was you testing), 4 are spam bots, and there are no genuine "I need a website" enquiries from organic visitors.
3. The "knowledge panel for marketing agency gippsland" win is **not translating**. The homepage has 1 impression at position 1. The same query has **73 impressions at position 21-71 pointing at `/about` and `/services`** — which is where Google is actually surfacing you organically. CTR = 0%.
4. `chat_conversations` (the "de-facto conversion event") is **not wired to the live site** — the contact form writes to `contact_submissions`. The 8 chat rows look like they came from v2/playground, including one real enquiry ghosted after a curt bot reply.
5. Plausible was only installed 2026-04-09 — the 90-day "behaviour" window is really 12 days of clean data. Plausible also has **no goals/events configured**, so chat opens, phone clicks, and email clicks are all invisible.

---

## 1. THE TRAFFIC

### Volume (GSC, 90d)

| Metric | Value |
| --- | --- |
| Total clicks | ~107 |
| Total impressions | ~6,157 |
| Site-wide avg CTR | ~1.74% |
| Site-wide avg position | 19.2 |

### Top landing pages by organic clicks

| Page | Clicks | Impr | CTR | Pos |
| --- | --- | --- | --- | --- |
| `/blog/easter-in-mallacoota-2026` | 53 | 336 | 15.8% | 4.4 |
| `/` (homepage) | 33 | 292 | 11.3% | 6.0 |
| `/about` | 3 | 176 | 1.7% | 8.9 |
| `/blog/how-long-does-seo-take` | 3 | 1,130 | 0.27% | 25.0 |
| `/studio-65` | 3 | 426 | 0.70% | 7.2 |
| `/mallacoota-barbie-boats` | 2 | 82 | 2.4% | 12.2 |
| `/contact` | 1 | 107 | 0.93% | 4.3 |
| `/services` | 1 | 240 | 0.42% | 16.9 |

**Observation:** The single biggest traffic driver (50% of all clicks) is a seasonal Mallacoota events guide. The next biggest is brand-term traffic ("your mate agency"). **Service pages are barely getting a look-in.**

### Sources (Plausible, ~12d of live data)

| Source | Visitors |
| --- | --- |
| Direct / None | 18 |
| Instagram | 5 |
| Google | 4 |
| Facebook | 3 |
| LinkedIn | 1 |

Only 4 of 30 visitors came from Google in the Plausible window. Direct and Instagram dominate — this is a social-driven audience, not a search-driven one.

### Regional match (GSC country dimension)

- Australia: 101 clicks / 3,325 impressions / CTR 3.0% / pos 21.2
- Pakistan: 5 clicks / 29 impr / CTR 17.2% (unqualified traffic)
- Kenya: 1 / 2

Plausible countries: AU 26, HK 2, CA 1, VN 1. **Almost all real visitors are Australian.** Good.

But **regional Gippsland targeting is failing on the actual buyer queries:**
- `seo agency gippsland` — 75 impr, 0 clicks, **pos 20.3**
- `digital marketing agency gippsland` — 73 impr, 0 clicks, **pos 35.4**
- `seo services gippsland` — 71 impr, 0 clicks, **pos 17.3**
- `seo company gippsland` — 69 impr, 0 clicks, **pos 17.4**
- `gippsland seo` — 22 impr, 0 clicks, **pos 28.7**
- `website design gippsland` — 1 impr, 1 click, pos 3.0 ✓ (only the one)

Zero impressions for "lakes entrance", "bairnsdale", or "east gippsland" as query terms. The local authority isn't there yet.

### Device split (GSC)

| Device | Clicks | Impr | CTR | Pos |
| --- | --- | --- | --- | --- |
| Mobile | 69 | 1,953 | 3.53% | 16.0 |
| Desktop | 37 | 4,120 | 0.90% | 21.0 |
| Tablet | 1 | 84 | 1.19% | 8.4 |

Mobile converts 4× better than desktop — **but the homepage hero on mobile eats 100vh with a typewriter animation and no visible CTA before scroll.**

---

## 2. THE QUERIES

### Position 1-3 queries (should click well but don't, except brand)

Only 4 queries land in positions 1-3:
- `your mate agency` — 21% CTR ✓ (brand)
- `jody massage` — 100% CTR, 1 impr (client, tiny volume)
- `website design gippsland` — 100% CTR, 1 impr (the only buyer-intent win, barely any volume)
- `digital marketing agency gippsland` — pos 1.0 but **only 1 impression** on the homepage

### Position 4-10 (close-to-winning)

| Query | Impr | Pos | Intent |
| --- | --- | --- | --- |
| `mallacoota barbie boats` | 27 | 8.0 | Client |
| `hammond properties mallacoota` | 70 | 5.1 | Client |
| `studio 65 mallacoota` | 65 | 5.1 | Client |
| `scallywags mallacoota menu` | 42 | 10.8 | Client |
| `ai workplace complaints australia` | 112 | 3.5 | Informational (blog) |
| `create google business profile steps` | 2 | 3.5 | Informational (blog) |
| `does replying to comments on instagram boost` | 2 | 3.0 | Informational (blog) |
| `mallacoota market` | 2 | 1.0 | Informational |
| `mallacoota massage` | 4 | 1.0 | Client |

**Pattern:** Strong ranking on client-business queries (which drive traffic to client pages, not YMA services) and informational blog queries. **Almost nothing in positions 4-10 for buyer-intent YMA queries.**

### Intent classification of top 30 queries by impressions

- Informational / research: ~80%
- Client lookup (Hammond, Scallywags, Studio 65, Barbie Boats, Massage by Jodie): ~15%
- Buyer-intent for YMA services: ~5%, and all at position 17+

**This is the fundamental mismatch: the site is ranking mostly for people who aren't buying YMA's services.**

---

## 3. THE BEHAVIOUR

### Plausible aggregate (2026-04-09 → 2026-04-20, ~12 days of real data)

| Metric | Value |
| --- | --- |
| Unique visitors | 30 |
| Pageviews | 62 |
| Bounce rate | **74%** |
| Avg visit duration | **99 sec** |

### Top pages by visits (Plausible)

| Page | Pageviews | Visitors |
| --- | --- | --- |
| `/` | 22 | 16 |
| `/workshop-mallacoota` | 8 | 6 |
| `/project/studio-at-65` | 4 | 4 |
| `/about` | 5 | 3 |
| `/services` | 5 | 3 |
| `/blog/easter-in-mallacoota-2026` | 3 | 3 |
| `/project/scallywags` | 3 | 2 |

**Note the Plausible–GSC divergence:** the Easter blog drove 53 clicks in GSC but only 3 visits in Plausible over the 12-day window — confirming traffic to that post has mostly collapsed post-Easter (seasonal, now dead).

The **Workshop page** is the #2 Plausible page but has **zero GSC impressions** — that's pure social/direct traffic from Instagram/Facebook promotion.

### Exit pages

Plausible on this plan doesn't expose entry/exit page metrics via the stats API we have access to. **Flag:** no goals or events are configured in Plausible — chat opens, phone clicks, email clicks, contact form submissions, and workshop registrations are all invisible in the analytics. This should be fixed before doing any more diagnosis.

---

## 4. THE CONVERSION GAP

### The "chat" funnel (the stated de-facto conversion event)

`chat_conversations` rows in 90 days: **8**

| Date (UTC) | Funnel | Real? |
| --- | --- | --- |
| 2026-02-16 | seo | 1 real-ish: user wrote "Just read an article and think I need help", bot replied "Fair enough – what kind of business are you running?", user never replied |
| 2026-03-24 02:00:16 | general | "you are gay" |
| 2026-03-24 02:00:25 | general | "you are a homosexualle" |
| 2026-03-24 02:00:36 | general | "can i talk to you in french" |
| 2026-03-24 02:00:40 | general | "help" |
| 2026-03-24 02:00:46 | general | "please help" |
| 2026-03-24 02:00:51 | general | "please help" |
| 2026-03-24 02:00:57 | general | "need website" |

7 of 8 created in a 41-second burst — almost certainly one person testing or a bot. **Only one plausibly-real conversation in 90 days, and they were lost after the bot's curt 8-word reply.**

Also note: the live site HTML has **no chat widget mounted** — I grepped `index.html`, `contact.html`, `services.html`, `about.html`, `main.js`. No `/api/chat` endpoint exists. So `chat_conversations` is almost certainly populated by the v2 rebuild or a staging environment — **not the live site Matt is worried about.** Worth confirming.

Also the `chat_conversations` schema only has `id, funnel, created_at, updated_at` — no `status`, `business_name`, `email`, etc. The `DATABASE_SCHEMA` file in repo root is **aspirational, not actual**. `status='converted'` tracking doesn't exist.

### The contact-form funnel (actual live-site conversion event)

`contact_submissions` rows in 90 days: **13**

| Category | Count | Notes |
| --- | --- | --- |
| Workshop registrations | 8 | 1 was Matt himself testing (2026-04-02). 7 real sign-ups — this is the one working funnel. |
| Spam bots | 4 | Random gibberish names, suspicious Gmail pattern emails (`i.siwij.o.v.u5.7@gmail.com` style). |
| Matt self-test | 1 | `matt@yourmateagency.com.au`, 2026-03-05 |
| **Genuine inbound sales leads from organic search** | **0** | — |

### Conversion math

| Funnel stage | Count (90d) |
| --- | --- |
| Organic impressions | ~6,157 |
| Organic clicks | ~107 |
| Real non-spam non-self site visits (estimated, AU only) | ~95 |
| Contact form submissions that aren't spam/self/workshop | **0** |
| Chat conversations from live site | **0** (widget isn't installed) |
| Real sales leads attributable to SEO | **0** |

**The conversion rate from organic search to sales lead isn't low. It's zero.**

The drop-off point isn't mysterious — most landings are on the Easter blog (seasonal informational) or client project pages (Hammond/Studio 65/Scallywags) where YMA is the builder in small print. Someone who lands there has no obvious reason to hire YMA.

---

## 5. LIKELY CAUSES (ranked, most likely first)

### 1. The homepage hero has no job. (HIGHEST IMPACT)

The 100vh hero is a typewriter animation cycling through "YOUR WEBSITE/AI AUTOMATION/SEO/MARKETING/CONTENT MATE" with a sub-line "I build what your business needs. Not what makes me more money."

Above the fold, a first-time mobile visitor (who is 65% of clicks) sees:
- No CTA button, no phone number, no chat prompt
- No location ("Gippsland" / "Mallacoota") mentioned
- No service specificity until the animation cycles
- No social proof (reviews section is `display:none`)
- First click target is in the nav or after scrolling past the full viewport

With a 74% bounce rate and 99-second visit average on Plausible, visitors aren't reading past the hero.

### 2. The top-performing page (Easter blog) has no YMA CTA.

`/blog/easter-in-mallacoota-2026` drove 53 clicks (50% of site traffic) at position 4.4. The article lists **client phone numbers for other businesses** (Pelican Point, Pacific Fishing, East Gippsland Sportfishing, Mallacoota Boardriders) but the only YMA conversion path is a single small inline "get in touch" link at the very end of the 657-line page. No CTA module, no "need a website like this?" card, no lead magnet. The biggest traffic page converts to the best competitors YMA has (YMA's own clients).

### 3. The chat widget isn't on the live site.

You (or the team) are tracking `chat_conversations` as the conversion event, but the live site has no chat integration. Either the widget lives on v2 and is meant to have been migrated, or the signal is entirely being captured on a non-production environment. Either way, **the "near-zero enquiries" observation is real and worse than thought**.

### 4. Google ranks `/about` and `/services` for buyer-intent Gippsland queries — not the homepage.

"digital marketing agency gippsland", "seo agency gippsland", "seo company gippsland", and "seo services gippsland" all produce 70+ impressions at positions 17-35 — but point at `/about` (meta: "About Matt…") and `/services` (pos 55-71). The homepage is only surfaced once. The metadata and H1 of `/about` and `/services` don't fit the search intent of someone typing "seo company gippsland", which explains the 0% CTR.

### 5. No analytics for conversion events.

Plausible has no goals configured. Phone clicks, email clicks, contact form submissions, and workshop registrations aren't measured. Every diagnosis from here forward is blind on the "what did visitors actually try to do?" axis.

### 6. The DATABASE_SCHEMA file is out of date.

It promises columns (`status`, `business_name`, `email`, etc.) that don't exist in the real `chat_conversations` table. Any future agents relying on this doc will produce broken analysis — worth cleaning up so we don't stack errors.

### 7. Traffic is wrong-intent by design.

~80% of top-30 queries by impressions are informational (how to set up GBP, how to get Google reviews, SEO vs Google Ads, how long SEO takes). That's top-of-funnel content. It drives very few clicks and near-zero commercial intent. The blog strategy is building authority but not closing the loop — there are no mid-funnel calls-to-action linking informational content to a specific YMA offer.

---

## 6. PROPOSED EXPERIMENTS (ranked by expected impact)

### A) Rewrite the homepage above-the-fold to close on something specific. (biggest lever)
- **Page:** `/` (index.html hero section)
- **Change:** Replace the 100vh typewriter-only hero with: one-line offer ("Websites, SEO & AI for small businesses in Gippsland"), Matt's face, a single primary CTA button ("Get a free 15-min call → "), a secondary "Call 0478 101 521" visible on mobile above the fold. Keep the typewriter as a secondary flourish below.
- **Expected outcome:** +3-5× the homepage's CTA clicks; raise page-2+ visits from ~20% to ~50%.
- **Success metric:** pageviews/visitor rises from 2.1 to >3.0 and a new `cta_click` Plausible goal fires on >10% of homepage visits.

### B) Add an end-of-article CTA module to every blog post (esp. Easter and how-long-does-seo-take).
- **Page:** blog template (one change, propagates to all ~40 posts)
- **Change:** After the final paragraph of every blog article, insert a branded CTA card: "Need a mate for your [topic]? I help Gippsland small businesses do exactly this. 15-min call → ". Particular target: Easter blog (53 clicks, 0 CTAs) and how-long-does-seo-take (1130 impressions).
- **Expected outcome:** Convert some of the 110 impressions/day of informational traffic into at least 1-2 qualified enquiries/month.
- **Success metric:** ≥ 1 contact form or chat started per 100 blog visits (vs current 0/1000+).

### C) Rewrite the `/services` page's title and H1 to match Gippsland buyer intent; add internal links from blog.
- **Page:** `/services`
- **Change:** Title + H1 + first paragraph should target "seo agency gippsland" / "digital marketing agency gippsland" directly — these have 70+ impressions at position 17-35 with 0% CTR. The page has the CTAs; it just can't be found. Add internal links from top-of-funnel blog posts (Local SEO Guide, How Long Does SEO Take) pointing at `/services` with anchor text that matches these queries.
- **Expected outcome:** Move from pos 17-35 → pos 8-12, and start capturing some of the 288 monthly gippsland-service impressions.
- **Success metric:** `/services` goes from 1 click / 90 days to ≥ 5 clicks / month, and average position for "seo agency gippsland" drops below 15.

### D) Install a real chat widget on the live site, or replace the "Chat about X" links on /services with actual conversational capture.
- **Page:** live site, especially `/services` and every `chat_conversations` reference
- **Change:** Either mount the same chat widget that's firing on v2 onto v1, OR replace "Chat about websites →" on `/services` with a 2-question form (what business, how to reach you) that writes to `contact_submissions`. Also rewrite the bot's opening reply — the current "Fair enough - what kind of business are you running?" lost the only real conversation in 90 days by being too terse/cold.
- **Expected outcome:** Capture the intent that is currently dying at the "Chat about X" misleading-CTA link.
- **Success metric:** ≥ 3 legitimate `chat_conversations` or `contact_submissions` per month attributable to the services page.

### E) Wire up Plausible goals (cheap, high info-value).
- **Not a site change** — just Plausible config.
- **Change:** Add custom goals for: `phone_click` (tel: links), `email_click` (mailto: links), `contact_form_submit`, `workshop_register`, `outbound_cta_click` (anything pointing to /contact). Add to site-wide `<script>` on v1 build.
- **Expected outcome:** You can actually see what visitors are trying to do, instead of guessing from bounce rate.
- **Success metric:** Every experiment above becomes measurable instead of vibes.

---

## Appendix: data sources & caveats

- GSC property: `sc-domain:yourmateagency.com.au`, 90-day window via `get_advanced_search_analytics`
- Plausible: the `-yma` MCP server returned 401; generic `plausible` server with `site_id=yourmateagency.com.au` worked. Data only starts 2026-04-09 (tracking script installed then, or prior data retention lapsed).
- Supabase: queried `chat_conversations`, `chat_messages`, `contact_submissions` via PostgREST with service key from `.env.local`.
- No front-end files were modified. No git commits. No Plausible/GSC config changes.
- Cost: $0 — all sources were first-party.
