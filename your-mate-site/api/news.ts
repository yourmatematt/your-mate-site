import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewsSource {
  name: string;
}

interface NewsItemData {
  title: string;
  url: string;
  relevance_tags: string[];
  published_at: string;
  source: NewsSource;
}

interface Article {
  id: string;
  website_blog: string;
  seo_metadata: Record<string, unknown> | null;
  industry_relevance: Record<string, unknown> | null;
  published_at: string | null;
  updated_at: string;
  news_item: NewsItemData;
}

interface Promo {
  id: string;
  title: string;
  description: string;
  cta_text: string;
  cta_url: string;
  style: string;
  position: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  { label: 'All', value: '' },
  { label: 'Tradies', value: 'tradies' },
  { label: 'Hospitality', value: 'hospitality' },
  { label: 'Accommodation', value: 'accommodation' },
  { label: 'Primary Producers', value: 'primary_producers' },
  { label: 'Retail', value: 'retail' },
  { label: 'Tourism', value: 'tourism' },
];

const VALID_INDUSTRIES = INDUSTRIES.map(i => i.value).filter(Boolean);

const TAG_LABELS: Record<string, string> = {
  tradies: 'Tradies',
  hospitality: 'Hospitality',
  accommodation: 'Accommodation',
  primary_producers: 'Primary Producers',
  retail: 'Retail',
  tourism: 'Tourism',
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+.*$/gm, '')     // remove entire heading lines
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold**
    .replace(/\*([^*]+)\*/g, '$1')      // *italic*
    .replace(/__([^_]+)__/g, '$1')      // __bold__
    .replace(/_([^_]+)_/g, '$1')        // _italic_
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [link](url)
    .replace(/`([^`]+)`/g, '$1')        // `code`
    .replace(/^[-*+]\s+/gm, '')         // - list items
    .replace(/^\d+\.\s+/gm, '')         // 1. ordered lists
    .replace(/^>\s+/gm, '')             // > blockquotes
    .replace(/---+/g, '')               // horizontal rules
    .replace(/\n{2,}/g, ' ')            // collapse multiple newlines
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, len: number): string {
  const clean = stripMarkdown(stripHtml(text));
  if (clean.length <= len) return clean;
  return clean.substring(0, len).replace(/\s+\S*$/, '') + '\u2026';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  });
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 80);
}

// ---------------------------------------------------------------------------
// Static HTML fragments (matching existing site exactly)
// ---------------------------------------------------------------------------

const NAV_HTML = `
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">YMA</a>
      <div class="nav-links">
        <a href="/work">Work</a>
        <a href="/about">About</a>
        <a href="/services">Services</a>
        <a href="/faq">FAQ</a>
        <a href="/blog">Blog</a>
        <a href="/news">News</a>
        <a href="/contact">Contact</a>
      </div>
      <div class="nav-hamburger" id="nav-hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>

  <div class="mobile-menu" id="mobile-menu">
    <nav class="mobile-menu-nav">
      <a href="/work">Work</a>
      <a href="/about">About</a>
      <a href="/services">Services</a>
      <a href="/faq">FAQ</a>
      <a href="/blog">Blog</a>
      <a href="/news">News</a>
      <a href="/contact">Contact</a>
    </nav>
  </div>`;

const FOOTER_HTML = `
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <div class="footer-location">
          <span class="footer-static">BUILT IN</span>
          <span class="footer-rotating" id="footer-location">MALLACOOTA</span>
          <span class="footer-static">BY YOUR MATE</span>
          <span class="footer-static">MATT</span>
        </div>
      </div>
      <div class="footer-right">
        <p class="footer-abn">ABN: 37179872328</p>
        <a href="mailto:matt@yourmateagency.com.au" class="footer-email">matt@yourmateagency.com.au</a>
        <a href="tel:+61478101521" class="footer-phone">0478 101 521</a>
        <div class="footer-socials">
          <a href="https://www.facebook.com/profile.php?id=61580462158938" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a href="https://www.instagram.com/yourmate_agency/" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/matthew-rowlands/" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="LinkedIn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="2" y="9" width="4" height="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a href="https://x.com/yourmateagency" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="X">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L19.5 4h-2l-5.2 6.3L8 4H4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
          <a href="https://medium.com/@matt_1225" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="Medium">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42zM24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" fill="currentColor"/>
            </svg>
          </a>
          <a href="https://www.youtube.com/@yourmateagency" target="_blank" rel="noopener noreferrer" class="footer-social-link" aria-label="YouTube">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>`;

const PAGE_SCRIPTS = `
  <script>
    var hamburger = document.getElementById('nav-hamburger');
    var mobileMenu = document.getElementById('mobile-menu');
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });
    document.querySelectorAll('.mobile-menu-nav a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });
    var footerLocations = ['MALLACOOTA','BAIRNSDALE','SALE','TRARALGON','MERIMBULA','BEGA','EAST GIPPSLAND'];
    var footerLocationIndex = 0;
    var footerLocationEl = document.getElementById('footer-location');
    if (footerLocationEl) {
      footerLocationEl.style.transition = 'opacity 500ms ease-in-out';
      setInterval(function() {
        footerLocationEl.style.opacity = '0';
        setTimeout(function() {
          footerLocationIndex = (footerLocationIndex + 1) % footerLocations.length;
          footerLocationEl.textContent = footerLocations[footerLocationIndex];
          footerLocationEl.style.opacity = '1';
        }, 500);
      }, 3000);
    }
  </script>`;

// ---------------------------------------------------------------------------
// HTML Generators
// ---------------------------------------------------------------------------

function renderHead(title: string, industry: string): string {
  const desc = 'Tech updates translated for regional Australian small businesses. No jargon \u2014 just what matters for tradies, cafes, and local businesses.';
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="Matt - Your Mate Agency">
  <link rel="canonical" href="https://yourmateagency.com.au/news">
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/favicon/site.webmanifest">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="https://yourmateagency.com.au/favicon/yma-og.png">
  <meta property="og:url" content="https://yourmateagency.com.au/news">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://yourmateagency.com.au/favicon/yma-og.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-39CJ3GEM4P"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-39CJ3GEM4P');
  </script>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/news.css">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Tech News in Plain English',
        description: 'Tech updates translated for regional Australian small businesses.',
        url: 'https://yourmateagency.com.au/news',
        publisher: {
          '@type': 'Organization',
          name: 'Your Mate Agency',
          url: 'https://yourmateagency.com.au',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourmateagency.com.au' },
          { '@type': 'ListItem', position: 2, name: 'News', item: 'https://yourmateagency.com.au/news' },
        ],
      },
    ],
  })}</script>
</head>`;
}

