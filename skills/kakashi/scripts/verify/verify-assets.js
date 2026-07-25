const fs = require("fs");
const path = require("path");
const { report } = require("./lib/reporter");

// Usage: node verify-assets.js <project-root>
const projectRoot = process.argv[2];

if (!projectRoot) {
  console.error("Usage: node verify-assets.js <project-root>");
  process.exit(1);
}

// Collect all TSX and CSS files
function collectFiles(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      results.push(...collectFiles(full, ext));
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

const tsxFiles = collectFiles(projectRoot, ".tsx");
const cssFiles = collectFiles(projectRoot, ".css");
const allContent = [...tsxFiles, ...cssFiles]
  .map((f) => fs.readFileSync(f, "utf-8"))
  .join("\n");

// Find all asset references
const assetRefs = new Set();

// src="/path" or src={"/path"}
const srcRegex = /src=["'{]?\/?([^"'}>\s]+\.(?:png|jpg|jpeg|gif|webp|svg|mp4|webm|woff2?|ttf|eot|otf|lottie|json))/gi;
let m;
while ((m = srcRegex.exec(allContent)) !== null) {
  assetRefs.add(m[1]);
}

// url(/path) or url("/path")
const urlRegex = /url\(["']?\/?([^"')]+\.(?:png|jpg|jpeg|gif|webp|svg|mp4|webm|woff2?|ttf|eot|otf))/gi;
while ((m = urlRegex.exec(allContent)) !== null) {
  assetRefs.add(m[1]);
}

const results = [];
const missing = [];
const found = [];

for (const ref of assetRefs) {
  // Check in public/ directory
  const publicPath = path.join(projectRoot, "public", ref);
  // Also check directly from project root
  const rootPath = path.join(projectRoot, ref);

  if (fs.existsSync(publicPath) || fs.existsSync(rootPath)) {
    found.push(ref);
  } else {
    missing.push(ref);
  }
}

if (missing.length === 0) {
  results.push({
    check: `All ${found.length} referenced assets exist on disk`,
    pass: true,
  });
} else {
  results.push({
    check: `Asset coverage: ${found.length}/${found.length + missing.length}`,
    pass: false,
    details: `Missing files:\n${missing.join("\n")}`,
  });
}

report("verify-assets", results);
