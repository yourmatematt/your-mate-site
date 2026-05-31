# Discovery Document: Your Mate Agency

**Date:** 2026-04-08
**Prepared by:** Claude (autonomous agent buildout)
**Business slug:** `your-mate-agency`

---

## 1. Business Overview

| Field | Detail |
|-------|--------|
| **Business name** | Your Mate Agency |
| **Trading name** | Your Mate Agency |
| **ABN** | 12 372 123 456 |
| **Owner/operator** | Matt |
| **What they do** | Web design, development, local SEO, Google Business Profile optimisation, analytics setup, AI consultancy, social media strategy, and ongoing digital support for small businesses |
| **Target customer** | Small business owners in regional Victoria — tradies, hospitality, accommodation providers, primary producers, retail, tourism operators, cafes, restaurants |
| **Industry** | Digital marketing / Web development agency |
| **Sub-industry** | Regional small business services |
| **Geographic focus** | Regional Victoria, Australia — specifically East Gippsland (Mallacoota, Bairnsdale, Lakes Entrance, Sale, Traralgon) extending to cross-border NSW (Merimbula, Bega) |
| **Base location** | Mallacoota, Gippsland, Victoria |
| **Years in operation** | UNKNOWN — needs human input |
| **Growth stage** | Early/growth — active portfolio of 6 completed projects, 2 in progress |
| **Number of staff** | 1 (solo operator) |
| **Key competitors (local)** | UNKNOWN — needs human input. Likely other regional web designers and Gippsland-based agencies |
| **Key competitors (online)** | DIY platforms (Wix, Squarespace, Shopify), city-based agencies marketing to regional clients, freelancer marketplaces |
| **USPs** | Direct access to the builder (no account managers), regional expertise, transparent pricing, custom solutions not templates, long-term partnership model, AI consultancy as a differentiator |
| **Hard to replicate** | Deep local knowledge of East Gippsland business landscape, personal relationships with local business owners, hands-on solo operator model means clients always talk to the person building their site |

### Services Offered (8 categories)

1. **Website Development** — Custom sites (React 18 + TypeScript + Tailwind + shadcn/ui stack)
2. **Local SEO & Blog Content** — Google Search Console optimisation, blog content strategy
3. **Google Business Profile** — Setup and ongoing optimisation for Google Maps visibility
4. **Analytics & Tracking** — GA4 and Hotjar setup with plain-English reporting
5. **AI Consultancy** — Practical AI tools for business automation and efficiency
6. **Social Media Setup & Strategy** — Content creation, scheduling, engagement
7. **Custom Add-ons** — eCommerce, booking systems, payment processing
8. **Ongoing Consultation & Support** — Post-launch maintenance and guidance

### Completed Client Projects

| Client | Industry | Domain | Key Results |
|--------|----------|--------|-------------|
| Hammond Properties | Luxury holiday rentals | hammondproperties.com.au | 42% increase in enquiries, 1,348 Google clicks, 247 QR scans |
| Scallywags | Seafood restaurant & boat tours | scallywagsmallacoota.com.au | #1 "Mallacoota restaurants", 1,475 Google clicks, 70% phone booking reduction |
| Studio @ 65 | Hair salon | studioat65.com.au | #1 "Mallacoota hairdresser", 274 Google clicks, 95% phone booking reduction |
| By Nanny Rae Rae | Handmade children's clothing | UNKNOWN | Full eCommerce with Stripe, AI chatbot, admin dashboard |
| Massage by Jodie | Remedial massage therapy | UNKNOWN | Square Appointments integration, WCAG AA compliance |
| Mallacoota Barbie Boats | Boat hire | UNKNOWN | UNKNOWN |

**In progress:** Aus Fishing Classics, EX1191

---

## 2. Current Digital Footprint

### Website

