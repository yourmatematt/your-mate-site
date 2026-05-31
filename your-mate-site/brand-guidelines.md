# Your Mate Agency (YMA) Brand Guidelines

## Color Palette

### Primary Colors
- **Black**: `#000000` - Primary navigation, headings, main text
- **White**: `#ffffff` - Background, contrast text
- **Green (Brand)**: `#2D9F5E` - Logo background, accent color, hover states, links

### Secondary Colors
- **Dark Grey**: `#333333` - Button hover states
- **Medium Grey**: `#666666` - Secondary text, descriptions
- **Light Grey**: `#737373` - Muted text, categories, form labels
- **Very Light Grey**: `#a3a3a3` - Subtle text, step numbers, disabled states
- **Border Grey**: `#e0e0e0` / `#e5e5e5` - Dividers, borders, card outlines
- **Background Grey**: `#f5f5f5` - Section backgrounds, portfolio section
- **Light Border**: `#CCCCCC` - Step numbers in services

### Semantic Colors
- **White with opacity**: `rgba(255, 255, 255, 0.6)` - Hover states for white text
- **White with high opacity**: `rgba(255, 255, 255, 0.87)` - Primary white text

## Typography

### Font Family
- **Primary**: `'Inter', sans-serif` - All text throughout the site
- **System Fallback**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Font Weights
- **Regular**: `400` - Body text, navigation links
- **Medium**: `500` - Buttons, form labels, project links
- **Semi-Bold**: `600` - Subheadings, portfolio cards, smaller headings
- **Bold**: `700` - Main headings, hero text, section titles, navigation logo

### Font Sizes & Hierarchy

#### Headings
- **H1 (Hero)**: `clamp(2.5rem, 7vw, 5rem)` (40px-80px) - Hero text
- **H1 (Page)**: `clamp(2.5rem, 5vw, 4rem)` (40px-64px) - Page titles
- **H1 (Large)**: `72px` (Desktop) / `40px` (Mobile) - Footer text
- **H2 (Section)**: `60px` (Desktop) / `48px` (Mobile) - Section headings like "Work"
- **H2 (Services)**: `56px` (Desktop) / `36px` (Mobile) - Services heading
- **H2 (Medium)**: `clamp(1.5rem, 4vw, 2.5rem)` (24px-40px) - About, Services
- **H3 (Cards)**: `28px` (Desktop) / `24px` (Mobile) - Work card titles
- **H3 (Small)**: `1.25rem` (20px) - Content block headings
- **H3 (Portfolio)**: `1rem` (16px) - Portfolio card titles

#### Body Text
- **Large Body**: `22px` - Services intro text
- **Medium Body**: `1.125rem` (18px) - Work card descriptions, content blocks, about text
- **Regular Body**: `1rem` (16px) - Navigation, buttons, general text
- **Small Body**: `0.875rem` (14px) - Technical toggles, process labels, portfolio descriptions

#### Special Text
- **CTA Large**: `32px` (Desktop) / `24px` (Mobile) - Services CTA
- **Navigation**: `1rem` (16px) / `32px` (Mobile menu)
- **Step Text**: `20px` (Desktop) / `16px` (Mobile) - How it works steps
- **Footer Email**: `18px` (Desktop) / `16px` (Mobile)

### Line Heights
- **Tight**: `1.1` - Large headings, hero text
- **Normal**: `1.4` - CTA text
- **Medium**: `1.5` - Step text, body copy
- **Relaxed**: `1.6` - Default body text, services intro
- **Loose**: `1.7` - Content blocks

### Letter Spacing
- **Tight**: `-0.02em` - Large headings (60px+, hero text)
- **Slightly Tight**: `-0.01em` - Card headings (28px)
- **Normal**: `0` - Default
- **Wide**: `0.05em` - Process labels
- **Wider**: `0.1em` - In-progress labels

## Spacing System

