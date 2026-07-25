#!/bin/bash
# Usage: bash verify-build.sh <project-root>
# Runs TypeScript check and Next.js build. Binary PASS/FAIL.

PROJECT_ROOT="${1:-.}"

echo ""
echo "=== verify-build ==="
echo ""

cd "$PROJECT_ROOT" || { echo "[FAIL] Cannot cd to $PROJECT_ROOT"; exit 1; }

# TypeScript check
echo "  Running: npx tsc --noEmit..."
TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
TSC_EXIT=$?

if [ $TSC_EXIT -eq 0 ]; then
  echo "  [PASS] TypeScript: no type errors"
else
  echo "  [FAIL] TypeScript: type errors found"
  echo "$TSC_OUTPUT" | head -30
  echo ""
fi

# Next.js build
echo "  Running: npx next build..."
BUILD_OUTPUT=$(npx next build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
  echo "  [PASS] Next.js build: success"
else
  echo "  [FAIL] Next.js build: failed"
  echo "$BUILD_OUTPUT" | tail -30
  echo ""
fi

echo ""
if [ $TSC_EXIT -eq 0 ] && [ $BUILD_EXIT -eq 0 ]; then
  echo "Result: PASS (2/2 checks passed)"
  exit 0
else
  PASSED=0
  [ $TSC_EXIT -eq 0 ] && PASSED=$((PASSED + 1))
  [ $BUILD_EXIT -eq 0 ] && PASSED=$((PASSED + 1))
  echo "Result: FAIL (${PASSED}/2 checks passed)"
  exit 1
fi
