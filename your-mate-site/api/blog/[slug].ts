import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BlogPost {
  id: string;
  website_blog: string;
  seo_metadata: Record<string, unknown> | null;
  industry_relevance: Record<string, unknown> | null;
  industry: string | null;
  published_at: string;
  created_at: string;
  reading_time_minutes: number | null;
  word_count: number | null;
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
  seo: 'SEO',
  web_design: 'Web Design',
  small_business: 'Small Business',
  digital_marketing: 'Digital Marketing',
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
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Australia/Melbourne',
  });
}

function getSlug(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, unknown>)?.url_slug as string) || '';
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

function getTitle(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, string>)?.meta_title) || 'Blog Post';
}

function getDescription(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, string>)?.meta_description) || truncate(post.website_blog, 155);
}

function getKeywords(post: BlogPost): string {
  const seo = post.seo_metadata || {};
  const primary = (seo.primary_keyword as string) || '';
  const secondary = (seo.secondary_keywords as string[]) || [];
  return [primary, ...secondary].filter(Boolean).join(', ');
}

function getIndustryTags(post: BlogPost): string[] {
  const ir = post.industry_relevance;
  if (!ir) return [];
  // Handle array format: ["seo", "tradies"]
  if (Array.isArray(ir)) {
    return ir.filter(v => typeof v === 'string');
  }
  // Handle object format: { "seo": "...", "tradies": "..." }
  if (typeof ir === 'object') {
    return Object.keys(ir);
  }
  return [];
}

function renderTagPills(tags: string[]): string {
  if (!tags || tags.length === 0) return '';
  return tags.map(tag => {
    const key = tag.toLowerCase().replace(/\s+/g, '_');
    const label = TAG_LABELS[key] || tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return `<span class="blog-tag blog-tag--${esc(key)}">${esc(label)}</span>`;
  }).join('');
}

function renderHead(post: BlogPost, slug: string): string {
  const title = getTitle(post);
  const metaTitle = `${title} \u2014 Your Mate Agency`;
  const metaDesc = getDescription(post);
  const keywords = getKeywords(post);
  const canonical = `https://yourmateagency.com.au/blog/${encodeURIComponent(slug)}`;
  const date = post.published_at || post.created_at;

  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(metaTitle)}</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta name="author" content="Matt - Your Mate Agency">
  ${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}
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
  <link rel="stylesheet" href="/blog.css">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourmateagency.com.au/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://yourmateagency.com.au/blog' },
      { '@type': 'ListItem', position: 3, name: title },
    ],
  })}</script>
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: metaDesc,
    datePublished: date,
    dateModified: date,
    author: { '@type': 'Person', name: 'Matt Rowlands', url: 'https://yourmateagency.com.au/about' },
    publisher: { '@type': 'Organization', name: 'Your Mate Agency', url: 'https://yourmateagency.com.au' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    wordCount: post.word_count || undefined,
  })}</script>
</head>`;
}

function renderHero(post: BlogPost): string {
  const date = formatDate(post.published_at || post.created_at);
  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';
  const tags = getIndustryTags(post);

  return `
  <section class="blog-detail-hero">
    <div class="blog-detail-hero-content">
      <div class="blog-detail-hero-meta">
        <span class="blog-detail-hero-date">${date}</span>
        ${readTime ? `<span class="blog-detail-hero-sep">&middot;</span><span class="blog-detail-hero-readtime">${readTime}</span>` : ''}
        <span class="blog-detail-hero-sep">&middot;</span>
        <span class="blog-detail-hero-byline">By <a href="/about" class="blog-detail-hero-author">Matt Rowlands, Your Mate</a></span>
      </div>
      <h1 class="blog-detail-hero-title">${esc(getTitle(post))}</h1>
      ${tags.length > 0 ? `<div class="blog-detail-hero-tags">${renderTagPills(tags)}</div>` : ''}
    </div>
  </section>`;
}

function renderShareButtons(slug: string, title: string): string {
  const url = encodeURIComponent(`https://yourmateagency.com.au/blog/${slug}`);
  const encodedTitle = encodeURIComponent(title);

  return `
      <div class="blog-share">
        <p class="blog-share-label">Share</p>
        <div class="blog-share-buttons">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${url}" target="_blank" rel="noopener noreferrer" class="blog-share-btn" aria-label="Share on Facebook">${SHARE_ICONS.facebook}</a>
          <a href="https://twitter.com/intent/tweet?url=${url}&text=${encodedTitle}" target="_blank" rel="noopener noreferrer" class="blog-share-btn" aria-label="Share on Twitter">${SHARE_ICONS.twitter}</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${url}" target="_blank" rel="noopener noreferrer" class="blog-share-btn" aria-label="Share on LinkedIn">${SHARE_ICONS.linkedin}</a>
          <a href="mailto:?subject=${encodedTitle}&body=${url}" class="blog-share-btn" aria-label="Share via email">${SHARE_ICONS.email}</a>
        </div>
      </div>`;
}

