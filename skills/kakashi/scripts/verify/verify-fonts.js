const fs = require("fs");
const path = require("path");
const { report } = require("./lib/reporter");

// Usage: node verify-fonts.js <source.css> <clone.css> <project-root>
const [sourceCSS, cloneCSS, projectRoot] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS || !projectRoot) {
  console.error("Usage: node verify-fonts.js <source.css> <clone.css> <project-root>");
  process.exit(1);
}

function extractFontFaces(cssPath) {
  const css = fs.readFileSync(cssPath, "utf-8");
  const faces = [];
  const regex = /@font-face\s*\{([^}]+)\}/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    const block = m[1];
    const family = block.match(/font-family:\s*["']?([^"';]+)/)?.[1]?.trim();
    const weight = block.match(/font-weight:\s*([^;]+)/)?.[1]?.trim();
    const style = block.match(/font-style:\s*([^;]+)/)?.[1]?.trim() || "normal";
    const display = block.match(/font-display:\s*([^;]+)/)?.[1]?.trim();
    const srcMatch = block.match(/src:\s*([^;]+)/)?.[1];
    const urls = [];
    if (srcMatch) {
      const urlRegex = /url\(["']?([^"')]+)["']?\)/g;
      let um;
      while ((um = urlRegex.exec(srcMatch)) !== null) {
        urls.push(um[1]);
      }
    }
    faces.push({ family, weight, style, display, urls });
  }
  return faces;
}

const sourceFaces = extractFontFaces(sourceCSS);
const cloneFaces = extractFontFaces(cloneCSS);

const results = [];

// Check: same number of @font-face declarations
results.push({
  check: `@font-face count: source=${sourceFaces.length}, clone=${cloneFaces.length}`,
  pass: sourceFaces.length === cloneFaces.length,
  details: sourceFaces.length !== cloneFaces.length
    ? `Source has ${sourceFaces.length} @font-face rules, clone has ${cloneFaces.length}`
    : undefined,
});

// Check: each source font family exists in clone
const cloneFamilies = new Set(cloneFaces.map((f) => f.family?.toLowerCase()));
for (const face of sourceFaces) {
  if (!face.family) continue;
  results.push({
    check: `Font family "${face.family}" (weight: ${face.weight || "normal"})`,
    pass: cloneFamilies.has(face.family.toLowerCase()),
    details: !cloneFamilies.has(face.family.toLowerCase())
      ? `Font family "${face.family}" missing from clone CSS`
      : undefined,
  });
}

// Check: font files exist on disk
for (const face of cloneFaces) {
  for (const url of face.urls) {
    // Resolve relative to project root
    const cleanUrl = url.replace(/^\//, "");
    const filePath = path.join(projectRoot, "public", cleanUrl);
    const exists = fs.existsSync(filePath);
    results.push({
      check: `Font file exists: ${cleanUrl}`,
      pass: exists,
      details: exists ? undefined : `File not found: ${filePath}`,
    });
  }
}

report("verify-fonts", results);
