const { extractColors } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-colors.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceColors = extractColors(sourceCSS);
const cloneColors = extractColors(cloneCSS);

const results = [];
const missing = [];

for (const color of sourceColors) {
  if (!cloneColors.has(color)) {
    missing.push(color);
  }
}

if (missing.length === 0) {
  results.push({
    check: `All ${sourceColors.size} source colors present in clone CSS`,
    pass: true,
  });
} else {
  results.push({
    check: `Color coverage: ${sourceColors.size - missing.length}/${sourceColors.size}`,
    pass: false,
    details: `Missing colors:\n${missing.join("\n")}`,
  });
}

// Also report what clone has that source doesn't (informational)
const extra = [];
for (const color of cloneColors) {
  if (!sourceColors.has(color)) extra.push(color);
}
if (extra.length > 0) {
  results.push({
    check: `Extra colors in clone (informational): ${extra.length}`,
    pass: true,
    details: extra.slice(0, 10).join(", ") + (extra.length > 10 ? ` ... +${extra.length - 10} more` : ""),
  });
}

report("verify-colors", results);
