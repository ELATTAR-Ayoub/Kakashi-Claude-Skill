const fs = require("fs");
const path = require("path");
const { extractStructure } = require("./lib/html-parser");
const { report } = require("./lib/reporter");

const [sourceHTML, componentsDir] = process.argv.slice(2);

if (!sourceHTML || !componentsDir) {
  console.error("Usage: node verify-structure.js <source.html> <components-dir>");
  process.exit(1);
}

// Extract structure from source
const sourceStructure = extractStructure(sourceHTML);

// Extract structure from TSX files (treat each file as a section)
const tsxFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
const tsxStructure = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(path.join(componentsDir, file), "utf-8");
  const tagCounts = {};
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)/g;
  let m;
  while ((m = tagRegex.exec(content)) !== null) {
    // Skip React/component tags (capitalized) and imports
    if (m[1][0] === m[1][0].toUpperCase()) continue;
    const t = m[1].toLowerCase();
    tagCounts[t] = (tagCounts[t] || 0) + 1;
  }
  tsxStructure.push({ file, tagCounts });
}

const results = [];

// Check: source section count vs TSX file count
results.push({
  check: `Section count: source=${sourceStructure.length}, TSX=${tsxFiles.length}`,
  pass: Math.abs(sourceStructure.length - tsxFiles.length) <= 2,
  details: sourceStructure.length !== tsxFiles.length
    ? `Source has ${sourceStructure.length} sections, TSX has ${tsxFiles.length} component files. Difference may indicate missing or extra components.`
    : undefined,
});

// Check: total element count comparison
const sourceTotalTags = sourceStructure.reduce((sum, s) => {
  return sum + Object.values(s.tagCounts).reduce((a, b) => a + b, 0);
}, 0);
const tsxTotalTags = tsxStructure.reduce((sum, s) => {
  return sum + Object.values(s.tagCounts).reduce((a, b) => a + b, 0);
}, 0);

const ratio = tsxTotalTags / sourceTotalTags;
results.push({
  check: `Element count ratio: ${ratio.toFixed(2)} (source=${sourceTotalTags}, TSX=${tsxTotalTags})`,
  pass: ratio >= 0.7 && ratio <= 1.3,
  details: ratio < 0.7
    ? `TSX has significantly fewer elements than source — likely missing content`
    : ratio > 1.3
    ? `TSX has significantly more elements than source — likely added extra wrappers`
    : undefined,
});

// List source tags for reference
const allSourceTags = {};
for (const s of sourceStructure) {
  for (const [tag, count] of Object.entries(s.tagCounts)) {
    allSourceTags[tag] = (allSourceTags[tag] || 0) + count;
  }
}
results.push({
  check: `Source tag distribution logged`,
  pass: true,
  details: Object.entries(allSourceTags)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => `${tag}: ${count}`)
    .join(", "),
});

report("verify-structure", results);
