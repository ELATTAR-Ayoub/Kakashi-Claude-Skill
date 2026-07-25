---
name: kakashi-fast
description: >-
  Clone a website into a Next.js + Tailwind + TypeScript project with TRUE 1:1
  fidelity by reproducing the source's byte-identical DOM and then running the
  site's OWN original CSS and JavaScript engine on it, instead of reimplementing
  the look and animations. Use this whenever the user wants a pixel-and-motion
  perfect replica of a site, an exact clone "with all the animations/states", to
  copy a landing page including its scroll effects, or says a previous clone
  "doesn't move/animate like the original." Especially use this for sites built
  on a component/block engine (WordPress block themes, GSAP/ScrollTrigger/Lenis
  sites, sites with per-block CSS+JS) where reimplementing motion from scratch
  would drift. Prefer this over hand-rebuilding animations whenever the original's
  own JS can be reused.
---

# Kakashi Fast: Clone a site by adopting its own engine

## The core idea (read this first)

Most clones drift from the original because the cloner *reimplements* the
animations and interactions. They get the layout right, then approximate the
motion, and approximations never quite match.

This skill does the opposite. **Reproduce the source's DOM exactly, then load the
site's own original CSS and JavaScript to drive it.** A modern site's animation
engine finds and animates elements by looking for specific markers in the
markup, class names, `data-*` attributes, ids, and the initial inline styles its
intros animate *from*. If your rendered HTML carries those exact markers, the
original engine can't tell it's not the original page. It "adopts" your DOM and
runs every animation, scroll effect, and state transition identically, because
it *is* the original code.

So the work is: **(1) make the DOM identical, (2) feed it the original styles and
scripts, (3) remove anything of yours that competes with them.** You are a
forger of structure, not a re-animator.

This is the highest-fidelity approach available and should be your default when
the site's own JS can be reused. Fall back to reimplementation (e.g. via the
`kakashi` skill) only when the original JS genuinely
cannot run standalone (heavily server-coupled SPAs, obfuscated anti-bot bundles).

## When NOT to use the engine-adoption approach

- The site's JS is inseparable from a live backend/API for *rendering* (not just
  forms). Then you can only clone the static output, use reimplementation.
- The user explicitly wants the animations rebuilt in React/Framer Motion (e.g.
  to own and modify them). Then reimplement; don't adopt.
- It's a trivial static page with no JS motion. Adoption is overkill; just port it.

## Workflow

Work through these phases in order. Keep a short `reference/PROGRESS.md` in the
output project so context survives compaction. Detailed how-to for each phase is
in the `references/` files, read the named file at the start of each phase.

### Phase 1: Capture (read `references/capture.md`)
1. Fetch the rendered HTML. Plain `curl` is often WAF-blocked (403); send a full
   browser fingerprint. Use `scripts/fetch.sh` (UA + `Sec-Fetch-*` headers).
2. Download the **entire** asset graph and mirror it at the **original paths**
   under `public/` (so `/wp-content/...` URLs in the HTML and CSS resolve
   verbatim). This includes CSS, fonts, images (with full srcsets), video, and
   crucially, the **JS module graph**, fetched recursively because ES modules
   import hashed chunks. Use `scripts/fetch-modules.sh`.
3. Identify the architecture: framework, animation libs (GSAP/ScrollTrigger/
   SplitText/MorphSVG, Lenis, Lottie), and the block convention (e.g. `data-cid`
   sections + per-block CSS/JS). This tells you what markers the engine needs.

### Phase 2: Map the DOM and the engine's contract (read `references/engine-adoption.md`)
For each section, record from the source HTML: the exact `<section>` attributes
(`data-cid`, `data-js`, `data-js-loaded/mounted`, `id`, classes), the inner DOM
nesting, and **every initial inline style** (these are the "from" states the
intros animate). Read the block JS modules to learn what selectors/attributes
each one queries and what it mutates, that is the contract your DOM must satisfy.

### Phase 3: Build the DOM as components
Scaffold Next.js (App Router, TS) + Tailwind v4. Write each section as a **pure
server component that emits the source DOM verbatim**: same classes, same
`data-*`, same inline styles. Do NOT add React state or your own animation logic.
Vendor the original CSS as `cn-*.css` files (verbatim) imported from
`globals.css`. Watch the subtle traps in `references/engine-adoption.md`
(single-instance elements the JS clones; attributes React renders oddly).

### Phase 4: Inject the original engine
Add one client component that, after hydration, injects the original script
modules (`<script type="module">`) in the **same order the source used**, plus any
runtime (e.g. UnicornStudio). Delete every React stand-in you might have written
(custom IntersectionObserver reveals, CSS marquees, manual video injection, a
`css-ready` shim), the original engine owns those now and duplicates cause
conflicts.

### Phase 5: Verify (read `references/verify.md`)
`npm run build` clean; every module + runtime serves 200; then confirm the engine
actually adopted the page via the running app: its state flags appear on `<html>`,
its block registry is populated, the animation libs are loaded, intros have run
(e.g. SplitText split a heading), and blocks lazy-mount on scroll. Note the
headless-screenshot caveat for continuously-animating pages.

### Phase 6: Disclose
State plainly what is 1:1 (structure/CSS/JS/animations), what was dropped
(backend-coupled forms, analytics, other pages if homepage-only), and the **IP
caveat**: the content, images, logos, and brand belong to the original owner and
must be replaced before any public use. Never imply the clone is publishable as-is.

## Guardrails
- **Every marker from the source.** Never invent class names or guess `data-*`
  values, copy them from the captured HTML.
- **Mirror asset paths exactly.** The original URLs must resolve unchanged, so the
  original CSS/JS finds its dependencies without edits.
- **Don't edit the vendored JS.** Run it as-is. If it needs a global (`window.gsap`,
  `lenis`), the original bootstrap sets that, load the bootstrap too.
- **One owner per behavior.** If the original engine drives a behavior, delete your
  version of it. Two systems animating the same element fight and flicker.
- **Be honest about verification.** If you can't capture a screenshot in a headless
  env (continuous rAF pages defeat the capture), say so and prove it another way
  (engine state via eval); don't claim a visual you didn't see.
