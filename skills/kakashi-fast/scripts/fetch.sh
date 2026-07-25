#!/bin/bash
# fetch.sh <url> <outfile>
# Download a single URL with a full Chrome browser fingerprint. Many real sites
# (WordPress behind Cloudflare/managed WAFs) return 403 to a bare curl; the
# header set below makes the request look like a real Chrome navigation/fetch.
# Usage: bash scripts/fetch.sh "https://site.com/asset.css" "downloaded_assets/asset.css"
set -euo pipefail
URL="$1"; OUT="$2"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"
mkdir -p "$(dirname "$OUT")"
curl -s --compressed -o "$OUT" -w "%{http_code}  $URL -> $OUT\n" "$URL" \
  -H "User-Agent: $UA" \
  -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Accept-Encoding: gzip, deflate, br" \
  -H "Referer: $(printf '%s' "$URL" | sed -E 's#(https?://[^/]+).*#\1/#')" \
  -H "sec-ch-ua: \"Google Chrome\";v=\"137\", \"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"" \
  -H "sec-ch-ua-mobile: ?0" \
  -H "sec-ch-ua-platform: \"Windows\"" \
  -H "Sec-Fetch-Dest: document" \
  -H "Sec-Fetch-Mode: navigate" \
  -H "Sec-Fetch-Site: none" \
  -H "Sec-Fetch-User: ?1" \
  -H "Upgrade-Insecure-Requests: 1"
