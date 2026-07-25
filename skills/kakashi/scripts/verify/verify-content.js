const fs = require("fs");
const path = require("path");
const { extractVisibleText } = require("./lib/html-parser");
const { report } = require("./lib/reporter");

// Usage: node verify-content.js <source.html> <components-dir>
const [sourceHTML, componentsDir] = process.argv.slice(2);

if (!sourceHTML || !componentsDir) {
  console.error("Usage: node verify-content.js <source.html> <components-dir>");
  process.exit(1);
}

// Extract text from source HTML
const sourceSections = extractVisibleText(sourceHTML);
const sourceTexts = sourceSections.flatMap((s) => s.texts);

// Extract string literals from all TSX files
function extractTSXText(dir) {
  const texts = [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"));
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    // Extract text between JSX tags: >text<
    const jsxTextRegex = />\s*([^<>{}`]+?)\s*</g;
    let m;
    while ((m = jsxTextRegex.exec(content)) !== null) {
      const text = m[1]
        .replace(/&amp;/g, "&")
        .replace(/&apos;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&copy;/g, "\u00A9")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length > 2 && !/^[{}()\[\]\/\\=+*]/.test(text)) {
        texts.push({ text, file });
      }
    }
    // Also extract string literals in arrays/objects (for data-driven sections)
    const stringRegex = /["'`]([A-Z][^"'`]{5,})["'`]/g;
    while ((m = stringRegex.exec(content)) !== null) {
      texts.push({ text: m[1].trim(), file });
    }
  }
  return texts;
}

const tsxTexts = extractTSXText(componentsDir);
const tsxTextStrings = tsxTexts.map((t) => t.text);

// Compare: every source text fragment should appear somewhere in TSX
const results = [];
let missingCount = 0;

for (const sourceText of sourceTexts) {
  // Skip very short fragments (single words, punctuation)
  if (sourceText.length < 5) continue;

  // Normalize for comparison
  const normalizedSource = sourceText.toLowerCase().replace(/\s+/g, " ").trim();

  const found = tsxTextStrings.some((t) => {
    const normalizedTSX = t.toLowerCase().replace(/\s+/g, " ").trim();
    // Check if source text is contained in any TSX text or vice versa
    return normalizedTSX.includes(normalizedSource) || normalizedSource.includes(normalizedTSX);
  });

  if (!found) {
    missingCount++;
    results.push({
      check: `Source text present in TSX`,
      pass: false,
      details: `Missing: "${sourceText.slice(0, 100)}${sourceText.length > 100 ? "..." : ""}"`,
    });
  }
}

if (missingCount === 0) {
  results.push({
    check: `All source text fragments found in TSX (${sourceTexts.length} checked)`,
    pass: true,
  });
} else {
  results.unshift({
    check: `Content completeness: ${sourceTexts.length - missingCount}/${sourceTexts.length} fragments found`,
    pass: false,
    details: `${missingCount} text fragments from source HTML not found in TSX files`,
  });
}

report("verify-content", results);
