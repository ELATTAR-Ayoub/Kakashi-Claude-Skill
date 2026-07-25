#!/usr/bin/env bash
# fetch-page.sh — Download and prettify a webpage's HTML
# Usage: bash scripts/fetch-page.sh <URL> [output-dir]
#
# Saves:
#   reference/clone.html       — raw HTML
#   reference/raw-pretty.html  — prettified for searching

set -euo pipefail

URL="${1:?Usage: fetch-page.sh <URL> [output-dir]}"
OUT_DIR="${2:-reference}"

mkdir -p "$OUT_DIR"

RAW="$OUT_DIR/clone.html"
PRETTY="$OUT_DIR/raw-pretty.html"

echo "Fetching: $URL"
curl -sL \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
  -H "Accept-Language: en-US,en;q=0.5" \
  --compressed \
  -o "$RAW" \
  "$URL"

FILE_SIZE=$(wc -c < "$RAW" | tr -d ' ')
echo "Saved raw HTML: $RAW ($FILE_SIZE bytes)"

# Prettify — try npx prettier first, fall back to python, then sed
if command -v npx &>/dev/null && npx --yes prettier --version &>/dev/null 2>&1; then
  npx --yes prettier --parser html --print-width 120 "$RAW" > "$PRETTY" 2>/dev/null || cp "$RAW" "$PRETTY"
elif command -v python3 &>/dev/null; then
  python3 -c "
import html.parser, re, sys
raw = open(sys.argv[1], encoding='utf-8', errors='replace').read()
# Simple indent-based prettifier
indent = 0
out = []
for line in re.split(r'(</?\w[^>]*>)', raw):
    line = line.strip()
    if not line: continue
    if line.startswith('</'):
        indent = max(0, indent - 1)
    out.append('  ' * indent + line)
    if line.startswith('<') and not line.startswith('</') and not line.endswith('/>') and not any(line.startswith(f'<{t}') for t in ['br','hr','img','input','meta','link']):
        indent += 1
open(sys.argv[2], 'w', encoding='utf-8').write('\n'.join(out))
" "$RAW" "$PRETTY"
else
  # Fallback: basic newline insertion
  sed 's/></>\n</g' "$RAW" > "$PRETTY"
fi

PRETTY_SIZE=$(wc -c < "$PRETTY" | tr -d ' ')
echo "Saved prettified HTML: $PRETTY ($PRETTY_SIZE bytes)"

# Quick stats
echo ""
echo "=== Page Stats ==="
echo "Title: $(grep -oP '<title[^>]*>\K[^<]+' "$RAW" | head -1 || echo 'N/A')"
echo "Scripts: $(grep -c '<script' "$RAW" || echo 0)"
echo "Stylesheets: $(grep -c '<link[^>]*stylesheet' "$RAW" || echo 0)"
echo "Inline styles: $(grep -c '<style' "$RAW" || echo 0)"
echo "Images: $(grep -c '<img' "$RAW" || echo 0)"
echo "Videos: $(grep -c '<video' "$RAW" || echo 0)"
echo "Canvas: $(grep -c '<canvas' "$RAW" || echo 0)"