| Field | Detail |
|-------|--------|
| **Primary domain** | yourmateagency.com.au |
| **Other domains** | None identified |
| **Hosting** | Vercel (serverless functions + static hosting) |
| **Framework** | Static HTML5/CSS3/Vanilla JS (agency site), React 18 + TypeScript (client projects) |
| **Build tool** | Vite 7.2.4 |
| **Backend** | Supabase (PostgreSQL), Vercel Serverless Functions (Node.js) |
| **CMS** | Supabase database tables (blog_posts, news_articles, projects, client_reviews) — no traditional CMS |
| **SSL** | Yes (Vercel automatic) |
| **CDN** | Yes (Vercel global edge network) |

### Analytics & SEO Tools

| Tool | Status | Detail |
|------|--------|--------|
| **Google Analytics 4** | ACTIVE | Measurement ID: G-39CJ3GEM4P, installed on all pages |
| **Plausible Analytics** | NOT CONNECTED | 401 error — not configured for yourmateagency.com.au in current Plausible account |
| **Google Search Console** | NOT CONNECTED | Only vpnguide.com.au exists in GSC. yourmateagency.com.au needs to be added |
| **DataForSEO** | AVAILABLE | MCP connected, can be used for keyword research and competitor analysis |
| **Hotjar** | UNKNOWN | Mentioned in services copy but unclear if installed on agency site |

### Communication & Notifications

| System | Status | Detail |
|--------|--------|--------|
| **Email** | matt@yourmateagency.com.au | Primary business email |
| **Phone** | 0478 101 521 | Listed on contact page |
| **Telegram Bot** | ACTIVE | Contact form submissions sent to Matt's Telegram (Chat ID: 5104527408) |
| **CRM** | Supabase | chat_conversations and chat_messages tables with funnel tracking (website/seo/ai/content) |

### Social Media

| Platform | Status |
|----------|--------|
| **LinkedIn** | Listed in schema markup — UNKNOWN handle/URL |
| **Twitter/X** | Listed in schema markup — UNKNOWN handle/URL |
| **Instagram** | Listed in schema markup — UNKNOWN handle/URL |
| **Facebook** | Listed in schema markup — UNKNOWN handle/URL |
| **TikTok** | Listed in schema markup — UNKNOWN handle/URL |
| **GitHub** | Listed in schema markup — UNKNOWN handle/URL |
| **YouTube** | Listed in schema markup — UNKNOWN handle/URL |

**NEEDS HUMAN INPUT:** Actual social media URLs, follower counts, posting frequency, and whether these accounts are actively maintained.

### Existing Content Volume

| Content Type | Count | Notes |
|--------------|-------|-------|
| **Blog posts** | 37 published | Stored in Supabase, rendered via API |
| **Main pages** | 8 | Home, About, Services, Work, Blog, News, FAQ, Contact |
| **Contact landing pages** | 4 | /contact-website, /contact-seo, /contact-ai, /contact-content |
| **Portfolio project pages** | 6 | Dynamic from database |
| **Blog category pages** | 5 | Websites, Local SEO, Running Your Business, Industry Guides, Comparisons |
| **News articles** | UNKNOWN count | Stored in tech_translations table |
| **Sitemap URLs** | 80 | Comprehensive coverage |
| **Lead magnets** | 1 | GBP checklist PDF for accommodation owners |

---

## 3. Customer and Audience

### Primary Customer Persona

| Field | Detail |
|-------|--------|
| **Name** | Regional small business owner |
| **Age** | 30-60 |
| **Gender** | Mixed, likely skews male (tradies) |
| **Income** | Small business income, cost-conscious |
| **Location** | East Gippsland, regional Victoria, cross-border NSW |
| **Industries** | Tradies, hospitality, accommodation, retail, tourism, cafes/restaurants, primary producers, professional services |
| **Pain points** | No website or outdated website, not showing up on Google, getting calls they could automate, overwhelmed by tech, burned by agencies before, DIY builders too limited, don't know what they need |
| **Decision style** | Considered but not long — wants to talk to a real person, wants to see examples, price-sensitive but understands value |

### Secondary Personas

