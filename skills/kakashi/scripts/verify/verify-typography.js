const { extractTypography } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-typography.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceTypo = extractTypography(sourceCSS);
const cloneTypo = extractTypography(cloneCSS);

// Build clone lookup by selector
const cloneLookup = {};
for (const t of cloneTypo) {
  const key = t.media ? `${t.media} | ${t.selector}` : t.selector;
  cloneLookup[key] = t;
}

const results = [];
let mismatches = 0;

for (const t of sourceTypo) {
  const key = t.media ? `${t.media} | ${t.selector}` : t.selector;
  const clone = cloneLookup[key];

  if (!clone) {
    mismatches++;
    results.push({
      check: `Typography for "${key}"`,
      pass: false,
      details: `Selector has typography in source but missing in clone. Source: font-size=${t.fontSize || "-"}, font-weight=${t.fontWeight || "-"}, line-height=${t.lineHeight || "-"}`,
    });
    continue;
  }

  const diffs = [];
  if (t.fontSize && t.fontSize !== clone.fontSize) diffs.push(`font-size: ${t.fontSize} vs ${clone.fontSize || "missing"}`);
  if (t.fontWeight && t.fontWeight !== clone.fontWeight) diffs.push(`font-weight: ${t.fontWeight} vs ${clone.fontWeight || "missing"}`);
  if (t.lineHeight && t.lineHeight !== clone.lineHeight) diffs.push(`line-height: ${t.lineHeight} vs ${clone.lineHeight || "missing"}`);
  if (t.letterSpacing && t.letterSpacing !== clone.letterSpacing) diffs.push(`letter-spacing: ${t.letterSpacing} vs ${clone.letterSpacing || "missing"}`);

  if (diffs.length > 0) {
    mismatches++;
    results.push({
      check: `Typography match: "${key}"`,
      pass: false,
      details: diffs.join("\n"),
    });
  }
}

if (mismatches === 0) {
  results.push({
    check: `All ${sourceTypo.length} typography rules matched`,
    pass: true,
  });
}

report("verify-typography", results);
