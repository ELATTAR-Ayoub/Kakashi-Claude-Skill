#!/usr/bin/env python3
"""
extract-design-system.py, Extract colors, fonts, spacing, and breakpoints from CSS.

Usage: python3 scripts/extract-design-system.py downloaded_assets/css/

Reads all CSS files in the directory and outputs:
  - All unique colors (hex, rgb, hsl, oklch, custom properties)
  - All @font-face declarations with their font files
  - All font-size values used
  - All breakpoint values from @media queries
  - All CSS custom properties from :root
  - A draft globals.css snippet with extracted tokens

Output: downloaded_assets/design-system.json + stdout report
"""

import os
import re
import sys
import json
from collections import Counter, defaultdict
from pathlib import Path


def extract_colors(css):
    """Extract all color values from CSS."""
    colors = Counter()

    # Hex colors
    for m in re.finditer(r'#([0-9a-fA-F]{3,8})\b', css):
        hex_val = m.group(0).lower()
        # Normalize 3-char hex to 6-char
        if len(hex_val) == 4:
            hex_val = f"#{hex_val[1]*2}{hex_val[2]*2}{hex_val[3]*2}"
        colors[hex_val] += 1

    # rgb/rgba
    for m in re.finditer(r'rgba?\([^)]+\)', css):
        colors[m.group(0)] += 1

    # hsl/hsla
    for m in re.finditer(r'hsla?\([^)]+\)', css):
        colors[m.group(0)] += 1

    # oklch
    for m in re.finditer(r'oklch\([^)]+\)', css):
        colors[m.group(0)] += 1

    return colors


def extract_custom_properties(css):
    """Extract CSS custom properties from :root and other selectors."""
    props = {}

    # Match :root { ... } blocks
    for block in re.finditer(r':root\s*\{([^}]+)\}', css, re.DOTALL):
        for prop in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+)', block.group(1)):
            props[prop.group(1).strip()] = prop.group(2).strip()

    # Also catch custom properties defined anywhere
    for prop in re.finditer(r'(--[\w-]+)\s*:\s*([^;]+)', css):
        name = prop.group(1).strip()
        if name not in props:
            props[name] = prop.group(2).strip()

    return props


def extract_font_faces(css):
    """Extract @font-face declarations."""
    fonts = []
    for m in re.finditer(r'@font-face\s*\{([^}]+)\}', css, re.DOTALL):
        block = m.group(1)
        font = {}
        for prop in re.finditer(r'(font-family|font-weight|font-style|font-display|src)\s*:\s*([^;]+)', block):
            key = prop.group(1).strip()
            val = prop.group(2).strip()
            if key == "font-family":
                val = val.strip("'\"")
            font[key] = val
        if font.get("font-family"):
            fonts.append(font)
    return fonts


def extract_font_sizes(css):
    """Extract all unique font-size values."""
    sizes = Counter()
    for m in re.finditer(r'font-size\s*:\s*([^;]+)', css):
        val = m.group(1).strip()
        sizes[val] += 1
    return sizes


def extract_breakpoints(css):
    """Extract all @media query breakpoints."""
    breakpoints = Counter()
    for m in re.finditer(r'@media[^{]*\((?:max|min)-width\s*:\s*(\d+(?:\.\d+)?)(px|em|rem)', css):
        bp = f"{m.group(1)}{m.group(2)}"
        breakpoints[bp] += 1
    return breakpoints


def extract_spacing(css):
    """Extract common padding/margin/gap values."""
    spacing = Counter()
    for prop in ["padding", "margin", "gap", "row-gap", "column-gap",
                 "padding-top", "padding-right", "padding-bottom", "padding-left",
                 "margin-top", "margin-right", "margin-bottom", "margin-left"]:
        for m in re.finditer(rf'{prop}\s*:\s*([^;]+)', css):
            val = m.group(1).strip()
            # Skip shorthand with multiple values for individual extraction
            spacing[val] += 1
    return spacing


