# News Section Build — 12 Feb 2026

## What Was Built

Complete `/news` section for the Your Mate Agency website, consisting of:

### 1. `api/news.ts` — News Listing Page (503 lines)
- Vercel serverless function returning full HTML
- Links external `news.css` stylesheet (no inline CSS)
- Queries `tech_translations` joined with `tech_news_items` and `tech_news_sources` from Supabase
- Industry filter pills: tradies, hospitality, accommodation, primary_producers, retail, tourism
- Tag styling via CSS classes (`.news-tag--tradies` etc.), not inline styles
- TAG_LABELS map for display names (e.g. `primary_producers` → "Primary Producers")
- Green hero background (#2D9F5E) distinguishes from blog's black hero
- Pagination: 20 articles per page
- Filter via PostgREST `cs` operator: `.filter('tech_news_items.relevance_tags', 'cs', '{industry}')`
- Standard 7-link nav with News between Blog and Contact

### 2. `api/news/[slug].ts` — Article Detail Page (685 lines)
- Queries by `seo_metadata->>url_slug` directly (NOT slugified titles)
- Uses `.filter('seo_metadata->>url_slug', 'eq', requestSlug)` with `.maybeSingle()`
- 3 parallel Supabase queries: article, related articles (5), sidebar promos
- Lightweight markdown-to-HTML converter (no external dependency)
- External links get `target="_blank" rel="noopener noreferrer"`
- Green detail hero (#2D9F5E) with white semi-transparent tag pills
- Two-column layout: article content left, sticky sidebar right
- Sidebar contains: related articles, targeted promo blocks, general promo blocks (max 3 total)
- Promo targeting: industry-specific promos shown first, then general ones
- Share buttons: Facebook, Twitter/X, LinkedIn, Email (SVG icons)
- "Who this matters to" callout from `industry_relevance.summary`
- BreadcrumbList + NewsArticle schema.org structured data
- Graceful 404/500 error pages

### 3. `news.css` — Dedicated Stylesheet (~900 lines)
- Green hero for both listing and detail pages
- Industry tag colour palette:
  - tradies: #FEF3C7/#92400E
  - hospitality: #FFEDD5/#9A3412
  - accommodation: #DBEAFE/#1E40AF
  - primary_producers: #D1FAE5/#065F46
  - retail: #EDE9FE/#5B21B6
  - tourism: #CCFBF1/#115E59
- `.news-detail-hero .news-tag` white override for green background
- `.news-sidebar .news-promo` overrides for narrower sidebar context
- Responsive: 3-column → 2-column → 1-column grid
- Magazine-style featured article card at top
- Sticky sidebar on desktop, static on mobile

### 4. Site-Wide Navigation Updates
- Added `<a href="/news">News</a>` to 63 HTML files (desktop + mobile nav)
- Fixed by-nanny-rae-rae.html and massage-by-jodie.html (upgraded from 3-link to 7-link nav)
- Used PowerShell regex script for bulk updates

### 5. `vercel.json` Updates
- Rewrites: `/news/:slug` → `/api/news/:slug`, `/news` → `/api/news`
- Cache headers: `s-maxage=300, stale-while-revalidate=600` for `/news(.*)`

### 6. `sitemap.xml`
- Added `/news` URL entry

## Key Technical Decisions
- **External CSS over inline**: news.css linked via `<link>` tag, not embedded in serverless function
- **Direct JSONB query**: `seo_metadata->>url_slug` filter instead of fetching all articles and slugifying
- **`primary_producers` with underscore**: matches Supabase `relevance_tags` array values
- **Green hero (#2D9F5E)**: visual separation from blog section (which uses black)
- **Targeted promos first**: sidebar shows industry-relevant promos before general ones, max 3 total
- **Australian date format**: `en-AU` with `{ day: 'numeric', month: 'long', year: 'numeric' }`

## Supabase Tables Used
- `tech_translations` — translated article content (website_blog, seo_metadata, industry_relevance, status)
- `tech_news_items` — original news items (title, url, relevance_tags, published_at)
- `tech_news_sources` — news sources (name)
- `news_sidebar_promos` — promotional blocks (is_active, position, industry_target, title, description, cta_text, cta_url, style)
