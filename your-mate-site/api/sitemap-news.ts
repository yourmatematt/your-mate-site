import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const { data: articles, error } = await supabase
      .from('tech_translations')
      .select(`
        seo_metadata,
        updated_at
      `)
      .eq('status', 'published')
      .not('website_blog', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Sitemap news error:', error);
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
    }

    const urls = (articles || [])
      .map((a: any) => {
        const slug = (a.seo_metadata as Record<string, string>)?.url_slug;
        if (!slug) return '';

        const lastmod = new Date(a.updated_at).toISOString().split('T')[0];

        return `  <url>
    <loc>https://yourmateagency.com.au/news/${encodeURIComponent(slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap news error:', error);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>');
  }
}