function renderHero(): string {
  return `
  <section class="news-hero">
    <h1 class="news-hero-title">Tech News &mdash; In Plain English</h1>
    <p class="news-hero-sub">Tech updates translated for regional Australian businesses. No jargon, no fluff &mdash; just what matters for your business.</p>
  </section>`;
}

function renderFilters(activeIndustry: string): string {
  const pills = INDUSTRIES.map(ind => {
    const isActive = ind.value === activeIndustry;
    const href = ind.value ? `/news?industry=${encodeURIComponent(ind.value)}` : '/news';
    const cls = isActive ? 'filter-pill filter-pill--active' : 'filter-pill';
    return `<a href="${href}" class="${cls}">${esc(ind.label)}</a>`;
  }).join('\n        ');

  return `
  <section class="news-filters">
    <div class="news-filters-inner">
      ${pills}
    </div>
  </section>`;
}

function renderTagPills(tags: string[], featured = false): string {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => {
    const key = tag.toLowerCase().replace(/\s+/g, '_');
    const label = TAG_LABELS[key] || tag;
    if (featured) {
      return `<span class="news-tag news-tag--featured">${esc(label)}</span>`;
    }
    return `<span class="news-tag news-tag--${esc(key)}">${esc(label)}</span>`;
  }).join('');
}

