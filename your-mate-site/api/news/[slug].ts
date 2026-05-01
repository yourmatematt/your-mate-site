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
  industry_target: string | null;
  position: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TAG_LABELS: Record<string, string> = {
  tradies: 'Tradies',
  hospitality: 'Hospitality',
  accommodation: 'Accommodation',
  primary_producers: 'Primary Producers',
  retail: 'Retail',
  tourism: 'Tourism',
  cafes: 'Cafes',
  pubs_restaurants: 'Pubs & Restaurants',
  restaurants: 'Restaurants',
  farmers: 'Farmers',
  fishing: 'Fishing',
  agriculture: 'Agriculture',
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

function truncate(text: string, len: number): string {
  const clean = stripHtml(text);
  if (clean.length <= len) return clean;
  return clean.substring(0, len).replace(/\s+\S*$/, '') + '\u2026';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  // Pin to Australia/Melbourne so timestamps near UTC midnight (e.g. an AEST
  // morning publish stored as the previous day in UTC) render as the local
  // calendar day. Handles AEST/AEDT switchover automatically.
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  });
}

function getSlug(article: Article): string {
  return ((article.seo_metadata as Record<string, unknown>)?.url_slug as string) || '';
}

// ---------------------------------------------------------------------------
// Lightweight Markdown Converter
// ---------------------------------------------------------------------------

