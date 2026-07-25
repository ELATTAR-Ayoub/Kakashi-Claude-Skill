# Phases 2–4: The DOM contract and engine adoption

This is the heart of the skill: make the DOM identical, then hand it to the
original engine. Below is the concrete contract and the traps that break it.

## What the engine reads (the contract)

A block engine typically does, on load:
1. `querySelectorAll("[data-js][data-cid]")` to find blocks.
2. For each, read `data-cid` as the registry key, look up
   `window.blockRegistry[cid]` (populated when that block's JS module executes).
3. Set `data-js-loaded` / `data-js-mounted` lifecycle attributes.
4. Mount "critical" blocks (`data-js-critical`) immediately; observe the rest with
   an `IntersectionObserver` and mount on approach (e.g. `rootMargin: "...200px"`).
5. Build inview reveal timelines from a config (e.g. opacity0/y20 → power2.out,
   stagger, "top 80%"), usually gated to desktop + no-reduced-motion.

So your rendered `<section>` for each block MUST carry, copied verbatim from source:
- `data-cid="<name>"` and a bare `data-js` attribute (in JSX: `data-js=""`, which
  yields `dataset.js === ""` → the engine's `!== undefined` check passes).
- `data-js-loaded="false"` and `data-js-mounted="false"` (the engine overwrites
  these, but include them for first-paint parity).
- `data-js-critical="true"` where the source had it (e.g. a hero).
- the exact `id="block_<hash>"`, the full class string, and any inline
  `style="--block-color-...; padding-top: clamp(...)"`.

Individual block modules query their own internals (e.g. `.hero_main`,
`.main_heading`, `.progress_bar`, `.js-video-handler`, `.marquee_collection`).
Read each module and make sure those selectors exist with the same names.

## Initial inline styles are not decoration: they are animation "from" states

The source often serves elements with `style="opacity:0"` /
`transform:translateY(-40px)`. The intro animations animate *from* these to the
resting state. SplitText-style code sets `el.style.opacity = 1` only *after*
splitting. If you strip these inline styles, content either pops in with no
animation or (worse) the splitter reveals nothing. **Reproduce every initial
inline style verbatim.**

## Traps that silently break adoption

- **Single-instance elements the JS clones.** A marquee module may render ONE
  `.marquee_collection` and clone it N times itself (`duplicate: 2`). If you
  pre-render 3 copies "to be safe", you get triple content. Emit exactly what the
  source HTML had and let the JS multiply it.
- **Don't make blocks client components with their own behavior.** If you build a
  React header with `useState` + `onClick` toggling, and the original `header.js`
  also toggles `data-navigation-status`, they double-fire. Emit static markup; let
  the module drive it.
- **Delete your stand-ins.** Any custom reveal-on-scroll, CSS marquee keyframes,
  manual `<video>` injection, or `css-ready` shim you wrote during an earlier
  reimplementation must go. The engine sets `css-ready`/`has-loaded`, injects the
  video via its `data-src` handler, etc. One owner per behavior.
- **React attribute quirks.** Bare boolean-ish attributes: use `data-js=""`. For
  custom-property inline styles in TS:
  `style={{ ["--block-color-background" as string]: "#f7f7f5" }}`.
- **Globals the modules expect.** Modules may reference bare `gsap`, `ScrollTrigger`,
  `SplitText`, `lenis`. The original `app.js` sets these on `window` and registers
  GSAP plugins at its top level, so you must load `app.js` too, not just the
  block modules. Shared chunks are deduped by URL, so importing the same gsap chunk
  from many modules yields one singleton; plugins registered in `app.js` are then
  visible everywhere.

## Injecting the engine (Phase 4)

Add a single client component that runs once after hydration and appends the
original scripts in the **same order the source `<head>`/`<body>` used**:

```tsx
"use client";
import { useEffect } from "react";
const DIST = "/wp-content/themes/<theme>/dist/js";
const MODULES = [ `${DIST}/app.js`, `${DIST}/blocks/header/header.js`, /* ...all blocks, source order... */ ];
export function ThemeScripts() {
  useEffect(() => {
    if (document.getElementById("cn-theme-app")) return;       // idempotent
    // any non-module runtime first (e.g. UnicornStudio), then the modules:
    MODULES.forEach((src, i) => {
      const s = document.createElement("script");
      if (i === 0) s.id = "cn-theme-app";
      s.type = "module"; s.src = src;
      document.body.appendChild(s);
    });
  }, []);
  return null;
}
```

Why after hydration: the modules mutate the DOM (SplitText wraps words, the engine
sets attributes). If they ran during SSR/hydration there'd be a mismatch. Inject
in `useEffect` and ensure your section components never re-render (no state), so
React never reconciles over the engine's mutations.

Static-export note: set `output: "export"` and serve the mirrored `public/` tree;
module `import` paths resolve against their own URL, so the mirrored paths just work.
