# Fishing Classics — Frontend Build from Stitch Designs

## Objective

Build the public-facing website for Australian Fishing Classics using the UI designs from my Stitch project. Use the Stitch MCP to fetch each screen's HTML/CSS and convert to React + Tailwind components. Connect all dynamic data to the existing Supabase backend.

## Stack

- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- @supabase/supabase-js
- Behold.so React widget (Instagram feed)
- Google Fonts: Bebas Neue, Barlow, Barlow Condensed

## Setup

Initialise a Vite + React + TypeScript project with Tailwind. Configure Supabase client:
```env
VITE_SUPABASE_URL=https://bpdxikcwegjyzfhnqbil.supabase.co
VITE_SUPABASE_ANON_KEY=<will provide>
```

## Screen → Route Mapping

Use the Stitch MCP to fetch the design HTML for each screen, then build as React + Tailwind components matching the designs pixel-for-pixel.

### Pages

| # | Stitch Screen | Route | Notes |
|---|--------------|-------|-------|
| 1 | Australian Fishing Classics Landing Page | / | Homepage — all sections as components |
| 2 | MFC Detail - The Tournament Hub | /competitions/mallacoota-flatty-classic | Competition detail page |
| 3 | AFC Shop Listing - The Merch Store | /shop | Product grid |
| 4 | AFC Product Detail - Tournament Jersey | /shop/:slug | Single product with variants |
| 5 | AFC Leaderboard - Live Stream v1 | /leaderboard | Full leaderboard with realtime |
| 6 | AFC Contact - The Scallywag Hub | /contact | Contact form + info |
| 7 | MFC Registration - Step 1 | /register/mallacoota-flatty-classic (step 1) | Captain details + team name |
| 8 | MFC Registration - Step 2 | /register/mallacoota-flatty-classic (step 2) | Add teammates |
| 9 | MFC Registration - Step 3 | /register/mallacoota-flatty-classic (step 3) | Payment summary + Stripe redirect |
| 10 | MFC Registration - Confirmed | /register/mallacoota-flatty-classic (step 4) | Success confirmation |
| 11 | MFC Waitlist - Your Team | /waitlist/mallacoota-flatty-classic (step 1) | Waitlist captain details |
| 12 | MFC Waitlist - Teammates | /waitlist/mallacoota-flatty-classic (step 2) | Waitlist teammates |
| 13 | MFC Waitlist - Confirmed | /waitlist/mallacoota-flatty-classic (confirmed) | Waitlist confirmation + queue position |
| 14 | The Lookout - Blog Listing | /blog | Blog grid |
| 15 | The Lookout - Cinematic Post | /blog/:slug | Blog post template (use this as primary) |
| 16 | The Lookout - Cinematic Post v2 | — | Alternative blog template, skip for now |
| 17 | The Lookout - Pro Guide Post | — | Alternative blog template, skip for now |
| 18 | The Lookout - Tournament Dispatch | — | Alternative blog template, skip for now |
| 19 | AFC Mobile - Cinematic Splash | — | Mobile reference, use for responsive breakpoints |

Also create these routes that don't have dedicated Stitch screens:
- /confirm/:token — Team member confirmation page (simple form: shirt size, delivery preference, address, pay if needed)
- /gallery/mallacoota-flatty-classic-2025 — Full gallery page pulling from gallery_images table
- /mallacoota-flatty-classic-2025/results — Full results page pulling from competition_results table

## Supabase Data Connections

### Homepage (/)
```typescript
// Competitions — hero, countdown, comp card
const { data: competitions } = await supabase
  .from('competitions')
  .select('*')
  .in('status', ['upcoming', 'registration_open'])
  .order('dates_start')

// Capacity — spots remaining for comp card
const { data: capacity } = await supabase
  .from('competition_capacity')
  .select('*')

// Sponsors — sponsor wall
const { data: sponsors } = await supabase
  .from('sponsors')
  .select('*')
  .eq('is_active', true)
  .order('display_order')

// Last year's champs — top 5 teams from 2025 comp
const { data: results } = await supabase
  .from('competition_results')
  .select('*, teams(team_name)')
  .eq('competition_id', COMP_2025_ID)
  .order('finish_position')
  .limit(5)

// Email signup — insert
const { error } = await supabase
  .from('email_subscribers')
  .insert({ email, name, source: 'homepage_footer' })
```

### Competition Page (/competitions/mallacoota-flatty-classic)
```typescript
// Competition details
const { data: comp } = await supabase
  .from('competitions')
  .select('*')
  .eq('slug', 'mallacoota-flatty-classic')
  .single()

// Capacity
const { data: capacity } = await supabase
  .from('competition_capacity')
  .select('*')
  .eq('competition_id', comp.id)
  .single()

// Gallery
const { data: gallery } = await supabase
  .from('gallery_images')
  .select('*, media(file_url, alt_text)')
  .eq('competition_id', comp.id)
  .eq('is_visible', true)
  .order('display_order')

// Leaderboard (during active comp)
const { data: leaderboard } = await supabase
  .from('fish_records')
  .select('team_id, teams(team_name), weight_grams')
  .eq('competition_id', comp.id)

// Past results
const { data: results } = await supabase
  .from('competition_results')
  .select('*, teams(team_name)')
  .eq('competition_id', comp.id)
  .order('finish_position')
```