function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let inUl = false;
  let inOl = false;
  let paragraph: string[] = [];

  function flushParagraph() {
    if (paragraph.length > 0) {
      output.push(`<p>${paragraph.join(' ')}</p>`);
      paragraph = [];
    }
  }

  function closeLists() {
    if (inUl) { output.push('</ul>'); inUl = false; }
    if (inOl) { output.push('</ol>'); inOl = false; }
  }

  function inlineFormat(text: string): string {
    // Links first (before bold, so ** inside link text doesn't break brackets)
    text = text.replace(/\[([^\]]+)\]\s*\(([^)]+)\)/g, (_match, linkText: string, url: string) => {
      const isExternal = /^https?:\/\//.test(url) && !url.includes('yourmateagency.com.au');
      if (isExternal) {
        return `<a href="${esc(url.trim())}" target="_blank" rel="noopener noreferrer">${esc(linkText)}</a>`;
      }
      return `<a href="${esc(url.trim())}">${esc(linkText)}</a>`;
    });
    // Bold: **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return text;
  }

  // Look ahead to check if a list continues after empty lines
  function listContinuesAt(startIdx: number, type: 'ol' | 'ul'): boolean {
    for (let i = startIdx; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed === '') continue; // skip blank lines
      if (type === 'ol' && /^\d+\.\s/.test(trimmed)) return true;
      if (type === 'ul' && /^[-*]\s/.test(trimmed)) return true;
      return false; // non-empty, non-list line — list is over
    }
    return false;
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trimEnd();

    // Empty line — flush paragraph, but only close lists if list doesn't continue
    if (line.trim() === '') {
      flushParagraph();
      if (inOl && !listContinuesAt(idx + 1, 'ol')) closeLists();
      else if (inUl && !listContinuesAt(idx + 1, 'ul')) closeLists();
      else if (!inOl && !inUl) closeLists();
      continue;
    }

    // Headings — most specific first so #### isn't caught by ###, etc.
    if (line.startsWith('#### ')) {
      flushParagraph();
      closeLists();
      output.push(`<h4>${inlineFormat(line.substring(5).trim())}</h4>`);
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      closeLists();
      output.push(`<h3>${inlineFormat(line.substring(4).trim())}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      closeLists();
      output.push(`<h2>${inlineFormat(line.substring(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      closeLists();
      output.push(`<h2>${inlineFormat(line.substring(2).trim())}</h2>`);
      continue;
    }

    // Unordered list item
    if (/^[-*]\s/.test(line.trim())) {
      flushParagraph();
      if (inOl) { output.push('</ol>'); inOl = false; }
      if (!inUl) { output.push('<ul>'); inUl = true; }
      output.push(`<li>${inlineFormat(line.trim().substring(2).trim())}</li>`);
      continue;
    }

    // Ordered list item
    if (/^\d+\.\s/.test(line.trim())) {
      flushParagraph();
      if (inUl) { output.push('</ul>'); inUl = false; }
      if (!inOl) { output.push('<ol>'); inOl = true; }
      output.push(`<li>${inlineFormat(line.trim().replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    // Regular text — accumulate into paragraph
    paragraph.push(inlineFormat(line.trim()));
  }

  flushParagraph();
  closeLists();

  return output.join('\n');
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
// SVG Icons for Share Buttons
// ---------------------------------------------------------------------------

const SHARE_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
};

// ---------------------------------------------------------------------------
// HTML Generators
// ---------------------------------------------------------------------------

function getDisplayTitle(article: Article): string {
  const seoTitle = (article.seo_metadata as Record<string, string>)?.meta_title;
  return seoTitle || article.news_item.title;
}

function renderHead(article: Article, slug: string): string {
  const title = getDisplayTitle(article);
  const seo = article.seo_metadata || {};
  const metaTitle = (seo.title as string) || `${title} \u2014 Your Mate Agency`;
  const metaDesc = (seo.description as string) || truncate(article.website_blog, 155);
  const canonical = `https://yourmateagency.com.au/news/${encodeURIComponent(slug)}`;
  const date = article.published_at || article.news_item.published_at || article.updated_at;

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(metaTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="author" content="Matt - Your Mate Agency">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/favicon/site.webmanifest">
  <meta property="og:title" content="${esc(metaTitle)}">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:image" content="https://yourmateagency.com.au/favicon/yma-og.png">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:type" content="article">
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
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourmateagency.com.au/' },
      { '@type': 'ListItem', position: 2, name: 'News', item: 'https://yourmateagency.com.au/news' },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: metaDesc,
    datePublished: date,
    dateModified: article.updated_at,
    author: { '@type': 'Person', name: 'Matt Rowlands', url: 'https://yourmateagency.com.au/about' },
    publisher: { '@type': 'Organization', name: 'Your Mate Agency', url: 'https://yourmateagency.com.au' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
  })}</script>
</head>`;
}

function renderTagPills(tags: string[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => {
    const key = tag.toLowerCase().replace(/\s+/g, '_');
    const label = TAG_LABELS[key] || tag;
    return `<span class="news-tag news-tag--${esc(key)}">${esc(label)}</span>`;
  }).join('');
}

// ---------------------------------------------------------------------------
// Promo allocation — deduplicated across hero, inline, sidebar
// ---------------------------------------------------------------------------

interface PromoAllocation {
  heroPromo: Promo | null;
  inlinePromos: Promo[];
}

function allocatePromos(promos: Promo[], articleTags: string[]): PromoAllocation {
  if (promos.length === 0) return { heroPromo: null, inlinePromos: [] };

  const tags = (articleTags || []).map(t => t.toLowerCase().replace(/\s+/g, '_'));
  const targeted = promos.filter(p => p.industry_target && tags.includes(p.industry_target));
  const general = promos.filter(p => !p.industry_target);
  const ranked = [...targeted, ...general];

  const usedIds = new Set<string>();

  // Hero gets first available
  const heroPromo = ranked[0] || null;
  if (heroPromo) usedIds.add(heroPromo.id);

  // Inline gets next 2
  const inlinePromos: Promo[] = [];
  for (const p of ranked) {
    if (inlinePromos.length >= 2) break;
    if (!usedIds.has(p.id)) {
      inlinePromos.push(p);
      usedIds.add(p.id);
    }
  }

  return { heroPromo, inlinePromos };
}

// ---------------------------------------------------------------------------
// HTML Generators
// ---------------------------------------------------------------------------

function renderHeroPromo(promo: Promo): string {
  return `
      <div class="news-hero-promo" style="flex-shrink:0;width:320px;background:#fff;border-radius:12px;padding:1.5rem 2rem;box-shadow:0 4px 24px rgba(0,0,0,.15)">
        <span class="news-hero-promo-label" style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#a3a3a3;margin-bottom:.75rem">From Your Mate</span>
        <h3 class="news-hero-promo-title" style="font-size:18px;font-weight:700;color:#000;line-height:1.3;margin:0 0 .5rem">${esc(promo.title)}</h3>
        <p class="news-hero-promo-desc" style="font-size:14px;color:#666;line-height:1.5;margin:0 0 1rem">${esc(promo.description)}</p>
        <a href="${esc(promo.cta_url)}" class="news-hero-promo-btn" style="display:inline-block;padding:.625rem 1.25rem;background:#2D9F5E;color:#fff;font-size:14px;font-weight:500;border-radius:6px;text-decoration:none">${esc(promo.cta_text)}</a>
      </div>`;
}

function renderDetailHero(article: Article, heroPromo: Promo | null): string {
  const date = formatDate(article.published_at || article.news_item.published_at || article.updated_at);
  const hasPromo = heroPromo !== null;
  const layoutClass = hasPromo ? 'news-detail-hero news-detail-hero--with-promo' : 'news-detail-hero';
  const layoutStyle = hasPromo ? ' style="display:flex;align-items:center;gap:2rem"' : '';

  return `
  <section class="${layoutClass}"${layoutStyle}>
    <div class="news-detail-hero-content" style="flex:1;min-width:0">
      <div class="news-detail-hero-meta">
        <span class="news-detail-hero-date">${date}</span>
        <span class="news-detail-hero-sep">&middot;</span>
        <span class="news-detail-hero-byline">By <a href="/about" class="news-detail-hero-author">Matt Rowlands, Your Mate</a></span>
      </div>
      <h1 class="news-detail-hero-title">${esc(getDisplayTitle(article))}</h1>
      <div class="news-detail-hero-tags">${renderTagPills(article.news_item.relevance_tags)}</div>
    </div>
    ${hasPromo ? renderHeroPromo(heroPromo!) : ''}
  </section>`;
}

function industryLabel(key: string): string {
  const normalized = key.toLowerCase().replace(/\s+/g, '_');
  if (TAG_LABELS[normalized]) return TAG_LABELS[normalized];
  // Capitalize unknown keys: "cafes" → "Cafes", "pubs_restaurants" → "Pubs Restaurants"
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderCallout(article: Article): string {
  const ir = article.industry_relevance as Record<string, string> | null;
  if (!ir || typeof ir !== 'object') return '';

  const entries = Object.entries(ir).filter(([, v]) => v && typeof v === 'string' && v.trim());
  if (entries.length === 0) return '';

  const items = entries.map(([key, explanation]) =>
    `<div class="news-callout-item">
            <p class="news-callout-industry">${esc(industryLabel(key))}</p>
            <p class="news-callout-text">${esc(explanation)}</p>
          </div>`
  ).join('\n');

  return `
        <div class="news-callout">
          <p class="news-callout-title">Who this matters to</p>
          ${items}
        </div>`;
}

function renderShareButtons(slug: string, title: string): string {
  const url = encodeURIComponent(`https://yourmateagency.com.au/news/${slug}`);
  const encodedTitle = encodeURIComponent(title);

  return `
      <div class="news-share">
        <p class="news-share-label">Share</p>
        <div class="news-share-buttons">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" class="news-share-btn" aria-label="Share on Facebook">${SHARE_ICONS.facebook}</a>
          <a href="https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer" class="news-share-btn" aria-label="Share on Twitter">${SHARE_ICONS.twitter}</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener noreferrer" class="news-share-btn" aria-label="Share on LinkedIn">${SHARE_ICONS.linkedin}</a>
          <a href="mailto:?subject=${encodedTitle}&body=${url}" class="news-share-btn" aria-label="Share via email">${SHARE_ICONS.email}</a>
        </div>
      </div>`;
}

function renderRelated(articles: Article[], currentId: string): string {
  const related = articles
    .filter(a => a.id !== currentId)
    .slice(0, 4);

  if (related.length === 0) return '';

  const items = related.map(a => {
    const slug = getSlug(a);
    if (!slug) return '';
    const date = formatDate(a.published_at || a.news_item.published_at || a.updated_at);
    return `<a href="/news/${esc(slug)}" class="news-related-item">
            ${esc(a.news_item.title)}
            <span class="news-related-date">${date}</span>
          </a>`;
  }).filter(Boolean).join('\n');

  if (!items) return '';

  return `
      <div class="news-related">
        <p class="news-related-title">Related News</p>
        ${items}
      </div>`;
}

function renderInlinePromo(promo: Promo): string {
  return `
<div class="news-inline-promo">
  <h3 class="news-inline-promo-title">${esc(promo.title)}</h3>
  <p class="news-inline-promo-desc">${esc(promo.description)}</p>
  <a href="${esc(promo.cta_url)}" class="news-inline-promo-btn">${esc(promo.cta_text)}</a>
</div>`;
}

function injectInlinePromos(bodyHtml: string, promos: Promo[]): string {
  if (promos.length === 0) return bodyHtml;

  // Split on closing </p> tags to count paragraphs
  const parts = bodyHtml.split('</p>');
  // Last element is whatever comes after the final </p> (may be empty)
  if (parts.length <= 1) return bodyHtml;

  // Each part (except last) had a </p> stripped — we'll re-add it
  // Insert promos after paragraph 5 and paragraph 10 (0-indexed: after index 4 and 9)
  const insertAfter = [4, 9];
  let promoIdx = 0;
  const result: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    if (i < parts.length - 1) {
      result.push(parts[i] + '</p>');
      if (insertAfter.includes(i) && promoIdx < promos.length) {
        result.push(renderInlinePromo(promos[promoIdx]));
        promoIdx++;
      }
    } else {
      // Last segment (after final </p>) — append as-is
      result.push(parts[i]);
    }
  }

  return result.join('\n');
}

function renderCta(): string {
  return `
        <div class="news-cta">
          <h2 class="news-cta-title">Need help making sense of this?</h2>
          <p class="news-cta-text">I help regional businesses figure out what tech changes actually matter. No jargon, just plain English advice.</p>
          <a href="/contact" class="news-cta-btn">Have a chat with Matt</a>
        </div>`;
}

// ---------------------------------------------------------------------------
// Full page assembly
// ---------------------------------------------------------------------------

function generateArticlePage(
  article: Article,
  slug: string,
  relatedArticles: Article[],
  promos: Promo[]
): string {
  const { heroPromo, inlinePromos } = allocatePromos(promos, article.news_item.relevance_tags);
  // Strip leading # heading — the title is already shown in the hero
  const body = article.website_blog.replace(/^\s*#\s+[^\n]+\n*/, '');
  const rawBodyHtml = markdownToHtml(body);
  const bodyHtml = injectInlinePromos(rawBodyHtml, inlinePromos);

  return `<!DOCTYPE html>
<html lang="en">
${renderHead(article, slug)}
<body>
  ${NAV_HTML}
  ${renderDetailHero(article, heroPromo)}

  <div class="news-article-layout">
    <main class="news-article-body">
      ${bodyHtml}
      ${renderCallout(article)}
      ${renderCta()}
    </main>

    <aside class="news-sidebar">
      ${renderShareButtons(slug, article.news_item.title)}
      ${renderRelated(relatedArticles, article.id)}
    </aside>
  </div>

  <div class="news-back">
    <a href="/news">&larr; Back to all news</a>
  </div>

  ${FOOTER_HTML}
  ${PAGE_SCRIPTS}
</body>
</html>`;
}

function generate404Page(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Article Not Found \u2014 Your Mate Agency</title>
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/news.css">
</head>
<body>
  ${NAV_HTML}
  <section class="news-404">
    <h2>Article not found</h2>
    <p>This article doesn't exist or may have been removed. Check out the latest news instead.</p>
    <a href="/news">Browse all news</a>
  </section>
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
  <section class="news-empty">
    <h2>Something went wrong.</h2>
    <p>We're having trouble loading this article right now. Try refreshing, or <a href="/contact">get in touch</a> if it keeps happening.</p>
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

  const requestSlug = req.query.slug as string;
  if (!requestSlug) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(generate404Page());
  }

  try {
    // Query 1: Fetch the article directly by seo_metadata url_slug
    // Query 2: Fetch recent articles for "Related" sidebar
    // Query 3: Fetch active promo blocks
    const [articleResult, relatedResult, promosResult] = await Promise.all([
      supabase
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
        .filter('seo_metadata->>url_slug', 'eq', requestSlug)
        .limit(1)
        .maybeSingle(),

      supabase
        .from('tech_translations')
        .select(`
          id,
          seo_metadata,
          published_at,
          updated_at,
          news_item:tech_news_items!inner (
            title,
            published_at,
            source:tech_news_sources!inner (
              name
            )
          )
        `)
        .eq('status', 'published')
        .not('website_blog', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(5),

      supabase
        .from('news_sidebar_promos')
        .select('*')
        .eq('is_active', true)
        .order('position'),
    ]);

    if (articleResult.error) {
      console.error('Error fetching article:', articleResult.error);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(500).send(generateErrorPage());
    }

    if (!articleResult.data) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(generate404Page());
    }

    const article = articleResult.data as unknown as Article;
    const relatedArticles = (relatedResult.data || []) as unknown as Article[];
    const promos = (promosResult.data || []) as unknown as Promo[];

    if (relatedResult.error) {
      console.error('Error fetching related articles:', relatedResult.error);
    }
    if (promosResult.error) {
      console.error('Error fetching promos:', promosResult.error);
    }

    const html = generateArticlePage(article, requestSlug, relatedArticles, promos);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('News article page error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(generateErrorPage());
  }
}
