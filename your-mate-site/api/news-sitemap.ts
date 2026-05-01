import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    // Google News sitemaps: articles published within the last 48 hours
    // (per https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap).
    // Fallback tier: 48h → 7d → 404 so GSC sees 404 (preferred) instead of an empty <urlset>.
    async function fetchSince(hours: number) {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      return supabase
        .from('tech_translations')
        .select(`
          seo_metadata,
          published_at,
          updated_at,
          news_item:tech_news_items!inner (
            title,
            published_at
          )
        `)
        .eq('status', 'published')
        .not('website_blog', 'is', null)
        .gte('updated_at', cutoff)
        .order('updated_at', { ascending: false })
        .limit(1000);
    }

    let { data: articles, error } = await fetchSince(48);

    if (error) {
      console.error('News sitemap error:', error);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
    }

    if (!articles || articles.length === 0) {
      const fallback = await fetchSince(24 * 7);
      if (fallback.error) {
        console.error('News sitemap 7d fallback error:', fallback.error);
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
      }
      articles = fallback.data;
    }

    if (!articles || articles.length === 0) {
      // No articles in the last 7 days — return 404 so GSC reports a clear error
      // rather than treating an empty sitemap as a successful fetch.
      return res.status(404).send('No news articles published recently.');
    }

    const urls = (articles || [])
      .map((a: any) => {
        const seo = a.seo_metadata as Record<string, string> | null;
        const slug = seo?.url_slug;
        if (!slug) return '';

        const title = seo?.meta_title || a.news_item?.title || '';
        const pubDate = a.published_at || a.news_item?.published_at || a.updated_at;
        const isoDate = new Date(pubDate).toISOString();

        return `  <url>
    <loc>https://yourmateagency.com.au/news/${encodeURIComponent(slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>Your Mate Agency</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${isoDate}</news:publication_date>
      <news:title>${esc(title)}</news:title>
    </news:news>
  </url>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=300');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('News sitemap error:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
}
