const { parseRules } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

// Usage: node verify-css-rules.js <source.css> <clone.css>
const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-css-rules.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceRules = parseRules(sourceCSS);
const cloneRules = parseRules(cloneCSS);

// Build lookup: selector → properties (for clone)
const cloneLookup = {};
for (const rule of cloneRules) {
  const key = rule.media ? `${rule.media} | ${rule.selector}` : rule.selector;
  cloneLookup[key] = rule.properties;
}

const results = [];
let missingSelectors = 0;
let mismatchedProps = 0;

for (const rule of sourceRules) {
  const key = rule.media ? `${rule.media} | ${rule.selector}` : rule.selector;

  if (!cloneLookup[key]) {
    missingSelectors++;
    if (missingSelectors <= 20) {
      results.push({
        check: `Selector exists: ${key}`,
        pass: false,
        details: `Selector "${key}" exists in source but not in clone CSS`,
      });
    }
    continue;
  }

  // Compare properties
  const cloneProps = cloneLookup[key];
  const clonePropMap = {};
  for (const p of cloneProps) clonePropMap[p.prop] = p.value;

  for (const { prop, value } of rule.properties) {
    if (!clonePropMap[prop]) {
      mismatchedProps++;
      if (mismatchedProps <= 20) {
        results.push({
          check: `Property "${prop}" in "${rule.selector}"`,
          pass: false,
          details: `Source has ${prop}: ${value} — missing in clone`,
        });
      }
    } else if (clonePropMap[prop] !== value) {
      mismatchedProps++;
      if (mismatchedProps <= 20) {
        results.push({
          check: `Property value "${prop}" in "${rule.selector}"`,
          pass: false,
          details: `Source: ${value}\nClone:  ${clonePropMap[prop]}`,
        });
      }
    }
  }
}

if (missingSelectors === 0 && mismatchedProps === 0) {
  results.push({
    check: `All ${sourceRules.length} source CSS rules matched in clone`,
    pass: true,
  });
}

if (missingSelectors > 20 || mismatchedProps > 20) {
  results.push({
    check: `Truncated output`,
    pass: false,
    details: `${missingSelectors} missing selectors, ${mismatchedProps} property mismatches (showing first 20 of each)`,
  });
}

report("verify-css-rules", results);
