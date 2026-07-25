# Example Output — scoutco.ai Clone

This is a real completed clone project. Use it as a reference for what "done" looks like.

## Project Structure (after completion)

```
scoutco-clone/
  app/
    globals.css           # 1073 lines — ALL styles, organized by section
    layout.tsx            # Root layout: GsapProvider + LenisProvider
    page.tsx              # Imports + renders all sections in order
  components/
    sections/             # One per page section (8 sections)
      header.tsx
      hero-section.tsx
      infographic-block.tsx
      domain-block.tsx
      tabbed-products.tsx
      accordion-section.tsx
      link-list-section.tsx   # Exports CareersSection + NewsSection
      footer.tsx
    ui/                   # Shared primitives (10 components)
      accordion-item.tsx
      arrow-icon.tsx
      button.tsx
      lenis-provider.tsx
      lines.tsx
      link-list-btn.tsx
      pixel-reveal.tsx
      video-player.tsx
    canvas/               # 3D/WebGL
      domain-scene.tsx
  lib/
    gsap.ts               # GSAP + ScrollTrigger registration + GsapProvider
    animations.ts         # fadeInUp, staggerFadeInUp, revealLine, clipReveal, heroTextReveal
    headline-reveal.ts    # Custom scramble text hook
    utils.ts              # cn() utility
  public/
    fonts/                # 10 font files (woff2 + woff pairs)
    assets/               # 3 videos, images
  reference/
    clone.html            # Raw HTML from original
    raw-pretty.html       # Prettified version for searching
  downloaded_assets/      # Original CSS/JS bundles for reference
```

## globals.css Organization

```css
/* === FONTS === */
@font-face { ... }  /* All font faces first */

/* === TAILWIND === */
@import "tailwindcss";

/* === THEME TOKENS === */
@theme inline {
  --color-bg: #0b0b0e;
  --color-fg: #e9ede5;
  /* ... all semantic color tokens */
  --font-protocol: 'Protocol', sans-serif;
  /* ... all font family tokens */
}

/* === CSS CUSTOM PROPERTIES === */
:root {
  --ease-out: cubic-bezier(.33, 1, .68, 1);
  --header-height: 80px;
  --section-px: 4.444vw;
  /* ... all layout properties */
}

/* === BASE STYLES === */
html, body, *, h1-h6, p, a, ul, figure { ... }

/* === TYPOGRAPHY SYSTEM === */
h1, h2, h3, h4, h5, p variants { ... }

/* === MOBILE TYPOGRAPHY === */
@media (max-width: 939px) { ... }

/* === ANIMATION UTILITIES === */
.pre-anim, .img-cover, .video-cover { ... }

/* === KEYFRAMES === */
@keyframes pulse { ... }

/* === HEADER === */
header#header { ... }

/* === SECTION: Hero === */
section.page-header { ... }

/* === SECTION: Infographic === */
/* ... one block per section ... */

/* === PIXEL GRID === */
.pixel-grid { ... }
.pixel-grid .pixel { ... }

/* === MOBILE OVERRIDES === */
@media (max-width: 939px) { ... }
```

## page.tsx Assembly

```tsx
import { Header } from "@/components/sections/header";
import { HeroSection } from "@/components/sections/hero-section";
import { InfographicBlock } from "@/components/sections/infographic-block";
import { DomainBlock } from "@/components/sections/domain-block";
import { TabbedProducts } from "@/components/sections/tabbed-products";
import { AccordionSection } from "@/components/sections/accordion-section";
import { CareersSection, NewsSection } from "@/components/sections/link-list-section";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Header />
      <div id="universe">
        <div className="page">
          <HeroSection />
          <InfographicBlock />
          <DomainBlock />
          <TabbedProducts />
          <AccordionSection />
          <CareersSection />
          <NewsSection />
        </div>
      </div>
      <Footer />
    </>
  );
}
```

## Key Patterns Demonstrated

1. **CSS-first**: 1073 lines of globals.css using original selectors, not Tailwind utilities
2. **Exact class names**: `.page-header.layout-hero`, `.accordion-wrapper`, `.communication` — copied from original HTML
3. **GSAP cleanup**: Every section uses `gsap.context()` in `useEffect` with `return () => ctx.revert()`
4. **PixelReveal per-media**: Each VideoPlayer has its own PixelReveal instance, triggered on `onCanPlay`
5. **pre-anim pattern**: Elements start `visibility: hidden`, revealed by GSAP or IntersectionObserver
6. **Original breakpoints**: `@media (max-width: 939px)` — not Tailwind `md`
7. **Verbatim content**: All text copied exactly, including special characters and typography
