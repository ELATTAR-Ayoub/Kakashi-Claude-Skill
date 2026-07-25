#!/usr/bin/env python3
"""
download-assets.py, Parse HTML and download all external assets.

Usage: python3 scripts/download-assets.py reference/clone.html [base-url]

Downloads:
  downloaded_assets/css/   , External stylesheets
  downloaded_assets/js/    , JS bundles (sorted by size for animation searching)
  public/fonts/            , Font files (woff2, woff, ttf, otf)
  public/assets/           , Images, videos, Lottie files
  public/                  , Favicon, OG images
"""

import os
import re
import sys
import json
import urllib.request
import urllib.parse
import ssl
from pathlib import Path
from html.parser import HTMLParser

# Skip SSL verification for development
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch(url, dest):
    """Download a URL to a local file. Returns True on success."""
    try:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "*/*",
        })
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            data = resp.read()
        with open(dest, "wb") as f:
            f.write(data)
        size = len(data)
        unit = "KB" if size < 1_000_000 else "MB"
        val = size / 1000 if size < 1_000_000 else size / 1_000_000
        print(f"  OK  {val:.1f}{unit}  {os.path.basename(dest)}  ← {url[:80]}")
        return True
    except Exception as e:
        print(f"  FAIL  {os.path.basename(dest)}  ← {url[:80]}  ({e})")
        return False


def resolve_url(href, base_url):
    """Resolve a relative URL against a base URL."""
    if not href or href.startswith("data:"):
        return None
    if href.startswith("//"):
        return "https:" + href
    if href.startswith("/"):
        parsed = urllib.parse.urlparse(base_url)
        return f"{parsed.scheme}://{parsed.netloc}{href}"
    if href.startswith("http"):
        return href
    return urllib.parse.urljoin(base_url, href)


class AssetParser(HTMLParser):
    """Extract asset URLs from HTML."""
    def __init__(self):
        super().__init__()
        self.scripts = []
        self.stylesheets = []
        self.images = []
        self.videos = []
        self.favicons = []
        self.og_images = []
        self.inline_styles = []
        self._in_style = False
        self._style_buf = ""

    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == "script" and d.get("src"):
            self.scripts.append(d["src"])
        elif tag == "link":
            rel = d.get("rel", "")
            href = d.get("href", "")
            if "stylesheet" in rel and href:
                self.stylesheets.append(href)
            elif "icon" in rel and href:
                self.favicons.append(href)
        elif tag == "img" and d.get("src"):
            self.images.append(d["src"])
            if d.get("srcset"):
                for part in d["srcset"].split(","):
                    url = part.strip().split()[0]
                    if url:
                        self.images.append(url)
        elif tag == "video":
            if d.get("src"):
                self.videos.append(d["src"])
        elif tag == "source" and d.get("src"):
            self.videos.append(d["src"])
        elif tag == "meta":
            prop = d.get("property", "")
            if "og:image" in prop and d.get("content"):
                self.og_images.append(d["content"])
        elif tag == "style":
            self._in_style = True
            self._style_buf = ""

    def handle_data(self, data):
        if self._in_style:
            self._style_buf += data

    def handle_endtag(self, tag):
        if tag == "style" and self._in_style:
            self._in_style = False
            self.inline_styles.append(self._style_buf)


def extract_font_urls(css_text, base_url):
    """Extract @font-face src URLs from CSS."""
    urls = []
    for match in re.finditer(r'url\(["\']?([^"\')\s]+)["\']?\)', css_text):
        url = match.group(1)
        if any(url.endswith(ext) for ext in [".woff2", ".woff", ".ttf", ".otf", ".eot"]):
            resolved = resolve_url(url, base_url)
            if resolved:
                urls.append(resolved)
    return urls