1. **Accommodation providers** — Specific focus evidenced by GBP checklist PDF, Hammond Properties case study, motel/accommodation blog content
2. **Seafood/fishing businesses** — Scallywags case study, Aus Fishing Classics project, dedicated blog content
3. **Health/wellness practitioners** — Massage by Jodie, Studio 65 case studies

### How Customers Currently Find the Business

| Channel | Evidence |
|---------|----------|
| **Google organic** | Strong local SEO strategy, 37 blog posts targeting regional keywords |
| **Word of mouth / referrals** | Small town presence in Mallacoota, personal relationships |
| **Portfolio/case studies** | Work page showcases completed projects with results |
| **Blog content** | Educational content targeting "how to" and "guide" queries |
| **Direct** | Contact page, phone number prominently displayed |

**UNKNOWN — needs human input:**
- Customer lifetime value
- Average sale value (website build, monthly retainer, etc.)
- Sales cycle length
- Conversion rate from enquiry to client
- Paid advertising history

---

## 4. Goals and Priorities

**UNKNOWN — needs human input for most of this section.**

Based on evidence in the codebase:

| Inferred Goal | Evidence |
|---------------|----------|
| **Grow organic traffic** | 37 blog posts, extensive SEO implementation, 3 audit reports from Jan 2026 |
| **Capture leads via funnels** | 4 separate contact landing pages (website/seo/ai/content), CRM schema with funnel tracking |
| **Establish authority in regional web dev** | Blog content strategy heavily focused on "regional Victoria" and "Gippsland" keywords |
| **Expand service offerings** | AI consultancy and news section suggest broadening beyond pure web dev |
| **Scale through content marketing** | High blog volume, news curation, lead magnet (GBP PDF) |

**NEEDS HUMAN INPUT:**
- Primary business goal for next 90 days
- Revenue targets
- Lead/sale targets
- Budget constraints
- Things explicitly NOT to do
- Success metrics

---

## 5. Existing Marketing Assets

### Brand Assets