def generate_theme_snippet(colors, custom_props, fonts, breakpoints):
    """Generate a draft Tailwind v4 @theme block."""
    lines = []
    lines.append("/* === DRAFT THEME (adapt names to match site semantics) === */")
    lines.append("@theme inline {")

    # Colors: top 20 most used
    lines.append("  /* Colors (by frequency) */")
    for color, count in colors.most_common(20):
        safe_name = re.sub(r'[^a-z0-9]', '-', color.lower()).strip('-')
        lines.append(f"  --color-{safe_name}: {color}; /* used {count}x */")

    # Font families from @font-face
    seen_families = set()
    if fonts:
        lines.append("\n  /* Font families */")
        for f in fonts:
            family = f.get("font-family", "")
            if family and family not in seen_families:
                seen_families.add(family)
                safe = re.sub(r'[^a-z0-9]', '-', family.lower()).strip('-')
                lines.append(f"  --font-{safe}: '{family}', sans-serif;")

    lines.append("}")

    # Custom properties
    if custom_props:
        lines.append("\n:root {")
        for name, val in list(custom_props.items())[:30]:
            lines.append(f"  {name}: {val};")
        lines.append("}")

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 extract-design-system.py <css-directory-or-file>")
        sys.exit(1)

    target = sys.argv[1]

    # Read all CSS
    all_css = ""
    if os.path.isdir(target):
        for css_file in sorted(Path(target).rglob("*.css")):
            with open(css_file, encoding="utf-8", errors="replace") as f:
                all_css += f"\n/* === {css_file.name} === */\n" + f.read()
    elif os.path.isfile(target):
        with open(target, encoding="utf-8", errors="replace") as f:
            all_css = f.read()
    else:
        print(f"ERROR: {target} not found")
        sys.exit(1)

    if not all_css.strip():
        print("WARNING: No CSS content found")
        sys.exit(0)

    # Extract everything
    colors = extract_colors(all_css)
    custom_props = extract_custom_properties(all_css)
    fonts = extract_font_faces(all_css)
    font_sizes = extract_font_sizes(all_css)
    breakpoints = extract_breakpoints(all_css)
    spacing = extract_spacing(all_css)

    # Report
    print("\n" + "=" * 50)
    print("  DESIGN SYSTEM REPORT")
    print("=" * 50)

    print(f"\n--- Colors ({len(colors)} unique) ---")
    for color, count in colors.most_common(15):
        print(f"  {count:3d}x  {color}")

    print(f"\n--- Custom Properties ({len(custom_props)}) ---")
    for name, val in list(custom_props.items())[:15]:
        print(f"  {name}: {val}")
    if len(custom_props) > 15:
        print(f"  ... and {len(custom_props) - 15} more")

    print(f"\n--- Font Faces ({len(fonts)}) ---")
    for f in fonts:
        print(f"  {f.get('font-family', '?')} (weight: {f.get('font-weight', '?')})")

    print(f"\n--- Font Sizes ({len(font_sizes)} unique) ---")
    for size, count in font_sizes.most_common(15):
        print(f"  {count:3d}x  {size}")

    print(f"\n--- Breakpoints ({len(breakpoints)} unique) ---")
    for bp, count in breakpoints.most_common():
        print(f"  {count:3d}x  {bp}")

    print(f"\n--- Top Spacing Values ---")
    for val, count in spacing.most_common(10):
        print(f"  {count:3d}x  {val}")

    # Generate draft theme
    theme_snippet = generate_theme_snippet(colors, custom_props, fonts, breakpoints)

    # Save structured output
    result = {
        "colors": dict(colors.most_common(50)),
        "custom_properties": custom_props,
        "font_faces": fonts,
        "font_sizes": dict(font_sizes.most_common(30)),
        "breakpoints": dict(breakpoints.most_common()),
        "spacing_values": dict(spacing.most_common(20)),
        "theme_snippet": theme_snippet,
    }

    output_path = "downloaded_assets/design-system.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n--- Draft Theme Snippet ---")
    print(theme_snippet)
    print(f"\nFull report saved to: {output_path}")


if __name__ == "__main__":
    main()