### Registration Flow (/register/mallacoota-flatty-classic)
```typescript
// Step 1: Create reservation hold
// Calls edge function which creates registration_sessions row
// Returns session_id + expires_at for 15-min countdown timer

// Step 3: Create Stripe checkout
const { data } = await supabase.functions.invoke('create-checkout', {
  body: {
    type: 'registration',
    competitionId: comp.id,
    captain: { name, email, phone, shirtSize, delivery, address },
    teammates: [{ name, email, phone }, ...],
    payForAll: boolean
  }
})
window.location.href = data.url // Stripe checkout redirect

// Step 4: Confirmation page reads from URL params after Stripe redirect
```

### Team Member Confirmation (/confirm/:token)
```typescript
// Load participant by token
const { data: participant } = await supabase
  .from('participants')
  .select('*, teams(team_name, competitions(name))')
  .eq('payment_link_token', token)
  .single()

// If needs payment: call create-checkout edge function
// If captain paid: just update details
const { error } = await supabase
  .from('participants')
  .update({
    shirt_size: selectedSize,
    shirt_delivery: deliveryPref,
    shipping_address: address,
    details_confirmed: true
  })
  .eq('payment_link_token', token)
```

### Waitlist Flow (/waitlist/mallacoota-flatty-classic)
```typescript
// Submit waitlist entry
const { error } = await supabase
  .from('waitlist')
  .insert({
    competition_id: comp.id,
    team_name: teamName,
    captain_name: name,
    captain_email: email,
    captain_phone: phone,
    team_members: JSON.stringify(teammates),
    team_size: teammates.length + 1,
    status: 'waiting'
  })
```

### Shop (/shop)
```typescript
// Product listing
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)
  .order('display_order')

// Product detail with variants
const { data: product } = await supabase
  .from('products')
  .select('*, product_variants(*)')
  .eq('slug', slug)
  .single()

// Checkout
const { data } = await supabase.functions.invoke('create-checkout', {
  body: { type: 'merch', items, customer, shipping }
})
window.location.href = data.url
```

### Blog (/blog)
```typescript
// Listing
const { data: posts } = await supabase
  .from('blog_posts')
  .select('*, media!featured_image_id(file_url)')
  .eq('status', 'published')
  .order('published_at', { ascending: false })

// Single post
const { data: post } = await supabase
  .from('blog_posts')
  .select('*, media!featured_image_id(file_url), blog_post_media(media(file_url), display_order)')
  .eq('slug', slug)
  .single()
```

### Leaderboard (/leaderboard)
```typescript
// Full leaderboard with realtime subscription
const { data: leaderboard } = await supabase
  .from('fish_records')
  .select('team_id, teams(team_name, participants(name)), weight_grams, species')
  .eq('competition_id', activeCompId)

// Realtime subscription for live updates
const channel = supabase
  .channel('leaderboard')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'fish_records',
    filter: `competition_id=eq.${activeCompId}`
  }, () => refetchLeaderboard())
  .subscribe()
```

### Contact (/contact)
```typescript
// Email signup with contact source
const { error } = await supabase
  .from('email_subscribers')
  .insert({ email, name, source: 'contact_page' })
```

## Shared Components to Extract

- Navbar (transparent → solid on scroll)
- Footer (4-column with AFC branding)
- CountdownTimer (reusable, takes target date prop)
- Button (primary orange + secondary outline variants)
- SectionHeader (label + title pattern used across all pages)
- CompetitionCard
- ProductCard
- BlogCard
- SponsorWall (tiered)
- LeaderboardTable
- LeaderboardSpotlight

## Important Notes

- 2% processing fee added to all payment totals at checkout
- Registration flow has 15-minute reservation timer — must be visible and functional
- When joining participants to teams, use explicit FK: participants!participants_team_id_fkey(*)
- Supabase Storage bucket "media" — get public URLs with: supabase.storage.from('media').getPublicUrl(filePath)
- Instagram feed: Use Behold.so React widget with feedId (will provide)
- The Stitch screen "AFC Mobile - Cinematic Splash" (#19) should inform all responsive mobile breakpoints
- Blog post templates 16, 17, 18 are alternatives — build screen #15 as the primary template
- All media/images will be placeholders initially — just ensure the layout handles them

## Build Order

1. Project setup + Supabase client + Router + shared components (Navbar, Footer, Button, SectionHeader)
2. Homepage — section by section, matching Stitch screen #1
3. Competition page — Stitch screen #2
4. Registration flow — Stitch screens #7-10 as multi-step form
5. Team member confirmation — /confirm/:token (no Stitch screen, simple form)
6. Waitlist flow — Stitch screens #11-13
7. Leaderboard — Stitch screen #5 with Supabase Realtime
8. Shop + Product Detail — Stitch screens #3-4
9. Blog listing + post — Stitch screens #14-15
10. Contact — Stitch screen #6
11. Gallery + Results pages (no Stitch screens, derive layout from competition page)
12. Mobile responsive pass using Stitch screen #19 as reference

Start with step 1. After each step, confirm what was built before moving to the next.