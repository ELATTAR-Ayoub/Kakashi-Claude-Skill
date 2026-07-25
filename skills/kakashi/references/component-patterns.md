# Component Patterns & Project Structure

## Project Structure

```
app/
  layout.tsx            # Root layout: fonts, providers (GSAP, Lenis), metadata
  page.tsx              # Section composition (import + render in order)
  globals.css           # ALL styles, CSS-first, organized by section
components/
  sections/             # One file per page section
    header.tsx
    hero-section.tsx
    [name]-block.tsx
    [name]-section.tsx
  ui/                   # Shared reusable components
    button.tsx
    lines.tsx
    video-player.tsx
    pixel-reveal.tsx
    accordion-item.tsx
    arrow-icon.tsx
    lenis-provider.tsx
  canvas/               # Three.js / R3F scenes (only if needed)
    [name]-scene.tsx
lib/
  gsap.ts               # GSAP + ScrollTrigger registration
  headline-reveal.ts    # Scramble text hook
  utils.ts              # cn() utility
public/
  fonts/                # Downloaded font files
  assets/               # Images, videos, Lottie files
reference/              # Original HTML (source of truth)
  clone.html
  raw-pretty.html
downloaded_assets/      # Original CSS/JS for reference
```

---

## CSS Organization in globals.css

```css
/* === THEME (Tailwind v4) === */
@import "tailwindcss";
@theme inline {
  --color-bg: #0b0b0e;
  --color-fg: #e9ede5;
  --color-accent: #14cd9c;
  /* ... ADAPT all colors from target site ... */
}

/* === FONT FACES === */
@font-face { /* ... */ }

/* === BASE / RESET === */
body { background-color: var(--color-bg); color: var(--color-fg); }
.pre-anim { visibility: hidden; }

/* === SHARED UTILITIES === */
.global-label { /* ... */ }
.cover, .img-cover, .img-contain { /* ... */ }
.pixel-grid { /* ... */ }

/* === HEADER === */
header#header { /* ... */ }

/* === SECTION: [Name] === */
section.[name] { /* ... */ }

/* === KEYFRAMES === */
@keyframes pulse { /* ... */ }

/* === MOBILE === */
@media (max-width: 939px) { /* ADAPT breakpoint */ }
```

### CSS Rules
- Use EXACT selectors from original (e.g., `section.accordion div.communication span.label`)
- Include vendor prefixes (`-webkit-backdrop-filter`, `-moz-column-gap`)
- ONE `@keyframes` per animation name, no duplicates
- Mobile queries use original breakpoint value
- Comment headers: `/* === SECTION NAME === */`

---

## Section Component Pattern

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useHeadlineReveal } from "@/lib/headline-reveal";
import { Lines } from "@/components/ui/lines";

export function SectionName() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useHeadlineReveal(textRef, {
    headlineSelector: "h5,h2",
    bodySelector: "p",
    animateBody: true,
    rootMargin: "0% 0% -15% 0%",
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      // Scroll-triggered animations
    }, section);
    return () => ctx.revert();  // ALWAYS clean up
  }, []);

  return (
    <section ref={sectionRef} className="section-name">
      <div ref={textRef} className="block-text pre-anim">
        {/* Content with EXACT original class names */}
      </div>
      <Lines offset lines={["right", "bottom", "left"]}
        plusPositions={["bottomLeft", "bottomRight"]} />
    </section>
  );
}
```

---

## The `pre-anim` Pattern

```css
.pre-anim { visibility: hidden; }
```

Elements start hidden, revealed by:
1. `useHeadlineReveal`: on IntersectionObserver trigger
2. GSAP ScrollTrigger, on scroll position
3. Direct observer, `el.classList.remove("pre-anim")`

**Never remove this pattern.** Prevents FOUC.

---

## GSAP Usage Pattern

```tsx
useEffect(() => {
  const el = ref.current;
  if (!el) return;

  const ctx = gsap.context(() => {
    // All GSAP code, auto-scoped to element
    gsap.from(el.querySelector(".media-wrapper"), {
      scale: 1.1, opacity: 0,
      ease: "cubic.inOut", duration: 0.5, delay: 0.3,
    });
  }, el);

  return () => ctx.revert();
}, []);
```

---

## Verification with Superpowers

### Parallel verification agents (`superpowers:dispatching-parallel-agents`)
- **Agent 1:** HTML structure, classes, nesting, elements vs reference
- **Agent 2:** CSS: selectors, properties, values, vendor prefixes vs reference
- **Agent 3:** Animations, triggers, params, easing vs JS bundles
- **Agent 4:** Build, `tsc --noEmit`, `next build`, no dead code

### Systematic debugging (`superpowers:systematic-debugging`)
Use when: animation doesn't trigger, layout breaks, CSS specificity conflicts, client-rendered content missing.

### Verification before completion (`superpowers:verification-before-completion`)
ALWAYS use before claiming done. Run build, TypeScript check, compare sections.

---

## Common Pitfalls Checklist

- [ ] Class names match original exactly
- [ ] DOM nesting matches, same depth, order, element types
- [ ] Styles in globals.css, not inline (unless dynamic)
- [ ] No double-nested wrappers
- [ ] No duplicate CSS rules or @keyframes
- [ ] Empty elements preserved
- [ ] Vendor prefixes included
- [ ] Mobile breakpoint uses original value
- [ ] GSAP cleanup: `return () => ctx.revert()`
- [ ] Content verbatim, including typos and special chars
