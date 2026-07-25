const fs = require("fs");
const path = require("path");
const { countSections } = require("./lib/html-parser");
const { report } = require("./lib/reporter");

const [sourceHTML, componentsDir] = process.argv.slice(2);

if (!sourceHTML || !componentsDir) {
  console.error("Usage: node verify-sections.js <source.html> <components-dir>");
  process.exit(1);
}

const source = countSections(sourceHTML);
const tsxFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));

const results = [];

results.push({
  check: `Source sections: ${source.total} (${Object.entries(source.tags).map(([k, v]) => `${k}:${v}`).join(", ")})`,
  pass: true,
});

results.push({
  check: `TSX component files: ${tsxFiles.length}`,
  pass: true,
  details: tsxFiles.join(", "),
});

// Check: roughly same count (allowing for header/footer being separate from sections)
const diff = Math.abs(source.total - tsxFiles.length);
results.push({
  check: `Section count match (diff=${diff})`,
  pass: diff <= 3,
  details: diff > 3
    ? `Large discrepancy: source has ${source.total} sections, TSX has ${tsxFiles.length} files. Likely missing components.`
    : undefined,
});

report("verify-sections", results);
