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
  published_at: string;
  created_at: string;
  reading_time_minutes: number | null;
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

function getTitle(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, string>)?.meta_title) || 'Blog Post';
}

function getDescription(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, string>)?.meta_description) || truncate(post.website_blog, 155);
}

function getSlug(post: BlogPost): string {
  return ((post.seo_metadata as Record<string, unknown>)?.url_slug as string) || '';
}

function getIndustryTags(post: BlogPost): string[] {
  const ir = post.industry_relevance;
  if (!ir) return [];
  if (Array.isArray(ir)) {
    return ir.filter(v => typeof v === 'string');
  }
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

function renderHead(): string {
  const title = 'Web Design & SEO Tips for Small Business | Your Mate Agency Blog';
  const desc = 'Practical advice on websites, SEO, and digital marketing for small businesses in regional Australia. No fluff, just useful tips.';
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="author" content="Matt - Your Mate Agency">
  <link rel="canonical" href="https://yourmateagency.com.au/blog">
  <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico">
  <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon/favicon-96x96.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png">
  <link rel="manifest" href="/favicon/site.webmanifest">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="https://yourmateagency.com.au/favicon/yma-og.png">
  <meta property="og:url" content="https://yourmateagency.com.au/blog">
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
  <link rel="stylesheet" href="/blog.css">
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://yourmateagency.com.au/' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  })}</script>
</head>`;
}

function renderHero(): string {
  return `
  <section class="blog-hero">
    <h1 class="blog-hero-title">The YMA Blog</h1>
    <p class="blog-hero-sub">Practical advice on websites, SEO, and digital marketing for small businesses in regional Australia. No fluff &mdash; just useful tips.</p>
  </section>`;
}

function renderFeatured(post: BlogPost): string {
  const slug = getSlug(post);
  if (!slug) return '';
  const preview = getDescription(post);
  const date = formatDate(post.published_at || post.created_at);
  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';
  const tags = getIndustryTags(post);
  const tagsHtml = tags.length > 0 ? `<div class="blog-featured-tags">${renderTagPills(tags)}</div>` : '';

  return `
  <section class="blog-featured">
    <a href="/blog/${esc(slug)}" class="blog-featured-card">
      ${tagsHtml}
      <h2 class="blog-featured-title">${esc(getTitle(post))}</h2>
      <p class="blog-featured-preview">${esc(preview)}</p>
      <div class="blog-featured-meta">
        <span>${date}</span>
        ${readTime ? `<span>&middot;</span><span>${readTime}</span>` : ''}
      </div>
      <span class="blog-featured-link">Read more &rarr;</span>
    </a>
  </section>`;
}

function renderCard(post: BlogPost): string {
  const slug = getSlug(post);
  if (!slug) return '';
  const preview = getDescription(post);
  const date = formatDate(post.published_at || post.created_at);
  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';
  const tags = getIndustryTags(post);
  const tagsHtml = tags.length > 0 ? `<div class="blog-card-tags">${renderTagPills(tags)}</div>` : '';

  return `
      <a href="/blog/${esc(slug)}" class="blog-card">
        ${tagsHtml}
        <h3 class="blog-card-title">${esc(getTitle(post))}</h3>
        <p class="blog-card-preview">${esc(preview)}</p>
        <div class="blog-card-meta">
          <span>${date}</span>
          ${readTime ? `<span>${readTime}</span>` : ''}
        </div>
      </a>`;
}

function renderGrid(posts: BlogPost[]): string {
  if (posts.length === 0) return '';

  let html = `
  <section class="blog-grid-section">
    <div class="blog-grid">`;

  posts.forEach(post => {
    html += renderCard(post);
  });

  html += `
    </div>
  </section>`;
  return html;
}

function renderStaticPosts(): string {
  const staticPosts = [
    { slug: 'choose-web-developer-regional-victoria', title: 'How to Choose a Web Developer in Regional Victoria', desc: 'What to look for when hiring a web developer in regional Victoria. Practical tips for small businesses.' },
    { slug: 'website-cost-gippsland', title: 'How Much Does a Website Cost in Gippsland?', desc: 'A straightforward breakdown of website costs for small businesses in Gippsland and regional Victoria.' },
    { slug: 'tradies-website-2026', title: 'Why Every Tradie Needs a Website in 2026', desc: 'Still relying on word of mouth? Here\'s why a website is essential for tradies in 2026.' },
    { slug: 'google-maps-local-business', title: 'Google Maps for Local Business', desc: 'How to get your business showing up on Google Maps and attract more local customers.' },
    { slug: 'tradie-website', title: 'Tradie Website Guide', desc: 'Everything tradies need to know about getting a website that actually brings in work.' },
    { slug: 'regional-seo', title: 'Regional SEO Guide', desc: 'How to rank your business in regional search results and get found by local customers.' },
    { slug: 'ai-small-business', title: 'AI for Small Business', desc: 'Practical ways small businesses can use AI tools to save time and get more done.' },
  ];

  let html = `
  <section class="blog-static-section">
    <h2 class="blog-static-heading">More from the blog</h2>
    <div class="blog-grid">`;

  staticPosts.forEach(post => {
    html += `
      <a href="/blog/${esc(post.slug)}" class="blog-card">
        <h3 class="blog-card-title">${esc(post.title)}</h3>
        <p class="blog-card-preview">${esc(post.desc)}</p>
      </a>`;
  });

  html += `
    </div>
  </section>`;
  return html;
}

function renderEmpty(): string {
  return `
  <section class="blog-empty">
    <h2>More articles coming soon.</h2>
    <p>Practical tips for regional businesses will appear here soon.</p>
  </section>`;
}

// ---------------------------------------------------------------------------
// Full page assembly
// ---------------------------------------------------------------------------

function generatePage(posts: BlogPost[]): string {
  const featured = posts.length > 0 ? posts[0] : null;
  const gridPosts = posts.slice(1);

  return `<!DOCTYPE html>
<html lang="en">
${renderHead()}
<body>
  ${NAV_HTML}
  ${renderHero()}
  ${featured ? renderFeatured(featured) : ''}
  ${gridPosts.length > 0 ? renderGrid(gridPosts) : ''}
  ${posts.length === 0 ? renderEmpty() : ''}
  ${renderStaticPosts()}
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
  ${renderHero()}
  <section class="blog-empty">
    <h2>Something went wrong.</h2>
    <p>We're having trouble loading the blog right now. Try refreshing, or <a href="/contact">get in touch</a> if it keeps happening.</p>
  </section>
  ${renderStaticPosts()}
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

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, website_blog, seo_metadata, industry_relevance, published_at, created_at, reading_time_minutes')
      .eq('status', 'published')
      .not('website_blog', 'is', null)
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching blog posts:', error);
    }

    const posts = (data || []) as unknown as BlogPost[];
    const html = generatePage(posts);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Blog listing page error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(generateErrorPage());
  }
}
