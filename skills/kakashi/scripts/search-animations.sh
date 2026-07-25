#!/usr/bin/env bash
# search-animations.sh: Search JS bundles for animation patterns
# Usage: bash scripts/search-animations.sh [js-directory]
#
# Searches for GSAP, Framer Motion, anime.js, ScrollTrigger,
# IntersectionObserver, easing functions, and custom animation patterns.
# Outputs structured findings per bundle.

set -euo pipefail

JS_DIR="${1:-downloaded_assets/js}"

if [ ! -d "$JS_DIR" ]; then
  echo "ERROR: Directory $JS_DIR not found"
  echo "Run download-assets.py first to fetch JS bundles."
  exit 1
fi

echo "=============================================="
echo "  ANIMATION SEARCH REPORT"
echo "=============================================="

# Sort by file size (largest first: most likely to contain animations)
FILES=$(ls -S "$JS_DIR"/*.js 2>/dev/null || true)

if [ -z "$FILES" ]; then
  echo "No .js files found in $JS_DIR"
  exit 0
fi

for BUNDLE in $FILES; do
  FNAME=$(basename "$BUNDLE")
  SIZE=$(wc -c < "$BUNDLE" | tr -d ' ')
  SIZE_KB=$((SIZE / 1000))

  FOUND=0

  # GSAP
  GSAP_COUNT=$(grep -coP '\bgsap\b' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$GSAP_COUNT" -gt 0 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  GSAP: $GSAP_COUNT references"

    # GSAP methods
    echo "  GSAP methods:"
    grep -oP 'gsap\.(to|from|fromTo|set|timeline|registerPlugin|matchMedia)\b' "$BUNDLE" 2>/dev/null | sort | uniq -c | sort -rn | head -10 | sed 's/^/    /'

    # ScrollTrigger
    ST_COUNT=$(grep -coP 'ScrollTrigger' "$BUNDLE" 2>/dev/null || echo 0)
    if [ "$ST_COUNT" -gt 0 ]; then
      echo "  ScrollTrigger: $ST_COUNT references"
      # Extract scrub/pin patterns
      grep -oP '.{0,80}(scrub|pin)[\s:].{0,80}' "$BUNDLE" 2>/dev/null | head -5 | sed 's/^/    /'
    fi

    # ScrambleText (premium plugin)
    if grep -qP 'ScrambleText|scrambleText' "$BUNDLE" 2>/dev/null; then
      echo "  ⚠️  ScrambleText plugin detected (premium, use custom useHeadlineReveal)"
    fi

    # SplitText (premium plugin)
    if grep -qP 'SplitText|splitText' "$BUNDLE" 2>/dev/null; then
      echo "  ⚠️  SplitText plugin detected (premium)"
    fi
  fi

  # Framer Motion
  FM_COUNT=$(grep -coP 'framer-motion|useAnimation|motion\.' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$FM_COUNT" -gt 0 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Framer Motion: $FM_COUNT references"
  fi

  # anime.js
  ANIME_COUNT=$(grep -coP '\banime\(' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$ANIME_COUNT" -gt 0 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  anime.js: $ANIME_COUNT references"
  fi

  # Easing functions
  EASING=$(grep -oP 'cubic-bezier\([^)]+\)' "$BUNDLE" 2>/dev/null | sort -u)
  if [ -n "$EASING" ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Easing functions:"
    echo "$EASING" | head -10 | sed 's/^/    /'
  fi

  # IntersectionObserver
  IO_COUNT=$(grep -coP 'IntersectionObserver' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$IO_COUNT" -gt 0 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  IntersectionObserver: $IO_COUNT references"
    # Check for rootMargin values
    grep -oP 'rootMargin["\s:]+["\s]*[^"]+' "$BUNDLE" 2>/dev/null | head -3 | sed 's/^/    /'
  fi

  # Scramble/character animation patterns
  SCRAMBLE=$(grep -coP 'scramble|chars.*split|textContent.*random|charSet' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$SCRAMBLE" -gt 0 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Text scramble patterns: $SCRAMBLE references"
    # Try to extract charset
    grep -oP '.{0,20}chars.{0,100}' "$BUNDLE" 2>/dev/null | head -3 | sed 's/^/    /'
  fi

  # PixelReveal / grid patterns
  PIXEL=$(grep -coP 'pixel|grid.*reveal|toggle.*pixel' "$BUNDLE" 2>/dev/null || echo 0)
  if [ "$PIXEL" -gt 2 ]; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Pixel/grid reveal patterns: $PIXEL references"
  fi

  # Lottie
  if grep -qP 'lottie|bodymovin|dotlottie' "$BUNDLE" 2>/dev/null; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Lottie animation detected"
  fi

  # Three.js / WebGL
  if grep -qP '\bTHREE\b|three\.module|useFrame|@react-three' "$BUNDLE" 2>/dev/null; then
    [ $FOUND -eq 0 ] && echo -e "\n--- $FNAME (${SIZE_KB}KB) ---"
    FOUND=1
    echo "  Three.js / WebGL detected"
  fi

done

echo ""
echo "=============================================="
echo "  SUMMARY"
echo "=============================================="

# Overall counts across all bundles
ALL_JS="$JS_DIR/*.js"
echo "Total JS bundles: $(ls -1 $ALL_JS 2>/dev/null | wc -l | tr -d ' ')"
echo "Total size: $(du -sh "$JS_DIR" 2>/dev/null | cut -f1)"

for PATTERN in "gsap" "ScrollTrigger" "framer-motion" "anime\(" "IntersectionObserver" "lottie" "THREE"; do
  COUNT=$(grep -rl "$PATTERN" $ALL_JS 2>/dev/null | wc -l | tr -d ' ')
  if [ "$COUNT" -gt 0 ]; then
    echo "  $PATTERN: found in $COUNT bundle(s)"
  fi
done