const INDUSTRY_KEY_MAP: Record<string, string> = {
  cafes: 'Hospitality',
  pubs_restaurants: 'Hospitality',
  restaurants: 'Hospitality',
  retail: 'Retail',
  tradies: 'Tradies',
  accommodation: 'Accommodation',
  primary_producers: 'Primary Producers',
  farmers: 'Primary Producers',
  fishing: 'Primary Producers',
  agriculture: 'Primary Producers',
  tourism: 'Tourism',
  hospitality: 'Hospitality',
};

function getArticleTags(a: Article): string[] {
  const tags = a.news_item.relevance_tags;
  if (tags && tags.length > 0) return tags;
  // Fallback: extract from industry_relevance keys
  const ir = a.industry_relevance as Record<string, unknown> | null;
  if (!ir || typeof ir !== 'object') return [];
  const labels = new Set<string>();
  for (const key of Object.keys(ir)) {
    const label = INDUSTRY_KEY_MAP[key.toLowerCase()];
    if (label) labels.add(label);
  }
  return Array.from(labels);
}

function getDisplayTitle(a: Article): string {
  const seoTitle = (a.seo_metadata as Record<string, string>)?.meta_title;
  return seoTitle || a.news_item.title;
}

function getPreview(a: Article, len: number): string {
  const bodyPreview = truncate(a.website_blog, len);
  if (bodyPreview) return bodyPreview;
  const metaDesc = (a.seo_metadata as Record<string, string>)?.meta_description || (a.seo_metadata as Record<string, string>)?.description;
  if (metaDesc) return truncate(metaDesc, len);
  return 'Read more about this tech update \u2192';
}

function renderFeatured(a: Article): string {
  const slug = (a.seo_metadata as Record<string, string>)?.url_slug || slugify(a.news_item.title);
  const preview = getPreview(a, 200);
  const date = formatDate(a.published_at || a.news_item.published_at || a.updated_at);
  const tags = getArticleTags(a);
  const tagsHtml = tags.length > 0 ? `<div class="news-featured-tags">${renderTagPills(tags, true)}</div>` : '';

  return `
  <section class="news-featured">
    <a href="/news/${esc(slug)}" class="news-featured-card">
      ${tagsHtml}
      <h2 class="news-featured-title">${esc(getDisplayTitle(a))}</h2>
      <p class="news-featured-preview">${esc(preview)}</p>
      <div class="news-featured-meta">
        <span>${date}</span>
      </div>
      <span class="news-featured-link">Read more &rarr;</span>
    </a>
  </section>`;
}

function renderCard(a: Article): string {
  const slug = (a.seo_metadata as Record<string, string>)?.url_slug || slugify(a.news_item.title);
  const preview = getPreview(a, 150);
  const date = formatDate(a.published_at || a.news_item.published_at || a.updated_at);
  const tags = getArticleTags(a);
  const tagsHtml = tags.length > 0 ? `<div class="news-card-tags">${renderTagPills(tags)}</div>` : '';

  return `
      <a href="/news/${esc(slug)}" class="news-card">
        ${tagsHtml}
        <h3 class="news-card-title">${esc(getDisplayTitle(a))}</h3>
        <p class="news-card-preview">${esc(preview)}</p>
        <div class="news-card-meta">
          <span>${date}</span>
        </div>
      </a>`;
}

function renderPromo(p: Promo): string {
  const cls = p.style === 'green' ? 'news-promo--green' : 'news-promo--black';
  return `
      <div class="news-promo ${cls}">
        <div class="news-promo-content">
          <h3 class="news-promo-title">${esc(p.title)}</h3>
          <p class="news-promo-desc">${esc(p.description)}</p>
        </div>
        <a href="${esc(p.cta_url)}" class="news-promo-cta">${esc(p.cta_text)}</a>
      </div>`;
}