function renderRelated(posts: BlogPost[], currentId: string): string {
  const related = posts
    .filter(p => p.id !== currentId)
    .slice(0, 3);

  if (related.length === 0) return '';

  const items = related.map(p => {
    const slug = getSlug(p);
    if (!slug) return '';
    const title = getTitle(p);
    const tags = getIndustryTags(p);
    const readTime = p.reading_time_minutes ? `${p.reading_time_minutes} min read` : '';
    return `<a href="/blog/${esc(slug)}" class="blog-related-item">
            ${esc(title)}
            <span class="blog-related-meta">${tags.length > 0 ? esc(tags[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) : ''}${tags.length > 0 && readTime ? ' &middot; ' : ''}${readTime}</span>
          </a>`;
  }).filter(Boolean).join('\n');

  if (!items) return '';

  return `
      <div class="blog-related">
        <p class="blog-related-title">Related Articles</p>
        ${items}
      </div>`;
}

// Industries that map to a GBP checklist PDF (keys must match
// CHECKLIST_BY_INDUSTRY in api/checklist-request.ts).
const CHECKLIST_INDUSTRIES = [
  'accommodation',
  'restaurant',
  'retail',
  'seafood',
  'professional',
  'market',
] as const;
type ChecklistIndustry = typeof CHECKLIST_INDUSTRIES[number];

const INDUSTRY_HEADING_LABEL: Record<ChecklistIndustry, string> = {
  accommodation: 'accommodation',
  restaurant: 'cafe & restaurant',
  retail: 'retail shop',
  seafood: 'fishing & seafood',
  professional: 'professional services',
  market: 'market vendor',
};

const INDUSTRY_OPTION_LABEL: Record<ChecklistIndustry, string> = {
  accommodation: 'Accommodation / motel / B&B',
  restaurant: 'Cafe or restaurant',
  retail: 'Retail shop',
  seafood: 'Fishing charter or seafood',
  professional: 'Professional or trade services',
  market: 'Market stall or vendor',
};

const CHECKLIST_CTA_STYLES = `
<style>
  .gbp-cl-section { background: #f5f5f5; padding: 3rem 1.5rem; margin: 40px 0 0; border-radius: 12px; }
  .gbp-cl-card { max-width: 880px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 30px rgba(0,0,0,0.06); }
  @media (max-width: 768px) { .gbp-cl-card { padding: 1.75rem 1.25rem; border-radius: 8px; } .gbp-cl-section { padding: 2rem 0.5rem; } }
  .gbp-cl-text { margin-bottom: 1.75rem; }
  .gbp-cl-eyebrow { display: inline-block; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #2D9F5E; margin-bottom: 1rem; }
  .gbp-cl-heading { font-family: 'Inter', sans-serif; font-size: clamp(24px, 3.5vw, 34px); font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; color: #000000; margin: 0 0 0.85rem 0; }
  .gbp-cl-sub { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6; color: #333333; margin: 0; }
  .gbp-cl-form { display: flex; flex-direction: column; gap: 1rem; }
  .gbp-cl-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 600px) { .gbp-cl-row { grid-template-columns: 1fr; } }
  .gbp-cl-field { display: flex; flex-direction: column; gap: 0.4rem; }
  .gbp-cl-field > span { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: #000000; letter-spacing: 0.02em; }
  .gbp-cl-field input, .gbp-cl-field select { font-family: 'Inter', sans-serif; font-size: 16px; padding: 0.75rem 0.9rem; border: 1.5px solid #d4d4d4; border-radius: 6px; background: #ffffff; color: #000000; transition: border-color 0.15s ease; }
  .gbp-cl-field input:focus, .gbp-cl-field select:focus { outline: none; border-color: #2D9F5E; }
  .gbp-cl-hp { position: absolute; left: -9999px; opacity: 0; pointer-events: none; height: 0; width: 0; overflow: hidden; }
  .gbp-cl-submit { background: #000000; color: #ffffff; font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; padding: 0.9rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; transition: background 0.2s ease; margin-top: 0.5rem; }
  .gbp-cl-submit:hover { background: #333333; }
  .gbp-cl-submit:disabled { background: #737373; cursor: not-allowed; }
  .gbp-cl-error { background: #fef2f2; color: #991b1b; border-left: 3px solid #dc2626; padding: 0.75rem 1rem; font-family: 'Inter', sans-serif; font-size: 14px; border-radius: 4px; }
  .gbp-cl-error a { color: #991b1b; text-decoration: underline; }
  .gbp-cl-fineprint { font-family: 'Inter', sans-serif; font-size: 13px; color: #737373; line-height: 1.5; margin: 0.25rem 0 0 0; }
  .gbp-cl-success h3 { font-family: 'Inter', sans-serif; font-size: 22px; font-weight: 700; color: #000000; margin: 0 0 0.75rem 0; letter-spacing: -0.01em; }
  .gbp-cl-success p { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.6; color: #333333; margin: 0; }
</style>`;

