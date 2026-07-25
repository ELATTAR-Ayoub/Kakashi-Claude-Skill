# Phase 5: Verify the engine actually adopted the page

A clone that *builds* is not a clone that *runs*. Verify the original engine
adopted your DOM. Layer the checks from cheap to conclusive.

## 1. Build + asset resolution (cheap, do first)
- `npm run build` compiles clean (TypeScript included).
- Every script module AND every runtime returns **200** on the dev server
  including the recursively-discovered hashed chunks (GSAP core,
  ScrollTrigger/SplitText/MorphSVG, Lenis, the block engine, vendor/util chunks,
  text-reveal, video-handler, preload-helper) and any UMD runtime. A single 404
  here means the engine dies mid-init. Loop over the full list with curl `-o
  /dev/null -w "%{http_code}"`.

## 2. DOM markers present (cheap)
Confirm the rendered HTML carries the engine's hooks: the expected count of
`data-cid`+`data-js` blocks, the hero's `data-js-critical`, any `js-video-handler`
+ `data-src`, WebGL `data-us-*`, and exactly one of each single-instance element
the JS clones. Count occurrences with `grep -o ... | wc -l` (note: `grep -c`
counts matching *lines*, and SSR HTML is often one line, it will mislead you).

## 3. Engine adoption proven at runtime (conclusive)
Run the app and read live state via an eval/console in the page. The engine has
truly adopted the page when you can confirm, all at once:

```js
({
  htmlClasses: document.documentElement.className,         // expect the engine's state flags
  blockRegistry: Object.keys(window.blockRegistry || {}),   // expect all block types registered
  gsap: typeof window.gsap, scrollTrigger: typeof window.ScrollTrigger,
  splitText: typeof window.SplitText, lenis: typeof window.lenis, // libs loaded
  mounted: [...document.querySelectorAll('[data-cid]')].map(b =>
    b.dataset.cid + ':' + b.dataset.jsLoaded + '/' + b.dataset.jsMounted),
  introRan: document.querySelectorAll('.main_heading .line').length, // SplitText split it?
})
```

Signs of success:
- `<html>` carries the engine's state classes (e.g. `css-ready has-loaded lenis`
  and viewport flags like `invert-logo`), proof its bootstrap ran.
- `blockRegistry` lists every block; libs are `object`/`function`, not `undefined`.
- The above-the-fold/critical blocks show `loaded=true, mounted=true`; blocks
  further down show `loaded=true, mounted=false` until scrolled to. That split is
  **correct**: it proves lazy IntersectionObserver mounting, not a bug.
- An intro side-effect is visible (e.g. a heading split into multiple `.line`s).

## 4. The headless-screenshot caveat
Pages that animate every frame (WebGL backgrounds, a GSAP ticker driving Lenis)
never go idle, so a headless screenshot tool that waits for a "stable frame" will
time out, even though the page is perfectly healthy (`document.readyState ===
"complete"`, all images loaded). Do not report this as a failure. Either:
- prove health another way (the runtime eval above), and/or
- momentarily quiet the loops before capture (`gsap.ticker.lagSmoothing`, `lenis.stop()`,
  temporarily no-op `requestAnimationFrame`), then restore, though some capture
  tools still won't grab a continuously-compositing page, and that's a tool limit.
Be honest: if you couldn't capture a visual in this environment, say so and point
the user to `npm run dev` to see it themselves. Never claim a screenshot you
didn't actually take.

## Scope honesty (Phase 6 feeds on this)
Record what you did and didn't clone: homepage-only vs. all routes; static UI vs.
backend-coupled forms; dropped analytics/anti-bot/email-obfuscation scripts. And
always state the IP caveat, content, images, logos, and brand belong to the
original owner and must be replaced before any public/commercial use.