### Padding/Margins
- **xs**: `0.5rem` (8px)
- **sm**: `0.75rem` (12px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `2.5rem` (40px)
- **3xl**: `3rem` (48px)
- **4xl**: `4rem` (64px)
- **5xl**: `5rem` (80px)
- **6xl**: `6rem` (96px)

### Container Widths
- **Small Content**: `720px` - About, services content
- **Medium Content**: `800px` - Project pages
- **Large Content**: `1200px` - Portfolio section
- **Full Width**: `100%` - Hero, work grid

### Section Padding
- **Standard Desktop**: `6rem 0` (96px top/bottom)
- **Standard Mobile**: `4rem 1.5rem` (64px top/bottom, 24px sides)
- **Navigation Inner**: `1rem 2.5rem` (Desktop) / `1rem 1.5rem` (Mobile)
- **Footer**: `4rem 5.75rem` (Desktop) / `3rem 1.5rem` (Mobile)

### Grid Systems
- **Work Grid**: `repeat(2, 1fr)` (Desktop) / `1fr` (Mobile)
- **Portfolio Grid**: `repeat(3, 1fr)` → `repeat(2, 1fr)` → `1fr` (Responsive)

## Component Styles

### Buttons

#### Primary Button (`.btn-primary`)
- **Background**: `#000000`
- **Text**: `#ffffff`
- **Padding**: `0.875rem 1.5rem` (14px 24px)
- **Border Radius**: `6px`
- **Font Weight**: `500`
- **Hover**: `background: #333333`

#### Outline Button (`.btn-outline`)
- **Background**: `transparent`
- **Text**: `#000000`
- **Border**: `1px solid #e5e5e5`
- **Hover**: `border-color: #000000`

#### Project Link (`.project-link`)
- **Background**: `#000000`
- **Text**: `#ffffff`
- **Padding**: `0.5rem 1.25rem`
- **Border Radius**: `6px`
- **Font Weight**: `500`

### Cards

#### Work Cards (`.work-card`)
- **Background**: `#ffffff`
- **Image Aspect Ratio**: `10 / 7`
- **Info Padding**: `1.5rem 2rem 4rem 2rem`
- **Hover Effects**: Image opacity `0.9`, title color `#2D9F5E`

#### Portfolio Cards (`.portfolio-card`)
- **Background**: `#ffffff`
- **Border Radius**: `8px`
- **Image Aspect Ratio**: `4/3`
- **Hover**: Image `translateY(-4px)`

### Navigation

#### Main Navigation (`.nav`)
- **Background**: `#000000`
- **Position**: `fixed`
- **Z-index**: `100`

#### Navigation Logo (`.nav-logo`)
- **Background**: `#2D9F5E`
- **Text**: `#ffffff`
- **Padding**: `0.75rem 3rem 0.75rem 1rem`
- **Font Weight**: `700`

#### Navigation Links (`.nav-links`)
- **Text**: `#ffffff`
- **Gap**: `2.5rem`
- **Hover**: `rgba(255, 255, 255, 0.6)`

### Forms & Inputs
*Note: Form styling is primarily handled inline in React components*

### Footer

#### Footer Layout (`.footer`)
- **Background**: `#000000`
- **Text**: `#ffffff`
- **Padding**: `4rem 5.75rem` (Desktop) / `3rem 1.5rem` (Mobile)
- **Min Height**: `400px` (Desktop) / `300px` (Mobile)

#### Footer Text Styling
- **Static Text**: `72px` (Desktop) / `40px` (Mobile), `#ffffff`
- **Rotating Text**: `72px` (Desktop) / `40px` (Mobile), `#2D9F5E`
- **Email/ABN**: `18px` (Desktop) / `16px` (Mobile)

## Custom CSS Classes

### Layout Classes
- `.nav` - Fixed navigation bar
- `.nav-inner` - Navigation container
- `.nav-logo` - Logo styling with green background
- `.nav-links` - Navigation link container
- `.nav-hamburger` - Mobile hamburger menu
- `.mobile-menu` - Full-screen mobile navigation

### Hero Section Classes
- `.hero-container` - Main hero wrapper
- `.hero` - Sticky hero section
- `.hero-slides` - Image slideshow container
- `.hero-slide` - Individual slide
- `.hero-text` - Main hero text overlay
- `.scroll-indicator` - Animated scroll prompt

### Content Classes
- `.work` - Work section wrapper
- `.work-grid` - Two-column work grid
- `.work-card` - Individual work item
- `.work-card-info` - Work card text content
- `.work-card-plus` - Hover plus indicator

### Services Classes
- `.services-section` - Services wrapper
- `.services-content` - Services text content
- `.services-heading` - Large services title
- `.services-intro` - Intro paragraph styling
- `.services-cta` - Call-to-action link
- `.how-it-works-steps` - Process steps container
- `.step` - Individual process step
- `.step-number` - Step number styling
- `.step-text` - Step description

### Portfolio Classes
- `.portfolio` - Portfolio section
- `.portfolio-grid` - Responsive grid for portfolio items
- `.portfolio-card` - Portfolio item card
- `.portfolio-image` - Portfolio item image
- `.in-progress-section` - Coming soon section
- `.in-progress-label` - "Coming soon" label

### Utility Classes
- `.btn` - Base button styling
- `.btn-primary` - Primary button
- `.btn-outline` - Outline button
- `.fade-in` - Animation class for fade-in effects
- `.visible` - Animation trigger class

### Project Page Classes
- `.project-hero` - Project page hero image
- `.project-header` - Project page header
- `.project-category` - Project category text
- `.project-content` - Main project content
- `.technical-details` - Expandable technical section
- `.technical-toggle` - Technical details toggle button
- `.content-block` - Content section wrapper
- `.testimonial` - Client testimonial styling
- `.back-link` - Back to work link

### Footer Classes
- `.footer` - Main footer container
- `.footer-content` - Footer layout wrapper
- `.footer-location` - Location text container
- `.footer-static` - Static footer text
- `.footer-rotating` - Animated rotating text (green)
- `.footer-email` - Email link styling
- `.footer-socials` - Social media links
- `.footer-social-link` - Individual social link

## Responsive Breakpoints

### Primary Breakpoint
- **Desktop**: `> 768px`
- **Mobile**: `≤ 768px` (`@media (max-width: 768px)`)

### Additional Breakpoints
- **Large Desktop**: `> 900px` (Portfolio grid)
- **Small Mobile**: `≤ 600px` (Portfolio grid single column)

## Animation & Transitions

### Standard Transitions
- **Fast**: `0.2s ease` - Hover effects, colors
- **Medium**: `0.3s ease` - Transforms, opacity changes
- **Slow**: `400ms ease-in-out` - Mobile menu
- **Fade-ins**: `600ms ease-out` - Section animations

### Hover Effects
- **Color Changes**: `transition: color 0.2s ease`
- **Transform**: `transition: transform 300ms ease-out`
- **Background**: `transition: background 0.2s ease`
- **Opacity**: `transition: opacity 300ms ease-out`

### Special Animations
- **Bounce**: `@keyframes bounce` - Scroll indicator
- **Slide Transitions**: `opacity 0.4s ease-out, transform 0.4s ease-out`
- **Mobile Menu**: Staggered animation delays (200ms-600ms)