#!/usr/bin/env bash
# verify-build.sh — Run TypeScript + Next.js build checks
# Usage: bash scripts/verify-build.sh [project-dir]
#
# Checks:
#   1. TypeScript compilation (tsc --noEmit)
#   2. Next.js build (next build)
#   3. Dead imports detection
#   4. Missing CSS sections vs components

set -euo pipefail

PROJECT="${1:-.}"
cd "$PROJECT"

PASS=0
FAIL=0
WARNINGS=0

echo "=============================================="
echo "  BUILD VERIFICATION"
echo "=============================================="

# 1. TypeScript check
echo -e "\n--- TypeScript Compilation ---"
if npx tsc --noEmit 2>&1; then
  echo "  PASS: TypeScript clean"
  ((PASS++))
else
  echo "  FAIL: TypeScript errors found"
  ((FAIL++))
fi

# 2. Next.js build
echo -e "\n--- Next.js Build ---"
if npm run build 2>&1 | tail -20; then
  echo "  PASS: Next.js build succeeded"
  ((PASS++))
else
  echo "  FAIL: Next.js build failed"
  ((FAIL++))
fi

# 3. Dead imports check
echo -e "\n--- Dead Import Check ---"
DEAD_IMPORTS=0
for TSX in $(find components app -name "*.tsx" -o -name "*.ts" 2>/dev/null); do
  # Check if imported modules exist
  while IFS= read -r line; do
    IMPORT_PATH=$(echo "$line" | grep -oP 'from\s+["\x27]([^"\x27]+)' | sed 's/from\s*["\x27]//')
    if [ -n "$IMPORT_PATH" ] && [[ "$IMPORT_PATH" == @/* ]]; then
      # Convert @/ to relative
      LOCAL="${IMPORT_PATH/@\//}"
      if [ ! -f "$LOCAL.ts" ] && [ ! -f "$LOCAL.tsx" ] && [ ! -f "$LOCAL/index.ts" ] && [ ! -f "$LOCAL/index.tsx" ]; then
        echo "  WARNING: $TSX imports missing module: $IMPORT_PATH"
        ((DEAD_IMPORTS++))
      fi
    fi
  done < <(grep "^import" "$TSX" 2>/dev/null || true)
done

if [ "$DEAD_IMPORTS" -eq 0 ]; then
  echo "  PASS: No dead imports found"
  ((PASS++))
else
  echo "  WARNING: $DEAD_IMPORTS dead import(s) found"
  ((WARNINGS++))
fi

# 4. CSS section coverage
echo -e "\n--- CSS Section Coverage ---"
if [ -f "app/globals.css" ]; then
  CSS_SECTIONS=$(grep -c '=== SECTION' app/globals.css 2>/dev/null || echo 0)
  COMPONENT_FILES=$(ls -1 components/sections/*.tsx 2>/dev/null | wc -l | tr -d ' ')

  echo "  CSS section headers: $CSS_SECTIONS"
  echo "  Section components: $COMPONENT_FILES"

  if [ "$CSS_SECTIONS" -ge "$COMPONENT_FILES" ]; then
    echo "  PASS: CSS covers all sections"
    ((PASS++))
  else
    echo "  WARNING: Fewer CSS sections than components (${CSS_SECTIONS} < ${COMPONENT_FILES})"
    ((WARNINGS++))
  fi
else
  echo "  WARNING: globals.css not found"
  ((WARNINGS++))
fi

# 5. GSAP cleanup check
echo -e "\n--- GSAP Cleanup Check ---"
GSAP_EFFECTS=$(grep -rl "useEffect" components/sections/*.tsx 2>/dev/null | wc -l | tr -d ' ')
GSAP_REVERTS=$(grep -rl "ctx.revert\|context.*revert" components/sections/*.tsx 2>/dev/null | wc -l | tr -d ' ')

echo "  Sections with useEffect: $GSAP_EFFECTS"
echo "  Sections with GSAP cleanup: $GSAP_REVERTS"

if [ "$GSAP_REVERTS" -ge "$GSAP_EFFECTS" ] || [ "$GSAP_EFFECTS" -eq 0 ]; then
  echo "  PASS: All GSAP effects cleaned up"
  ((PASS++))
else
  echo "  WARNING: Some effects may lack cleanup ($GSAP_EFFECTS effects, $GSAP_REVERTS cleanups)"
  ((WARNINGS++))
fi

# Summary
echo ""
echo "=============================================="
echo "  RESULTS: $PASS passed, $FAIL failed, $WARNINGS warnings"
echo "=============================================="

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
