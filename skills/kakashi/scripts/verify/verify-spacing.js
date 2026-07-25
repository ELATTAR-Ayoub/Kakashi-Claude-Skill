const { extractSpacing } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-spacing.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceSpacing = extractSpacing(sourceCSS);
const cloneSpacing = extractSpacing(cloneCSS);

const cloneLookup = {};
for (const s of cloneSpacing) {
  const key = s.media ? `${s.media} | ${s.selector}` : s.selector;
  const propMap = {};
  for (const p of s.properties) propMap[p.prop] = p.value;
  cloneLookup[key] = propMap;
}

const results = [];
let mismatches = 0;

for (const s of sourceSpacing) {
  const key = s.media ? `${s.media} | ${s.selector}` : s.selector;
  const cloneProps = cloneLookup[key];

  if (!cloneProps) {
    mismatches++;
    results.push({
      check: `Spacing for "${key}"`,
      pass: false,
      details: `Selector has spacing in source but missing in clone. Properties: ${s.properties.map((p) => `${p.prop}: ${p.value}`).join(", ")}`,
    });
    continue;
  }

  for (const { prop, value } of s.properties) {
    if (!cloneProps[prop]) {
      mismatches++;
      results.push({ check: `${prop} in "${s.selector}"`, pass: false, details: `Source: ${value}, Clone: missing` });
    } else if (cloneProps[prop] !== value) {
      mismatches++;
      results.push({ check: `${prop} in "${s.selector}"`, pass: false, details: `Source: ${value}, Clone: ${cloneProps[prop]}` });
    }
  }
}

if (mismatches === 0) {
  results.push({
    check: `All ${sourceSpacing.length} spacing rules matched`,
    pass: true,
  });
}

report("verify-spacing", results);