def extract_bg_image_urls(css_text, base_url):
    """Extract background-image URLs from CSS."""
    urls = []
    for match in re.finditer(r'url\(["\']?([^"\')\s]+\.(png|jpg|jpeg|gif|svg|webp|avif))["\']?\)', css_text, re.I):
        resolved = resolve_url(match.group(1), base_url)
        if resolved:
            urls.append(resolved)
    return urls


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 download-assets.py <html-file> [base-url]")
        sys.exit(1)

    html_file = sys.argv[1]
    base_url = sys.argv[2] if len(sys.argv) > 2 else ""

    with open(html_file, encoding="utf-8", errors="replace") as f:
        html = f.read()

    # Auto-detect base URL from HTML if not provided
    if not base_url:
        base_match = re.search(r'<base\s+href=["\']([^"\']+)', html)
        if base_match:
            base_url = base_match.group(1)
        else:
            # Try to find it from canonical or og:url
            canon = re.search(r'<link[^>]+canonical[^>]+href=["\']([^"\']+)', html)
            og = re.search(r'<meta[^>]+og:url[^>]+content=["\']([^"\']+)', html)
            base_url = (canon or og or type("", (), {"group": lambda s, n: ""})()).group(1)
            if not base_url:
                print("WARNING: No base URL found. Relative paths may not resolve.")
                print("         Re-run with: python3 download-assets.py <html> <base-url>")

    # Parse HTML
    parser = AssetParser()
    parser.feed(html)

    manifest = {
        "base_url": base_url,
        "css": [], "js": [], "fonts": [], "images": [], "videos": [],
        "favicons": [], "og_images": [],
    }

    # === CSS ===
    print("\n=== Downloading CSS ===")
    all_css_text = "\n".join(parser.inline_styles)
    for i, href in enumerate(parser.stylesheets):
        url = resolve_url(href, base_url)
        if not url:
            continue
        fname = f"style-{i}.css" if "/" not in href.split("?")[0].split("/")[-1] else href.split("?")[0].split("/")[-1]
        dest = f"downloaded_assets/css/{fname}"
        if fetch(url, dest):
            manifest["css"].append({"url": url, "local": dest})
            with open(dest, encoding="utf-8", errors="replace") as f:
                all_css_text += "\n" + f.read()

    # Save inline styles
    if parser.inline_styles:
        inline_dest = "downloaded_assets/css/inline-styles.css"
        os.makedirs(os.path.dirname(inline_dest), exist_ok=True)
        with open(inline_dest, "w", encoding="utf-8") as f:
            f.write("\n\n/* === INLINE STYLE BLOCK === */\n\n".join(parser.inline_styles))
        print(f"  Saved {len(parser.inline_styles)} inline style blocks → {inline_dest}")

    # === JS ===
    print("\n=== Downloading JS ===")
    for href in parser.scripts:
        url = resolve_url(href, base_url)
        if not url:
            continue
        fname = href.split("?")[0].split("/")[-1]
        if not fname.endswith(".js"):
            fname += ".js"
        dest = f"downloaded_assets/js/{fname}"
        if fetch(url, dest):
            manifest["js"].append({"url": url, "local": dest, "size": os.path.getsize(dest)})

    # Sort JS by size (largest first: most likely to contain animations)
    manifest["js"].sort(key=lambda x: x.get("size", 0), reverse=True)
    if manifest["js"]:
        print(f"\n  Largest JS bundle: {manifest['js'][0]['local']} ({manifest['js'][0]['size']//1000}KB)")

    # === Fonts ===
    print("\n=== Downloading Fonts ===")
    font_urls = extract_font_urls(all_css_text, base_url)
    seen_fonts = set()
    for url in font_urls:
        if url in seen_fonts:
            continue
        seen_fonts.add(url)
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/fonts/{fname}"
        if fetch(url, dest):
            manifest["fonts"].append({"url": url, "local": dest})

    # === Images ===
    print("\n=== Downloading Images ===")
    seen_imgs = set()
    for href in parser.images:
        url = resolve_url(href, base_url)
        if not url or url in seen_imgs:
            continue
        seen_imgs.add(url)
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/assets/{fname}"
        if fetch(url, dest):
            manifest["images"].append({"url": url, "local": dest})

    # CSS background images
    for url in extract_bg_image_urls(all_css_text, base_url):
        if url in seen_imgs:
            continue
        seen_imgs.add(url)
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/assets/{fname}"
        if fetch(url, dest):
            manifest["images"].append({"url": url, "local": dest})

    # === Videos ===
    print("\n=== Downloading Videos ===")
    for href in parser.videos:
        url = resolve_url(href, base_url)
        if not url:
            continue
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/assets/{fname}"
        if fetch(url, dest):
            manifest["videos"].append({"url": url, "local": dest})

    # === Favicons + OG ===
    print("\n=== Downloading Meta Assets ===")
    for href in parser.favicons:
        url = resolve_url(href, base_url)
        if not url:
            continue
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/{fname}"
        if fetch(url, dest):
            manifest["favicons"].append({"url": url, "local": dest})

    for href in parser.og_images:
        url = resolve_url(href, base_url)
        if not url:
            continue
        fname = url.split("?")[0].split("/")[-1]
        dest = f"public/{fname}"
        if fetch(url, dest):
            manifest["og_images"].append({"url": url, "local": dest})

    # === Summary ===
    manifest_path = "downloaded_assets/manifest.json"
    os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n=== Asset Download Complete ===")
    print(f"  CSS files:    {len(manifest['css'])}")
    print(f"  JS bundles:   {len(manifest['js'])}")
    print(f"  Fonts:        {len(manifest['fonts'])}")
    print(f"  Images:       {len(manifest['images'])}")
    print(f"  Videos:       {len(manifest['videos'])}")
    print(f"  Favicons:     {len(manifest['favicons'])}")
    print(f"  OG images:    {len(manifest['og_images'])}")
    print(f"  Manifest:     {manifest_path}")


if __name__ == "__main__":
    main()
