# Phase 1 — Capture the target

Goal: get the rendered HTML and a complete, locally-mirrored copy of every asset
the page loads, at the **same paths** the original uses.

## 1. Get past the WAF

Many real sites (especially WordPress behind Cloudflare/managed firewalls) return
a `403` to a bare `curl`. They fingerprint the request. Send a full browser
fingerprint instead — see `scripts/fetch.sh`. The essentials:

- A real `User-Agent` (current Chrome).
- `sec-ch-ua`, `sec-ch-ua-mobile`, `sec-ch-ua-platform`.
- `Sec-Fetch-Dest/Mode/Site/User` and `Upgrade-Insecure-Requests` for the document.
- `Accept`, `Accept-Language`, `Accept-Encoding`, and a `Referer` of the site root.
- `--compressed` so gzip/br is decoded.

If headers still fail, escalate: WebFetch (renders + extracts), then the Wayback
Machine (`http://archive.org/wayback/available?url=...` and the CDX index), then
a connected browser's `outerHTML`, then ask the user to paste DevTools HTML.

Save raw HTML as `reference/clone.html` and a prettified copy
(`npx prettier --parser html`) as `reference/raw-pretty.html` for searching.

## 2. Enumerate and download the asset graph

Pull every same-origin URL from the HTML: `href`/`src` plus every URL inside
`srcset` (multi-resolution images). Also pull `url(...)` references and
`@font-face` `src` paths out of the downloaded CSS.

Download into a `public/` tree that **mirrors the original absolute paths**. This
is the single most important capture detail: if the original markup says
`src="/wp-content/uploads/2025/10/hero.jpg"` and the original CSS says
`url(/wp-content/themes/x/dist/fonts/Font.woff2)`, those exact paths must resolve
from your `public/`. Then you never edit a single asset URL and the original
CSS/JS finds everything unchanged.

Categories to get: linked stylesheets, every inline `<style>` block (extract each
to its own file), JS bundles, fonts (woff2/woff/ttf), images + all srcset
variants, video/Lottie/WebGL scene JSON, favicons/OG images.

## 3. Download the JS MODULE GRAPH recursively

Modern themes ship ES modules that `import` hashed chunks
(`app.js` → `import {g} from "./gsap.CH_iu5NA.js"`). The entry scripts in the HTML
are only the roots. You must follow the imports transitively or the engine won't
load. `scripts/fetch-modules.sh` BFS-walks the graph: download a file, grep its
relative `import`/`export ... from` specifiers, resolve them against the file's
directory, enqueue, repeat. Mirror each at its original path under `public/`.

Watch out on Windows/Git-Bash: MSYS rewrites leading-slash paths into Windows
paths when passed to programs. Set `MSYS_NO_PATHCONV=1` for the fetch loop, or
resolve paths with `python -c posixpath.normpath(...)` and disable conversion.

## 4. Identify the architecture

From the HTML and JS, determine and write down:
- Framework (WordPress block theme? Next/Nuxt SPA? Webflow?). WordPress shows
  `wp-content/...` asset paths and `wp-*` body classes.
- The block convention: sections tagged `data-cid="<name>"` with matching
  `dist/css/blocks/<name>/` and `dist/js/blocks/<name>/` files is the giveaway of
  a per-block engine — ideal for adoption.
- Animation/scroll libs: grep the JS for `gsap`, `ScrollTrigger`, `SplitText`,
  `MorphSVG`, `lenis`, `lottie`, `IntersectionObserver`, `UnicornStudio`.
- How blocks bootstrap: usually an `app.js` that registers GSAP plugins, starts
  Lenis, and an engine module that queries `[data-js][data-cid]`, mounts critical
  blocks immediately and the rest via IntersectionObserver.

This inventory defines the DOM contract you must satisfy in Phases 2–3.
