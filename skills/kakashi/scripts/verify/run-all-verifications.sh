#!/bin/bash
# Usage: bash run-all-verifications.sh <project-root> [--phase N]
#
# Expects these paths relative to project root:
#   reference/clone.html          — source HTML
#   downloaded_assets/             — source CSS files
#   components/sections/           — built TSX components
#   app/cn-*.css or app/globals.css — built CSS
#   public/                        — assets
#   downloaded_assets/js/ or public/js/ — JS bundles

set -e

PROJECT_ROOT="${1:-.}"
PHASE=""

# Parse --phase flag
shift
while [[ $# -gt 0 ]]; do
  case "$1" in
    --phase) PHASE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_HTML="$PROJECT_ROOT/reference/clone.html"
COMPONENTS_DIR="$PROJECT_ROOT/components/sections"

# Find source CSS (first .css in downloaded_assets/)
SOURCE_CSS=$(find "$PROJECT_ROOT/downloaded_assets" -name "*.css" -type f 2>/dev/null | head -1)

# Find clone CSS (cn-*.css or globals.css)
CLONE_CSS=$(find "$PROJECT_ROOT/app" -name "cn-*.css" -type f 2>/dev/null | head -1)
if [ -z "$CLONE_CSS" ]; then
  CLONE_CSS="$PROJECT_ROOT/app/globals.css"
fi

# Find JS bundles directory
JS_DIR="$PROJECT_ROOT/downloaded_assets/js"
if [ ! -d "$JS_DIR" ]; then
  JS_DIR="$PROJECT_ROOT/public/js"
fi
if [ ! -d "$JS_DIR" ]; then
  JS_DIR="$PROJECT_ROOT/downloaded_assets"
fi

echo "============================================"
echo "  KAKASHI VERIFICATION SUITE"
echo "============================================"
echo ""
echo "  Project:     $PROJECT_ROOT"
echo "  Source HTML:  $SOURCE_HTML"
echo "  Source CSS:   $SOURCE_CSS"
echo "  Clone CSS:   $CLONE_CSS"
echo "  Components:  $COMPONENTS_DIR"
echo "  JS Bundles:  $JS_DIR"
echo "  Phase filter: ${PHASE:-all}"
echo ""
echo "============================================"

TOTAL=0
PASSED=0
FAILED=0
SKIPPED=0

run_script() {
  local name="$1"
  local phases="$2"
  shift 2
  local cmd=("$@")

  # Phase filter
  if [ -n "$PHASE" ]; then
    if ! echo "$phases" | grep -q "$PHASE"; then
      echo "  [SKIP] $name (not in phase $PHASE)"
      SKIPPED=$((SKIPPED + 1))
      return
    fi
  fi

  TOTAL=$((TOTAL + 1))

  # Check required files exist
  for arg in "${cmd[@]}"; do
    if [[ "$arg" == *.html || "$arg" == *.css ]]; then
      if [ ! -f "$arg" ]; then
        echo "  [SKIP] $name — required file not found: $arg"
        SKIPPED=$((SKIPPED + 1))
        TOTAL=$((TOTAL - 1))
        return
      fi
    fi
    if [[ "$arg" != *.* && "$arg" != node && "$arg" != bash ]]; then
      if [ -d "$arg" ] || [ -f "$arg" ]; then
        continue
      fi
    fi
  done

  # Run the script
  if "${cmd[@]}" > /dev/null 2>&1; then
    PASSED=$((PASSED + 1))
    echo "  [PASS] $name"
  else
    FAILED=$((FAILED + 1))
    echo "  [FAIL] $name"
    # Re-run to show output
    "${cmd[@]}" 2>&1 | grep -E "^\s*\[FAIL\]" | head -5
  fi
}

echo ""
echo "--- Content & Structure ---"
run_script "verify-content"    "4 5" node "$SCRIPT_DIR/verify-content.js"    "$SOURCE_HTML" "$COMPONENTS_DIR"
run_script "verify-structure"  "4 5" node "$SCRIPT_DIR/verify-structure.js"  "$SOURCE_HTML" "$COMPONENTS_DIR"
run_script "verify-classnames" "4 5" node "$SCRIPT_DIR/verify-classnames.js" "$SOURCE_HTML" "$COMPONENTS_DIR"
run_script "verify-sections"   "4 5" node "$SCRIPT_DIR/verify-sections.js"   "$SOURCE_HTML" "$COMPONENTS_DIR"

echo ""
echo "--- CSS ---"
run_script "verify-css-rules"  "2 4 5" node "$SCRIPT_DIR/verify-css-rules.js"  "$SOURCE_CSS" "$CLONE_CSS"
run_script "verify-colors"     "2 5"   node "$SCRIPT_DIR/verify-colors.js"     "$SOURCE_CSS" "$CLONE_CSS"
run_script "verify-typography" "2 5"   node "$SCRIPT_DIR/verify-typography.js"  "$SOURCE_CSS" "$CLONE_CSS"
run_script "verify-spacing"    "2 5"   node "$SCRIPT_DIR/verify-spacing.js"    "$SOURCE_CSS" "$CLONE_CSS"
run_script "verify-breakpoints" "2 5"  node "$SCRIPT_DIR/verify-breakpoints.js" "$SOURCE_CSS" "$CLONE_CSS"
run_script "verify-keyframes"  "3 5"   node "$SCRIPT_DIR/verify-keyframes.js"  "$SOURCE_CSS" "$CLONE_CSS"

echo ""
echo "--- Assets ---"
run_script "verify-assets"     "1 5" node "$SCRIPT_DIR/verify-assets.js" "$PROJECT_ROOT"
run_script "verify-fonts"      "1 2 5" node "$SCRIPT_DIR/verify-fonts.js" "$SOURCE_CSS" "$CLONE_CSS" "$PROJECT_ROOT"

echo ""
echo "--- Animations ---"
run_script "verify-animations" "3 5" node "$SCRIPT_DIR/verify-animations.js" "$JS_DIR" "$COMPONENTS_DIR" "$CLONE_CSS"

echo ""
echo "--- Build ---"
run_script "verify-build"      "4 5" bash "$SCRIPT_DIR/verify-build.sh" "$PROJECT_ROOT"

echo ""
echo "============================================"
echo "  SUMMARY: ${PASSED}/${TOTAL} PASS, ${FAILED} FAIL, ${SKIPPED} SKIP"
echo "============================================"

if [ $FAILED -gt 0 ]; then
  exit 1
else
  exit 0
fi
