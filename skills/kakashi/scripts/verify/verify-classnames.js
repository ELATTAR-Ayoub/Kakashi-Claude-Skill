const fs = require("fs");
const path = require("path");
const { extractClassNames } = require("./lib/html-parser");
const { report } = require("./lib/reporter");

const [sourceHTML, componentsDir] = process.argv.slice(2);

if (!sourceHTML || !componentsDir) {
  console.error("Usage: node verify-classnames.js <source.html> <components-dir>");
  process.exit(1);
}

const sourceClasses = extractClassNames(sourceHTML);

// Read all TSX content into one string for searching
const tsxFiles = fs.readdirSync(componentsDir).filter((f) => f.endsWith(".tsx"));
let allTSX = "";
for (const file of tsxFiles) {
  allTSX += fs.readFileSync(path.join(componentsDir, file), "utf-8") + "\n";
}

// Also read CSS file(s), class names might only appear in CSS
const cssGlob = [
  "app/globals.css",
  "app/cn-*.css",
];
let allCSS = "";
for (const pattern of cssGlob) {
  const dir = path.dirname(pattern);
  const base = path.basename(pattern);
  const absDir = path.resolve(componentsDir, "..", "..", dir);
  if (fs.existsSync(absDir)) {
    const files = fs.readdirSync(absDir).filter((f) => {
      if (base.includes("*")) {
        const prefix = base.split("*")[0];
        return f.startsWith(prefix) && f.endsWith(".css");
      }
      return f === base;
    });
    for (const f of files) {
      allCSS += fs.readFileSync(path.join(absDir, f), "utf-8") + "\n";
    }
  }
}

const combined = allTSX + allCSS;
const results = [];
const missing = [];
const found = [];

for (const cls of sourceClasses) {
  // Skip hashed/generated class names (contain random chars like _1a2b3c)
  if (/^[a-z]+_[a-zA-Z0-9]{5,}$/.test(cls)) continue;
  // Skip framework-internal classes
  if (cls.startsWith("__") || cls.startsWith("nuxt-") || cls.startsWith("next-")) continue;

  if (combined.includes(cls)) {
    found.push(cls);
  } else {
    missing.push(cls);
  }
}

if (missing.length === 0) {
  results.push({
    check: `All ${found.length} source class names found in TSX/CSS`,
    pass: true,
  });
} else {
  results.push({
    check: `Class name coverage: ${found.length}/${found.length + missing.length}`,
    pass: false,
    details: `Missing classes:\n${missing.join("\n")}`,
  });
}

report("verify-classnames", results);