function renderGrid(articles: Article[], promos: Promo[]): string {
  if (articles.length === 0) return '';

  let html = `
  <section class="news-grid-section">
    <div class="news-grid">`;

  let promoIdx = 0;
  articles.forEach((article, i) => {
    html += renderCard(article);
    if ((i + 1) % 6 === 0 && promoIdx < promos.length) {
      html += renderPromo(promos[promoIdx]);
      promoIdx++;
    }
  });

  html += `
    </div>
  </section>`;
  return html;
}

function renderEmpty(hasFilter: boolean): string {
  if (hasFilter) {
    return `
  <section class="news-empty">
    <h2>No news yet for this topic.</h2>
    <p>Check back soon &mdash; or <a href="/news">browse all tech news</a>.</p>
  </section>`;
  }
  return `
  <section class="news-empty">
    <h2>News is on its way.</h2>
    <p>Tech updates translated for your business will appear here soon.</p>
  </section>`;
}

// ---------------------------------------------------------------------------
// Full page assembly
// ---------------------------------------------------------------------------

function generatePage(articles: Article[], promos: Promo[], industry: string): string {
  const industryLabel = INDUSTRIES.find(i => i.value === industry)?.label || '';
  const pageTitle = industry
    ? `Tech News in Plain English | ${industryLabel} \u2014 Your Mate Agency`
    : 'Tech News in Plain English \u2014 Your Mate Agency';

  const featured = articles.length > 0 ? articles[0] : null;
  const gridArticles = articles.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
${renderHead(pageTitle, industry)}
<body>
  ${NAV_HTML}
  ${renderHero()}
  ${renderFilters(industry)}
  ${featured ? renderFeatured(featured) : ''}
  ${gridArticles.length > 0 ? renderGrid(gridArticles, promos) : ''}
  ${articles.length === 0 ? renderEmpty(!!industry) : ''}
  ${FOOTER_HTML}
  ${PAGE_SCRIPTS}
</body>
</html>`;
}

function generateErrorPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>News \u2014 Your Mate Agency</title>
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/news.css">
</head>
<body>
  ${NAV_HTML}
  ${renderHero()}
  <section class="news-empty">
    <h2>Something went wrong.</h2>
    <p>We're having trouble loading the news right now. Try refreshing, or <a href="/contact">get in touch</a> if it keeps happening.</p>
  </section>
  ${FOOTER_HTML}
  ${PAGE_SCRIPTS}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const rawIndustry = (req.query.industry as string) || '';
  const industry = VALID_INDUSTRIES.includes(rawIndustry) ? rawIndustry : '';

  try {
    // Build article query
    let query = supabase
      .from('tech_translations')
      .select(`
        id,
        website_blog,
        seo_metadata,
        industry_relevance,
        published_at,
        updated_at,
        news_item:tech_news_items!inner (
          title,
          url,
          relevance_tags,
          published_at,
          source:tech_news_sources!inner (
            name
          )
        )
      `)
      .eq('status', 'published')
      .not('website_blog', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (industry) {
      query = query.filter('tech_news_items.relevance_tags', 'cs', `{${industry}}`);
    }

    // Fetch articles and promos in parallel
    const [articlesResult, promosResult] = await Promise.all([
      query,
      supabase
        .from('news_sidebar_promos')
        .select('*')
        .eq('is_active', true)
        .is('industry_target', null)
        .order('position'),
    ]);

    if (articlesResult.error) {
      console.error('Error fetching articles:', articlesResult.error);
    }
    if (promosResult.error) {
      console.error('Error fetching promos:', promosResult.error);
    }

    const articles = (articlesResult.data || []) as unknown as Article[];
    const promos = (promosResult.data || []) as unknown as Promo[];

    const html = generatePage(articles, promos, industry);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('News page error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(generateErrorPage());
  }
}