function renderChecklistIndustryControl(industryKey: ChecklistIndustry | null): string {
  if (industryKey) {
    return `<input type="hidden" id="gbp-cl-industry" name="industry" value="${industryKey}">`;
  }
  const options = CHECKLIST_INDUSTRIES.map(
    (key) => `<option value="${key}">${esc(INDUSTRY_OPTION_LABEL[key])}</option>`
  ).join('');
  return `
          <label class="gbp-cl-field">
            <span>Your industry</span>
            <select id="gbp-cl-industry" name="industry" required>
              <option value="" disabled selected>Pick your industry\u2026</option>
              ${options}
              <option value="something_else">Something else</option>
            </select>
          </label>`;
}

function renderChecklistCta(industryRaw: string | null): string {
  const industryKey: ChecklistIndustry | null =
    industryRaw && (CHECKLIST_INDUSTRIES as readonly string[]).includes(industryRaw)
      ? (industryRaw as ChecklistIndustry)
      : null;

  const headingHtml = industryKey
    ? `Get the ${esc(INDUSTRY_HEADING_LABEL[industryKey])} GBP checklist`
    : 'Get the free GBP checklist for your industry';

  const subHtml = industryKey
    ? 'A free PDF with the exact fixes I\u2019d make to your Google Business Profile \u2014 so you get found by people searching locally. Plain English, takes about an hour to work through.'
    : 'A free PDF with the exact fixes I\u2019d make to your Google Business Profile \u2014 written for your industry. Pick yours below.';

  const defaultBtn = 'Email me the checklist \u2192';
  const calendarUrl = 'https://calendar.app.google/9nYnoQdALsTNo6wp6';

  return `
        ${CHECKLIST_CTA_STYLES}
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

        <section class="gbp-cl-section" id="get-the-checklist">
          <div class="gbp-cl-card">
            <div class="gbp-cl-text">
              <span class="gbp-cl-eyebrow">FREE PDF \u00b7 4 PAGES \u00b7 NO SPAM</span>
              <h2 class="gbp-cl-heading">${headingHtml}</h2>
              <p class="gbp-cl-sub">${subHtml}</p>
            </div>
            <form id="gbp-cl-form" class="gbp-cl-form" novalidate>
              <div class="gbp-cl-row">
                <label class="gbp-cl-field">
                  <span>First name</span>
                  <input type="text" id="gbp-cl-first-name" name="first_name" autocomplete="given-name" required>
                </label>
                <label class="gbp-cl-field">
                  <span>Business name</span>
                  <input type="text" id="gbp-cl-business-name" name="business_name" autocomplete="organization" required>
                </label>
              </div>
              <div class="gbp-cl-row">
                <label class="gbp-cl-field">
                  <span>Town or postcode</span>
                  <input type="text" id="gbp-cl-town" name="town_postcode" autocomplete="postal-code" required>
                </label>
                <label class="gbp-cl-field">
                  <span>Email</span>
                  <input type="email" id="gbp-cl-email" name="email" autocomplete="email" required>
                </label>
              </div>

              ${renderChecklistIndustryControl(industryKey)}

              <div class="gbp-cl-hp" aria-hidden="true">
                <label for="gbp-cl-website">Leave this empty</label>
                <input type="text" id="gbp-cl-website" name="website" tabindex="-1" autocomplete="off">
              </div>

              <div class="cf-turnstile" data-sitekey="0x4AAAAAADCt8xFxs6ZqjfTF" data-theme="light"></div>

              <button type="submit" class="gbp-cl-submit" id="gbp-cl-submit">${defaultBtn}</button>
              <div id="gbp-cl-error" class="gbp-cl-error" style="display:none;"></div>
              <p class="gbp-cl-fineprint">I\u2019ll send the PDF straight to your inbox. No newsletter, no follow-up sequence \u2014 just the checklist. Reply if you\u2019ve got questions.</p>
            </form>
            <div id="gbp-cl-success" class="gbp-cl-success" style="display:none;">
              <h3>Onya \u2014 check your inbox.</h3>
              <p>It\u2019ll land in the next minute or two from <strong>matt@yourmateagency.com.au</strong>. If it\u2019s not there, check your spam folder, then reply to any other email and I\u2019ll resend it.</p>
            </div>
          </div>
        </section>

        <script>
          (function () {
            var form = document.getElementById('gbp-cl-form');
            if (!form) return;
            var submitBtn = document.getElementById('gbp-cl-submit');
            var errorEl = document.getElementById('gbp-cl-error');
            var successEl = document.getElementById('gbp-cl-success');
            var industryEl = document.getElementById('gbp-cl-industry');
            var pageLoadTime = Date.now();
            var defaultBtnText = ${JSON.stringify(defaultBtn)};
            var bookBtnText = 'Book a quick call \u2192';
            var calendarUrl = ${JSON.stringify(calendarUrl)};

            function isSomethingElse() {
              return industryEl && industryEl.tagName === 'SELECT' && industryEl.value === 'something_else';
            }

            function syncSubmitLabel() {
              if (!submitBtn) return;
              submitBtn.textContent = isSomethingElse() ? bookBtnText : defaultBtnText;
            }

            if (industryEl && industryEl.tagName === 'SELECT') {
              industryEl.addEventListener('change', syncSubmitLabel);
              syncSubmitLabel();
            }

            form.addEventListener('submit', async function (e) {
              e.preventDefault();
              errorEl.style.display = 'none';

              if (isSomethingElse()) {
                window.location.href = calendarUrl;
                return;
              }

              submitBtn.disabled = true;
              submitBtn.textContent = 'Sending\u2026';

              var turnstileToken = '';
              var tsField = form.querySelector('input[name="cf-turnstile-response"]');
              if (tsField) turnstileToken = tsField.value;

              var industryValue = industryEl ? industryEl.value : '';

              var payload = {
                first_name: document.getElementById('gbp-cl-first-name').value.trim(),
                business_name: document.getElementById('gbp-cl-business-name').value.trim(),
                town_postcode: document.getElementById('gbp-cl-town').value.trim(),
                email: document.getElementById('gbp-cl-email').value.trim(),
                industry: industryValue,
                website: document.getElementById('gbp-cl-website').value,
                pageLoadTime: pageLoadTime,
                turnstileToken: turnstileToken,
              };

              if (!payload.first_name || !payload.business_name || !payload.town_postcode || !payload.email || !payload.industry) {
                errorEl.textContent = 'Please fill in all fields.';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                syncSubmitLabel();
                return;
              }

              if (!payload.turnstileToken) {
                errorEl.textContent = 'Please complete the security check.';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                syncSubmitLabel();
                return;
              }

              try {
                var resp = await fetch('/api/checklist-request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (!resp.ok) throw new Error('Request failed: ' + resp.status);
                form.style.display = 'none';
                successEl.style.display = 'block';
              } catch (err) {
                errorEl.innerHTML = 'Something went wrong \u2014 try emailing me directly at <a href="mailto:matt@yourmateagency.com.au">matt@yourmateagency.com.au</a> and I\\'ll send the checklist through manually.';
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                syncSubmitLabel();
                if (window.turnstile) {
                  try { window.turnstile.reset(); } catch (e) {}
                }
              }
            });
          })();
        </script>`;
}

