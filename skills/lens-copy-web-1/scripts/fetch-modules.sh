#!/bin/bash
# fetch-modules.sh
# Recursively download an ES-module graph, mirroring original paths under public/.
# Modern themes ship entry scripts that import hashed chunks
# (app.js -> import {g} from "./gsap.CH_iu5NA.js"); the entry scripts in the HTML
# are only the roots. This BFS-walks the relative import/export-from specifiers so
# the WHOLE engine lands locally, at the same paths so imports resolve unedited.
#
# Edit BASE and the initial `queue` to match your target, then run from the project
# root: bash scripts/fetch-modules.sh
#
# Windows/Git-Bash: MSYS rewrites leading-slash args into Windows paths. We export
# MSYS_NO_PATHCONV=1 to stop that mangling the resolved /wp-content/... paths.
set -uo pipefail
export MSYS_NO_PATHCONV=1

BASE="https://example.com"                 # <-- target origin
DEST="public"                              # mirror root
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36"

# Seed with the entry modules from the page's <script type="module"> tags:
queue=(
  "/wp-content/themes/<theme>/dist/js/app.js"
  # "/wp-content/themes/<theme>/dist/js/blocks/<name>/<name>.js"
)

declare -A seen
resolve() { python3 -c "import posixpath,sys; print(posixpath.normpath(posixpath.join(sys.argv[1], sys.argv[2])))" "$1" "$2"; }

while [ ${#queue[@]} -gt 0 ]; do
  path="${queue[0]}"; queue=("${queue[@]:1}")
  [ -n "${seen[$path]:-}" ] && continue
  seen[$path]=1
  out="$DEST$path"; mkdir -p "$(dirname "$out")"
  code=$(curl -s --compressed -o "$out" -w "%{http_code}" -H "User-Agent: $UA" -H "Referer: $BASE/" "$BASE$path")
  echo "$code  $path"
  dir="$(dirname "$path")"
  # Pull relative specifiers out of `import ... from "..."` / `export ... from "..."` / `import("...")`.
  for spec in $(grep -oE '(from|import)[[:space:]]*\(?[[:space:]]*["'"'"']\.[^"'"'"']*["'"'"']' "$out" 2>/dev/null \
                 | grep -oE '["'"'"']\.[^"'"'"']*["'"'"']' | tr -d "\"'"); do
    abs=$(resolve "$dir" "$spec")
    [ -z "${seen[$abs]:-}" ] && queue+=("$abs")
  done
done
echo "Done. Verify every line above is 200 — a single 404 chunk kills engine init."
