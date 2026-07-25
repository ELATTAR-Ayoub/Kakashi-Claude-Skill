const { extractBreakpoints } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-breakpoints.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceBreakpoints = extractBreakpoints(sourceCSS);
const cloneBreakpoints = extractBreakpoints(cloneCSS);

const results = [];
const missing = [];

for (const bp of sourceBreakpoints) {
  // Normalize whitespace for comparison
  const normalized = bp.replace(/\s+/g, " ");
  let found = false;
  for (const cbp of cloneBreakpoints) {
    if (cbp.replace(/\s+/g, " ") === normalized) {
      found = true;
      break;
    }
  }
  if (!found) missing.push(bp);
}

if (missing.length === 0) {
  results.push({
    check: `All ${sourceBreakpoints.size} source breakpoints present in clone`,
    pass: true,
  });
} else {
  results.push({
    check: `Breakpoint coverage: ${sourceBreakpoints.size - missing.length}/${sourceBreakpoints.size}`,
    pass: false,
    details: `Missing breakpoints:\n${missing.join("\n")}`,
  });
}

// List all clone breakpoints for reference
results.push({
  check: `Clone breakpoints (informational)`,
  pass: true,
  details: [...cloneBreakpoints].join("\n"),
});

report("verify-breakpoints", results);