| Asset | Status | Detail |
|-------|--------|--------|
| **Brand guidelines** | COMPREHENSIVE | Full document covering colours, typography, spacing, components, animations, responsive breakpoints — 70+ CSS classes documented |
| **Logo** | EXISTS | Green background with white text in nav bar |
| **Primary colour** | #2D9F5E (green) | Used as brand accent throughout |
| **Secondary colours** | Black (#000), White (#fff), grey scale | Clean, minimal palette |
| **Font** | Inter (400/500/600/700) | Consistent across all pages |
| **Profile photo** | matt.webp | Bio photo used on About section |

### Content Library

| Asset Type | Count/Status |
|------------|-------------|
| **Blog posts** | 37 published, well-structured with SEO metadata |
| **Case studies** | 6 completed projects with measurable results |
| **FAQ content** | 13 questions with schema.org FAQPage markup |
| **Lead magnet** | 1 PDF — "5 Google Business Profile Fixes That Stop Sending Your Guests to Booking.com" |
| **Client testimonials** | Stored in client_reviews table (count UNKNOWN) |
| **Portfolio images** | Project hero images stored in Supabase |
| **Easter seasonal content** | 1 blog post with 8 custom images |

### Customer Reviews

| Platform | Status |
|----------|--------|
| **On-site testimonials** | Yes — pulled from Supabase client_reviews table |
| **Google Reviews** | UNKNOWN |
| **Facebook Reviews** | UNKNOWN |
| **Other review platforms** | UNKNOWN |

### Existing SEO Audits (January 2026)

Three comprehensive audit reports exist:

1. **META_TAG_AUDIT_REPORT.md** — Overall score 7.5/10. Issues: homepage title too long, about/contact titles too short, missing CTAs in meta descriptions
2. **SEO_AUDIT_REPORT.md** — Overall score 7.5/10. Gaps: blog header hierarchy, missing BreadcrumbList schema, limited internal linking, no location-specific landing pages
3. **SEO_STRUCTURE_AUDIT.md** — Overall score 7.5/10. Schema markup 9/10, header hierarchy 6/10, internal linking 6/10

### Ad Accounts

UNKNOWN — needs human input. No evidence of paid advertising in the codebase.

### Press Mentions

UNKNOWN — needs human input.

---

## 6. Voice and Tone

### Based on Existing Copy Analysis

| Attribute | Detail |
|-----------|--------|
| **Tone** | Casual, direct, friendly — "your mate" positioning |
| **Formality** | Informal. First person singular ("I build", "I tell you"). Uses "mate" language naturally |
| **Jargon level** | Deliberately accessible. FAQ page explicitly avoids technical jargon. Copy uses phrases like "plain English reports" |
| **Emoji usage** | Minimal on website. Telegram notifications use one emoji (envelope). Blog and page content: no emojis |
| **Language variant** | Australian English (colour, optimisation, organisation) |
| **Personality** | Honest, no-BS, regional, practical. Anti-corporate. Positions against agencies that upsell or use account managers |

### Writing Examples That Sound "Right"

- "I build what your business needs. Not what makes me more money."
- "Tell me what you're trying to do. I tell you cost. I build it. You run your business."
- "Thanks mate, I'll be in touch soon."
- "No jargon. No runaround."
- Services described with "What you get" and "What you don't" framing

### Writing That Would Feel Wrong

- Corporate-speak ("leverage synergies", "stakeholder alignment", "digital transformation")
- Aggressive sales language ("LIMITED TIME OFFER", "ACT NOW")
- Overly technical language without explanation
- Third-person voice ("Your Mate Agency provides...")
- Anything that sounds like a big city agency
- Emojis in body copy

### Banned Words/Phrases (Inferred)

- "Leverage", "synergy", "paradigm", "disruption"
- "Our team" (it's one person)
- "Schedule a demo" (not SaaS)
- "Enterprise", "solutions", "scalable" (regional small business focus)

### Required Disclaimers

UNKNOWN — needs human input on any industry-specific disclaimers, privacy policy requirements, or advertising standards obligations.

---

## 7. Technical Access Required

| System | Current Status | Access Needed |
|--------|---------------|---------------|
| **Google Search Console** | NOT CONNECTED for yourmateagency.com.au | Add sc-domain:yourmateagency.com.au or URL prefix property |
| **Google Analytics 4** | ACTIVE (G-39CJ3GEM4P) | Read access for reporting — needs GA4 MCP or API connection |
| **Plausible Analytics** | NOT CONFIGURED | Either add yourmateagency.com.au to Plausible account or confirm if GA4 is the primary analytics tool |
| **Supabase** | ACTIVE | Read access for content audits, blog performance, contact submission analysis |
| **Vercel** | ACTIVE | Deployment access, function logs, performance monitoring |
| **Telegram Bot** | ACTIVE | Already sending contact form notifications |
| **Domain registrar** | UNKNOWN | Needed for DNS verification if adding GSC domain property |
| **Google Business Profile** | UNKNOWN | Needs GBP MCP or API access for monitoring and optimisation |
| **Social media accounts** | UNKNOWN | Platform-specific access for posting and analytics |
| **Email platform** | UNKNOWN | If using email marketing, need API access |

### MCP Servers Currently Connected

| MCP | Status | Notes |
|-----|--------|-------|
| **Google Search Console** | Connected but wrong property | Only vpnguide.com.au — need to add yourmateagency.com.au |
| **DataForSEO** | Connected | Available for keyword research, SERP analysis, backlink data |
| **Plausible** | Connected but 401 | yourmateagency.com.au not authorised |
| **Notion** | Connected | Available for documentation, task management |
| **Gmail** | Connected | Available for email operations |
| **Vercel** | Connected | Deployment, logs, environment management |

---

## 8. Compliance and Legal

| Area | Status |
|------|--------|
| **Industry regulations** | None specific — web development is unregulated in Australia |
| **Privacy obligations** | Australian Privacy Principles (APP) apply. Privacy policy UNKNOWN if present |
| **Required disclosures** | ABN listed (12 372 123 456). Any affiliate relationships UNKNOWN |
| **GDPR** | Likely not applicable unless serving EU clients, but Supabase data handling should comply |
| **Advertising standards** | Australian Consumer Law — testimonials must be genuine, pricing claims must be substantiatable |
| **Things the business legally cannot say** | Cannot guarantee Google rankings. Cannot make false claims about competitors |
| **Insurance** | UNKNOWN — professional indemnity, public liability status unknown |

**NEEDS HUMAN INPUT:** Privacy policy status, terms of service, any specific legal considerations for the business.

---

## 9. Team and Stakeholders

| Role | Person | Detail |
|------|--------|--------|
| **Owner/operator** | Matt | Makes all marketing decisions, builds all client work, handles all communication |
| **Content approval** | Matt | Solo operator — all content decisions are his |
| **Client communication** | Matt | Direct client contact, no intermediaries |
| **Reporting recipient** | Matt | Only stakeholder |

### Reporting Preferences

UNKNOWN — needs human input on:
- Preferred reporting cadence (weekly, fortnightly, monthly)
- Preferred format (email, PDF, dashboard, Notion page)
- Key metrics Matt wants to see
- Threshold alerts (e.g. traffic drops, ranking changes)

---

## 10. Current Pain Points

### Inferred from Codebase Evidence

| Pain Point | Evidence |
|------------|----------|
| **GSC not connected** | yourmateagency.com.au is missing from Search Console — can't monitor search performance properly |
| **Analytics fragmented** | GA4 is active but Plausible is not configured, no unified dashboard |
| **SEO audit recommendations unactioned** | 3 comprehensive audits from January 2026 identified header hierarchy, internal linking, and meta tag issues — unclear how many have been addressed |
| **No location-specific landing pages** | SEO audit flagged this as HIGH priority — Bairnsdale, Lakes Entrance, Sale need dedicated pages |
| **Blog internal linking weak** | Posts don't link to services or to each other — audit scored internal linking 6/10 |
| **Header hierarchy issues** | Multiple H1s on homepage, services/about pages lack H2 structure |
| **Solo operator bandwidth** | One person doing everything — marketing automation would free up significant time |
| **Content production bottleneck** | 37 blog posts is solid but ongoing content creation competes with client work |
| **No email marketing system visible** | No evidence of email sequences, newsletters, or list building beyond contact form |
| **No automated reporting** | No evidence of scheduled performance reports |
| **Review acquisition unclear** | Client reviews exist in database but no systematic review generation process visible |

### Opportunities Being Missed (Inferred)

1. **Featured snippets** — SEO audit identified 5+ opportunities for "how much does a website cost" etc.
2. **HowTo schema** — Blog posts are how-to guides but don't use HowTo structured data
3. **Location pages** — No dedicated pages for Bairnsdale, Lakes Entrance, Sale, Traralgon despite serving these areas
4. **Email nurture sequences** — Contact form captures leads but no automated follow-up
5. **Content repurposing** — 37 blog posts could be turned into social content, email newsletters, GBP posts
6. **Google Business Profile** — Lead magnet exists for clients but GBP status of agency itself is UNKNOWN

---

## 11. Assets NOT to Touch

| Asset | Reason |
|-------|--------|
| **Brand tagline** | "I build what your business needs. Not what makes me more money." — core positioning, do not modify |
| **Client testimonials** | Real attribution, genuine reviews — do not paraphrase or modify |
| **Case study metrics** | Specific numbers (42% increase, 1,348 clicks, etc.) — do not fabricate or round |
| **FAQ answers** | Contains specific process and pricing guidance — changes need Matt's approval |
| **Contact information** | Phone, email, ABN — must remain accurate |
| **Brand guidelines document** | Comprehensive design system — changes need Matt's approval |
| **Client project pages** | Hammond Properties, Scallywags, etc. — specific to client relationships |
| **Schema.org structured data** | Currently scored 9/10 — changes could break rich results |
| **Vercel deployment config** | Redirects and rewrites are production-critical |
| **Supabase database schema** | Production tables with live data |

---

## 12. Recommended Agent Configuration

### Agents This Business Needs

| Agent | Priority | Rationale |
|-------|----------|-----------|
| **SEO Monitor** | HIGH | Daily rank tracking, GSC monitoring, technical SEO checks, keyword opportunity identification |
| **Content Writer** | HIGH | Blog posts, location pages, meta tag optimisation, content gap filling — biggest leverage for a solo operator |
| **Reporting Agent** | HIGH | Automated weekly/monthly performance reports — Matt shouldn't be pulling data manually |
| **GBP Manager** | MEDIUM | Google Business Profile posts, review monitoring, Q&A management |
| **Social Media Manager** | MEDIUM | Repurpose blog content to social platforms, schedule posts, monitor engagement |
| **Technical SEO Auditor** | MEDIUM | Scheduled site audits, broken link checks, Core Web Vitals monitoring, schema validation |
| **Outreach Manager** | LOW | Local link building, business directory submissions, partnership opportunities |
| **Email Marketing Agent** | LOW | Newsletter creation, lead nurture sequences — only once an email platform is set up |

### Vault Template

**Best fit:** Professional Services (regional) — customised for digital agency context.

Key vault sections needed:
- `/business/` — Business profile, services, pricing, case studies
- `/seo/` — Keyword universe, rank tracking, audit history, content calendar
- `/content/` — Blog briefs, drafts, published content log, content performance
- `/brand/` — Voice guide, brand guidelines, approved copy, banned words
- `/reporting/` — Report templates, KPI dashboards, historical data
- `/competitors/` — Competitor profiles, gap analysis, SERP tracking
- `/clients/` — Client project briefs (reference only, not client deliverables)

### MCPs Required

| MCP | Status | Action Needed |
|-----|--------|---------------|
| **Google Search Console** | Connected (wrong property) | Add yourmateagency.com.au property |
| **DataForSEO** | Connected | Ready to use |
| **Plausible** | Connected (401) | Add yourmateagency.com.au site OR confirm GA4 is primary |
| **Notion** | Connected | Set up vault structure |
| **Gmail** | Connected | For email operations |
| **Vercel** | Connected | For deployment monitoring |
| **Google Business Profile** | NOT CONNECTED | Needs GBP MCP for posting and review monitoring |
| **Google Analytics 4** | NOT CONNECTED via MCP | GA4 tag is on site but no MCP for automated reporting — consider GA4 API integration |
| **Social Media** | NOT CONNECTED | Need platform-specific MCPs once social strategy is confirmed |

### Routines

| Routine | Frequency | Agent | Description |
|---------|-----------|-------|-------------|
| **Rank tracking** | Daily | SEO Monitor | Check top 50 keyword positions, flag movements > 3 positions |
| **GSC performance check** | Daily | SEO Monitor | Clicks, impressions, CTR, average position trends |
| **Technical SEO scan** | Weekly | Technical Auditor | Broken links, Core Web Vitals, schema validation, indexing status |
| **Content opportunity scan** | Weekly | Content Writer | Identify content gaps, trending topics, competitor content analysis |
| **Performance report** | Weekly | Reporting Agent | Traffic, rankings, leads, content performance summary |
| **Blog post draft** | Fortnightly | Content Writer | Draft 1 new blog post based on content calendar and keyword research |
| **GBP post** | Weekly | GBP Manager | Create and schedule a Google Business Profile post |
| **Social content batch** | Weekly | Social Media | Repurpose 1 blog post into 3-5 social posts |
| **Competitor check** | Monthly | SEO Monitor | Full competitor SERP analysis, new content detection, backlink changes |
| **Full SEO audit** | Monthly | Technical Auditor | Comprehensive audit against January 2026 baseline |
| **Monthly report** | Monthly | Reporting Agent | Full month performance review with recommendations |

### Service Tier

**Recommended:** Mid-tier (solo operator, growing agency, strong existing content base, moderate technical complexity)

- Daily automated monitoring
- Weekly content and social output
- Monthly comprehensive reporting
- Approval gates on all published content (Matt reviews before anything goes live)

### Approval Gates

| Action | Approval Required |
|--------|-------------------|
| **Publish blog post** | YES — Matt must review and approve |
| **Publish GBP post** | YES — until trust is established |
| **Send email campaign** | YES — always |
| **Modify site code** | YES — always |
| **Social media post** | YES initially, can move to auto-publish once voice is validated |
| **Internal reports** | NO — can be auto-generated and delivered |
| **Keyword research** | NO — can run autonomously |
| **Technical audits** | NO — can run autonomously |
| **Rank tracking** | NO — can run autonomously |

---

## 13. First Tasks to Fire

In priority order, once the system is live:

| # | Task | Agent | Impact | Detail |
|---|------|-------|--------|--------|
| 1 | **Add yourmateagency.com.au to Google Search Console** | Manual (Matt) | CRITICAL | Without GSC data, no agent can monitor search performance. This blocks everything. |
| 2 | **Run baseline keyword research** | SEO Monitor | HIGH | Use DataForSEO to map current keyword universe, search volumes, keyword difficulty, and competitor overlap for all 37 blog post topics |
| 3 | **Fix meta tag issues from January audit** | Content Writer | HIGH | Homepage title too long, About/Contact titles too short, missing CTAs in descriptions — quick wins flagged in META_TAG_AUDIT_REPORT.md |
| 4 | **Fix header hierarchy issues** | Technical Auditor | HIGH | Multiple H1s on homepage, missing H2s on services/about pages — flagged in SEO_STRUCTURE_AUDIT.md |
| 5 | **Create Bairnsdale location page** | Content Writer | HIGH | SEO audit flagged location pages as HIGH priority. Start with Bairnsdale (highest search volume after Mallacoota) |
| 6 | **Add internal links to top 10 blog posts** | Content Writer | HIGH | Internal linking scored 6/10. Cross-link blog posts to services and to each other |
| 7 | **Run competitor domain analysis** | SEO Monitor | MEDIUM | Use DataForSEO to identify who ranks for target keywords, their backlink profiles, and content gaps |
| 8 | **Generate first automated performance report** | Reporting Agent | MEDIUM | Establish baseline metrics and reporting template |
| 9 | **Create content calendar for next 90 days** | Content Writer | MEDIUM | Based on keyword research, content gaps, and seasonal opportunities |
| 10 | **Add HowTo schema to how-to blog posts** | Technical Auditor | MEDIUM | 5+ posts are step-by-step guides that qualify for HowTo rich results |

---

## Questions Requiring Human Input

The following questions could not be answered from the codebase and need Matt's input:

### Business

1. How long has Your Mate Agency been operating? 
1 year
2. Who are your main local competitors? Any specific agencies or freelancers you compete against?
not sure who the competitors are
3. What's your rough average project value (website build, retainer, etc.)?
$3,000
4. What's your customer lifetime value estimate?
CLV: $3,000 (project-based, no recurring revenue yet). 
Strategic priority: convert past clients to $300+/mo retainers. 
Target: 3 retainer conversions in next 90 days = +$10,800/year recurring.
5. What's your typical sales cycle — from first enquiry to signed project?
usually 6-8 weeks but sometimes faster or slower

### Goals

6. What is your primary business goal for the next 90 days?
(a) launch Direct Booking Switch funnel properly, (b) convert the 3 warm leads (Hireboats, Wilton, Golf), (c) Learn Local workshop delivery in May. Pick one.
7. Do you have a lead target or revenue target?
2 new retainer clients + 1 Direct Booking Switch sale in 90 days = ~$13K.
8. What's your marketing budget (if any) for tools, advertising, content?
<$200/mo tools, $0 ads.
9. Are there things you explicitly do NOT want the agents doing? (e.g. never auto-publish, never contact clients, etc.)
never auto-publish to client sites, never email clients directly, never post to client socials, never commit to pricing without you, never touch Quorum Tours/Dale Winward. All drafts to you for approval first.

### Digital Footprint

10. What are the actual URLs for your social media accounts (LinkedIn, Instagram, Facebook, TikTok, YouTube, Twitter/X, GitHub)?
Facebook - https://www.facebook.com/profile.php?id=61580462158938
Instagram - https://www.instagram.com/yourmate_agency/
Linkedin - https://www.linkedin.com/company/your-mate-agency/
YouTube - (nothing posted) @yourmateagency
11. Are these social accounts actively maintained? Posting frequency?
Linkedin and Facebook are active but only posting static blog links. No video content. The whole footprint is very stale.
12. Do you have a Google Business Profile for Your Mate Agency? If so, what's the status?
Yes I do, it's currently showing the wrong knowledge panel when searching "Your Mate Agency" shows a competitors GBP Panel "Your Marketing Mate".
13. Do you have an email marketing platform (Brevo, Mailchimp, etc.)? Email list size?
Looking at using activecampaign
14. Have you run any paid advertising campaigns (Google Ads, Meta Ads, etc.)?
No
15. Is Plausible intended to be your analytics tool, or is GA4 the primary?
Plausible

### Access

16. Can you add yourmateagency.com.au to Google Search Console? (This is the most critical blocker)
added
17. Do you want Plausible set up for this domain?
added and yes
18. What domain registrar is yourmateagency.com.au registered with?
godaddy


### Compliance

19. Do you have a privacy policy on the site?
no, Also flag: no privacy policy is a real gap given you're collecting form submissions on the workshop intake and contact forms. Worth fixing.
20. Do you have professional indemnity insurance?
yes
21. Any specific things you legally cannot claim? (e.g. guaranteed rankings)
Standard ACCC/ASIC rules: no guaranteed Google rankings, no guaranteed revenue/ROI, no "we're #1" without evidence, no fake testimonials, no misleading before/afters. Also: can't claim qualifications you don't hold.

### Operations

22. How do you want to receive reports? (Email, Notion, PDF, other)
email
23. How often do you want reports? (Weekly, fortnightly, monthly)
weekly (internal — Matt reading agent output)
24. What's your approval process — should all content come to you via Notion/email/Telegram for review before publishing?
email/telegram
25. Is there any existing content or client work that's currently underperforming that you'd like prioritised?
the homepage isn't converting to enquiries well, the 4 contact landing pages (/contact-website, /contact-seo, /contact-ai, /contact-content) probably aren't being found by anyone, and the 37 blog posts have weak internal linking so they're not feeding leads back to the contact pages

### Competitors

26. What are competitors doing that you wish you were doing?
one-per-industry-per-town exclusivity, sole-operator relationship layer, retainer model in regional AU, agent-orchestrated delivery (Paperclip), local community presence (column, workshop, MTA).
27. What are you doing that competitors aren't?
Real differentiators (current state, not aspirational):
- Case studies with actual measurable results (Hammond +42%, Scallywags #1, Studio 65 #1)
- Brutally honest transparent pricing on the site
- Sole operator model — clients always talk to the builder, no account managers
- Regional knowledge — actually live and operate in Mallacoota
- AI-powered agent infrastructure for delivery (new as of April 2026)


---

## Summary

Your Mate Agency is a well-positioned regional web agency with strong technical foundations, comprehensive brand guidelines, and a solid content library (37 blog posts, 6 case studies, 13 FAQs). The main gaps are in analytics infrastructure (GSC not connected, Plausible not configured), marketing automation (no email sequences, no social scheduling), and SEO execution (January 2026 audit recommendations largely unactioned).

The autonomous agent system should focus first on **connecting missing data sources** (GSC is critical), then **executing the existing audit recommendations** (quick wins with clear instructions), then **establishing ongoing monitoring and content production routines** that free Matt from manual marketing work so he can focus on client delivery.

The biggest opportunity is converting the existing 37-post blog into a traffic-generating machine through internal linking, meta tag optimisation, location pages, and featured snippet targeting — all of which were identified in the January audits but appear unactioned.
