#!/usr/bin/env python3
"""
detect-stack.py — Identify a website's tech stack from its HTML and JS bundles.

Usage: python3 scripts/detect-stack.py reference/clone.html [downloaded_assets/js/]

Outputs a structured report of:
  - Framework (Next.js, Nuxt, Gatsby, etc.)
  - Animation library (GSAP, Framer Motion, anime.js, etc.)
  - CSS approach (Tailwind, CSS Modules, styled-components)
  - Scroll library (Lenis, Locomotive, native)
  - 3D library (Three.js, R3F)
  - CMS indicators
"""

import os
import re
import sys
import json
from pathlib import Path


def check_html(html):
    """Detect tech from HTML markers."""
    findings = {}

    # Framework detection
    frameworks = [
        ("__nuxt", "Nuxt.js"),
        ("__next", "Next.js"),
        ("__gatsby", "Gatsby"),
        ("data-reactroot", "React (generic)"),
        ("data-react", "React (generic)"),
        ("ng-app", "Angular"),
        ("ng-version", "Angular"),
        ("data-svelte", "SvelteKit"),
        ("__sveltekit", "SvelteKit"),
        ("data-astro", "Astro"),
    ]
    for marker, name in frameworks:
        if marker in html:
            findings["framework"] = name
            break

    # CSS approach
    if "tailwind" in html.lower() or re.search(r'class="[^"]*\b(flex|grid|p-\d|m-\d|text-\w)', html):
        findings["css"] = "Tailwind CSS"
    elif "styled-components" in html or "sc-" in html:
        findings["css"] = "styled-components"
    elif re.search(r'class="[^"]*_[a-zA-Z]+_[a-z0-9]{5}', html):
        findings["css"] = "CSS Modules"

    # Scroll library
    if "data-lenis" in html or "lenis" in html.lower():
        findings["scroll"] = "Lenis"
    elif "data-scroll" in html or "locomotive" in html.lower():
        findings["scroll"] = "Locomotive Scroll"

    # 3D
    if "<canvas" in html:
        findings["3d_candidate"] = True

    # CMS
    cms_markers = [
        ("sanity", "Sanity"),
        ("contentful", "Contentful"),
        ("strapi", "Strapi"),
        ("prismic", "Prismic"),
        ("wordpress", "WordPress"),
        ("wp-content", "WordPress"),
    ]
    for marker, name in cms_markers:
        if marker in html.lower():
            findings["cms"] = name
            break

    return findings


def check_js_bundle(filepath):
    """Detect tech from a single JS bundle."""
    findings = {}
    try:
        with open(filepath, encoding="utf-8", errors="replace") as f:
            js = f.read()
    except:
        return findings

    size_kb = os.path.getsize(filepath) // 1000

    # Animation libraries
    anim_libs = []
    if re.search(r'\bgsap\b', js) or "ScrollTrigger" in js or "TweenMax" in js:
        anim_libs.append("GSAP")
        # Check for premium plugins
        if "ScrambleText" in js or "ScrambleTextPlugin" in js:
            anim_libs.append("GSAP ScrambleTextPlugin (premium)")
        if "SplitText" in js:
            anim_libs.append("GSAP SplitText (premium)")
        if "DrawSVG" in js:
            anim_libs.append("GSAP DrawSVGPlugin (premium)")
    if "framer-motion" in js or "motion." in js or "useAnimation" in js:
        anim_libs.append("Framer Motion")
    if re.search(r'\banime\(', js) or "animejs" in js:
        anim_libs.append("anime.js")
    if "AOS" in js or "data-aos" in js:
        anim_libs.append("AOS")
    if "ScrollMagic" in js:
        anim_libs.append("ScrollMagic")
    if "barba" in js:
        anim_libs.append("Barba.js")
    if anim_libs:
        findings["animation"] = anim_libs

    # 3D
    if "THREE" in js or "three" in js:
        findings["3d"] = "Three.js"
    if "@react-three" in js or "useFrame" in js:
        findings["3d"] = "React Three Fiber"

    # Lottie
    if "lottie" in js.lower() or "bodymovin" in js:
        findings["lottie"] = True

    # Scroll
    if "lenis" in js.lower():
        findings["scroll"] = "Lenis"
    elif "LocomotiveScroll" in js or "locomotive" in js:
        findings["scroll"] = "Locomotive Scroll"
    elif "smooth-scrollbar" in js:
        findings["scroll"] = "Smooth Scrollbar"

    # Framework (from JS)
    if "__nuxt" in js or "nuxtApp" in js:
        findings["framework"] = "Nuxt.js"
    elif "__next" in js or "NextRouter" in js:
        findings["framework"] = "Next.js"

    findings["_file"] = os.path.basename(filepath)
    findings["_size_kb"] = size_kb

    return findings


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 detect-stack.py <html-file> [js-directory]")
        sys.exit(1)

    html_file = sys.argv[1]
    js_dir = sys.argv[2] if len(sys.argv) > 2 else "downloaded_assets/js"

    with open(html_file, encoding="utf-8", errors="replace") as f:
        html = f.read()

    # HTML-based detection
    result = check_html(html)

    # JS-based detection
    js_findings = []
    if os.path.isdir(js_dir):
        js_files = sorted(Path(js_dir).glob("*.js"), key=lambda p: p.stat().st_size, reverse=True)
        for js_file in js_files[:20]:  # Check top 20 largest
            findings = check_js_bundle(str(js_file))
            if len(findings) > 2:  # More than just _file and _size
                js_findings.append(findings)

    # Merge JS findings
    all_anim = set()
    for f in js_findings:
        if "animation" in f:
            all_anim.update(f["animation"])
        for key in ["3d", "lottie", "scroll", "framework"]:
            if key in f and key not in result:
                result[key] = f[key]

    if all_anim:
        result["animation"] = sorted(all_anim)

    # Output
    print("\n" + "=" * 50)
    print("  TECH STACK REPORT")
    print("=" * 50)

    fields = [
        ("framework", "Framework"),
        ("animation", "Animation"),
        ("css", "CSS Approach"),
        ("scroll", "Scroll Library"),
        ("3d", "3D Library"),
        ("lottie", "Lottie"),
        ("cms", "CMS"),
    ]

    for key, label in fields:
        val = result.get(key)
        if val is None:
            continue
        if isinstance(val, list):
            val = ", ".join(val)
        elif isinstance(val, bool):
            val = "Yes" if val else "No"
        print(f"  {label:18s} {val}")

    if not any(k in result for k, _ in fields):
        print("  No specific tech detected. Site may use vanilla JS/CSS.")

    print()

    # JS bundle overview
    if js_findings:
        print("JS Bundles with detected patterns:")
        for f in js_findings[:5]:
            patterns = [k for k in f if not k.startswith("_")]
            if patterns:
                print(f"  {f['_file']} ({f['_size_kb']}KB): {', '.join(patterns)}")

    # Save structured output
    report_path = "downloaded_assets/tech-stack.json"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    clean_result = {k: v for k, v in result.items() if not k.startswith("_")}
    with open(report_path, "w") as f:
        json.dump(clean_result, f, indent=2)
    print(f"\nSaved to: {report_path}")


if __name__ == "__main__":
    main()
