# Animation Extraction Reference

## How to Find Animations in Any Website's JS Bundles

### Search Strategy
1. Find JS bundles — `downloaded_assets/js/*.js`
2. Sort by size — the largest bundle usually contains animation logic
3. Use `grep -oP` with context — extracts readable snippets from minified code
4. Use the automated script first: `bash scripts/search-animations.sh`

### Universal Grep Patterns

```bash
# GSAP
grep -oP '.{0,200}gsap\.(to|from|fromTo|set).{0,200}' bundle.js
grep -oP '.{0,200}ScrollTrigger.{0,200}scrub.{0,200}' bundle.js
grep -oP '.{0,200}timeline.{0,200}' bundle.js

# Framer Motion
grep -oP '.{0,200}motion\..{0,200}' bundle.js
grep -oP '.{0,200}useAnimation.{0,200}' bundle.js

# anime.js
grep -oP '.{0,200}anime\(.{0,200}' bundle.js

# Scramble text / character reveals
grep -oP '.{0,200}scramble.{0,200}chars.{0,200}' bundle.js
grep -oP '.{0,200}ScrambleText.{0,200}' bundle.js

# PixelReveal / grid reveals
grep -oP '.{0,300}PixelReveal.{0,300}' bundle.js

# Easing functions
grep -oP 'cubic-bezier\([^)]+\)' bundle.js

# IntersectionObserver triggers
grep -oP '.{0,200}IntersectionObserver.{0,200}' bundle.js

# Component names (Nuxt/Vue)
grep -oP '__name:"[^"]+"' bundle.js
```

### Library Detection Table

| Indicator in HTML/JS | Library |
|---------------------|---------|
| `gsap`, `TweenMax`, `TweenLite` | GSAP |
| `data-framer`, `framer-motion` | Framer Motion |
| `anime(`, `animejs` | anime.js |
| `data-scroll`, `locomotive` | Locomotive Scroll |
| `data-lenis`, `lenis` | Lenis |
| `three`, `THREE`, `<canvas>` + WebGL | Three.js |
| `lottie`, `bodymovin` | Lottie |
| `ScrollMagic` | ScrollMagic |
| `barba` | Barba.js (page transitions) |

---

## Common Animation Patterns

### 1. Scramble Text Reveal
Text appears character-by-character with random characters cycling before settling.

**Search for:** `ScrambleText`, `scramble`, `chars`, `v-headline`, `delimiter`

**Key params:** charset, speed/duration, delimiter (space=word, empty=char), stagger, trigger (usually IntersectionObserver)

**Implementation:** Use `useHeadlineReveal` from starter templates. GSAP ScrambleTextPlugin is premium — always build custom.

### 2. PixelReveal (Grid Dissolve)
Content starts covered by small squares that dissolve randomly.

**Search for:** `PixelReveal`, `pixel-grid`, `pixel`, `toggle`

**Key params:** grid size (usually `Math.ceil(width / 10)`), bg color (matches page), stagger `{ amount: duration, from: "random" }`, trigger (media load event)

**Implementation:** Use `PixelReveal` component + `VideoPlayer`. Each media gets its own instance.

### 3. Scroll Parallax
Background elements move at different speed than scroll.

```javascript
// GSAP
gsap.to(element, {
  yPercent: 50,
  scrollTrigger: { scrub: true, trigger: section, start: "top top", end: "bottom top" },
});

// Framer Motion
const { scrollYProgress } = useScroll({ target: ref });
const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
```

### 4. Media Scale Entrance
Image/video scales from 1.1 → 1 with optional fade.

```javascript
gsap.from(mediaWrapper, {
  scale: 1.1, opacity: 0, ease: "cubic.inOut", duration: 0.5, delay: 0.3,
});
```

### 5. Lines & Plus Markers
Border lines expand from center, corner + markers clip-reveal after.

- Horizontal: `left:50%, right:50%` → `left:0%, right:0%`
- Vertical: `height:0%` → `height:100%`
- Plus markers: `clipPath: inset(5px)` → `clipPath: none`

**Implementation:** Use `Lines` component from starter templates.

### 6. Header Scroll Hide/Show
Header hides on scroll down, reappears on scroll up.

```javascript
const threshold = window.innerHeight * 0.2;
// Down past 20vh → add "scrolling" class → CSS translateY(-100%)
// Up → remove "scrolling" class
```

### 7. Nav Link Underline
Underline expands from left on hover via CSS `::after`.

```css
li::after {
  content: ""; position: absolute; bottom: 0; left: 0;
  height: 1px; width: 0; background-color: var(--accent);
  transition: width 0.55s cubic-bezier(.33,1,.68,1);
}
li:hover::after { width: 100%; }
```

### 8. Accordion Toggle
Plus icon becomes minus (vertical line rotates 90°), drawer height animates 0 → auto via GSAP.

### 9. Background Parallax with Brightness
Background image moves vertically, dimming as it passes center.

```javascript
const tl = gsap.timeline({
  scrollTrigger: { trigger: section, scrub: true, start: "top bottom", end: "bottom top" },
});
tl.fromTo(figure,
  { y: "-50vh", filter: "brightness(1)" },
  { y: 0, filter: "brightness(0.6)", ease: "none", duration: 1 }
);
tl.to(figure, { y: "50vh", ease: "none", duration: 1 });
```

---

## Easing Reference

| GSAP name | CSS equivalent | When used |
|-----------|---------------|-----------|
| `power2.out` | `cubic-bezier(.33, 1, .68, 1)` | Most transitions |
| `cubic.inOut` | `cubic-bezier(.65, 0, .35, 1)` | Media entrances, menu animations |
| `cubic.in` | `cubic-bezier(.32, 0, .67, 0)` | Line expansion |
| `none` / `linear` | `linear` | Scrub/parallax animations |