function renderCta(industryRaw: string | null): string {
  return `
        ${renderChecklistCta(industryRaw)}

        <div style="background:#1a1a1a;border-left:4px solid #2D9F5E;padding:24px 28px;border-radius:8px;margin:32px 0 0">
          <p style="font-size:20px;font-weight:700;color:#ffffff;margin:0 0 8px">Want your free Digital Footprint Report?</p>
          <p style="font-size:16px;color:#d1d5db;margin:0 0 16px;line-height:1.6">I'll run the same audit on your business \u2014 takes 5 minutes, no strings attached. You'll get your score, a breakdown of what's working, and quick wins you can action straight away.</p>
          <a href="/contact" style="display:inline-block;background:#2D9F5E;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">Get your free report \u2192</a>
        </div>
        <div class="blog-cta" style="margin-top:24px">
          <h2 class="blog-cta-title">Need help with this?</h2>
          <p class="blog-cta-text">I help regional businesses with websites, SEO, and digital marketing. No jargon, just plain English advice.</p>
          <a href="/contact" class="blog-cta-btn">Have a chat with Matt</a>
        </div>`;
}

// ---------------------------------------------------------------------------
// Full page assembly
// ---------------------------------------------------------------------------

function generateArticlePage(
  post: BlogPost,
  slug: string,
  relatedPosts: BlogPost[]
): string {
  return `<!DOCTYPE html>
<html lang="en">
${renderHead(post, slug)}
<body>
  ${NAV_HTML}
  ${renderHero(post)}

  <div class="blog-article-layout">
    <main class="blog-article-body">
      ${post.website_blog}
      ${renderCta(post.industry)}
    </main>

    <aside class="blog-sidebar">
      ${renderShareButtons(slug, getTitle(post))}
      ${renderRelated(relatedPosts, post.id)}
      <div class="blog-promo">
        <span class="blog-promo-label">From Your Mate</span>
        <h3 class="blog-promo-title">Need help with this?</h3>
        <p class="blog-promo-desc">I build websites and run SEO for regional businesses across East Gippsland and beyond.</p>
        <a href="/contact" class="blog-promo-btn">Get in touch</a>
      </div>
    </aside>
  </div>

  <div class="blog-back">
    <a href="/blog">&larr; Back to all articles</a>
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
  <link rel="stylesheet" href="/blog.css">
</head>
<body>
  ${NAV_HTML}
  <section class="blog-404">
    <h2>Article not found</h2>
    <p>This article doesn't exist or may have been removed. Check out the latest blog posts instead.</p>
    <a href="/blog">Browse all articles</a>
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
  <title>Blog \u2014 Your Mate Agency</title>
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/blog.css">
</head>
<body>
  ${NAV_HTML}
  <section class="blog-empty">
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
    const [postResult, relatedResult] = await Promise.all([
      supabase
        .from('blog_posts')
        .select('id, website_blog, seo_metadata, industry_relevance, industry, published_at, created_at, reading_time_minutes, word_count')
        .eq('status', 'published')
        .not('website_blog', 'is', null)
        .filter('seo_metadata->>url_slug', 'eq', requestSlug)
        .limit(1)
        .maybeSingle(),

      supabase
        .from('blog_posts')
        .select('id, seo_metadata, industry_relevance, published_at, created_at, reading_time_minutes')
        .eq('status', 'published')
        .not('website_blog', 'is', null)
        .order('published_at', { ascending: false })
        .limit(4),
    ]);

    if (postResult.error) {
      console.error('Error fetching blog post:', postResult.error);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(500).send(generateErrorPage());
    }

    if (!postResult.data) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(generate404Page());
    }

    const post = postResult.data as unknown as BlogPost;
    const relatedPosts = (relatedResult.data || []) as unknown as BlogPost[];

    if (relatedResult.error) {
      console.error('Error fetching related posts:', relatedResult.error);
    }

    const html = generateArticlePage(post, requestSlug, relatedPosts);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Blog article page error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(generateErrorPage());
  }
}
