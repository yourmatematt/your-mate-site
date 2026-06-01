import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

interface ProjectMeta {
  title: string;
  description: string;
}

// Per-slug meta — substituted into the shared _project.html template.
// Adding a new slug: drop in a new entry. Unknown slugs fall back to the
// template's existing generic values (intentional — see DEFAULT below).
const PROJECT_META: Record<string, ProjectMeta> = {
  'hammond-properties': {
    title: 'Hammond Properties Mallacoota | Luxury Holiday Rentals — Your Mate Agency',
    description: "Case study: how Your Mate Agency rebuilt Hammond Properties' booking site to showcase Mallacoota's best luxury holiday rentals and drive direct bookings.",
  },
  'scallywags': {
    title: 'Scallywags Mallacoota | Seafood Bar — Your Mate Agency',
    description: "Case study: a fast, photo-led website for Scallywags Mallacoota — a seafood bar serving fresh East Gippsland catch — built by Your Mate Agency.",
  },
  'studio-at-65': {
    title: 'Studio 65 Mallacoota | Salon Website with Online Booking — Your Mate Agency',
    description: "Case study: a clean, easy-to-manage salon website with built-in online booking for Studio 65 Mallacoota, by Your Mate Agency.",
  },
  'mallacoota-barbie-boats': {
    title: 'Mallacoota Barbie Boats | Boat Hire Booking System — Your Mate Agency',
    description: "Case study: how a Mallacoota boat hire business got a self-serve booking system that runs itself, built by Your Mate Agency.",
  },
};

const DEFAULT_META: ProjectMeta = {
  title: 'Project | Your Mate Agency',
  description: 'Case study from Your Mate Agency — websites, SEO, and digital solutions for regional Australian businesses.',
};

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function applyMeta(html: string, meta: ProjectMeta): string {
  const titleAttr = escapeAttr(meta.title);
  const descAttr = escapeAttr(meta.description);
  // Substitute the four tags _project.html ships with generic copy in.
  // Each substitution is a single-line literal replace, anchored on the
  // existing default value, so it's safe to run more than once (re-replacing
  // the generic default with a slug-specific one).
  return html
    .replace(/<title>Project \| Your Mate Agency<\/title>/, `<title>${titleAttr}<\/title>`)
    .replace(
      /<meta name="description" content="Case study from Your Mate Agency — websites, SEO, and digital solutions for regional Australian businesses\.">/,
      `<meta name="description" content="${descAttr}">`
    )
    .replace(
      /<meta property="og:title" content="Project \| Your Mate Agency">/,
      `<meta property="og:title" content="${titleAttr}">`
    )
    .replace(
      /<meta property="og:description" content="Case study from Your Mate Agency — websites, SEO, and digital solutions for regional Australian businesses\.">/,
      `<meta property="og:description" content="${descAttr}">`
    );
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const rawSlug = req.query.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) ?? '';
    const meta = PROJECT_META[slug] ?? DEFAULT_META;

    const currentDir = dirname(fileURLToPath(import.meta.url));
    const template = readFileSync(join(currentDir, '..', '..', '_project.html'), 'utf-8');
    const html = applyMeta(template, meta);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error serving project page:', error);
    return res.status(500).send('Internal server error');
  }
}
