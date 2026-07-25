const fs = require("fs");
const path = require("path");
const { report } = require("./lib/reporter");

// Usage: node verify-animations.js <js-bundles-dir> <components-dir> [css-file]
const [jsBundlesDir, componentsDir, cssFile] = process.argv.slice(2);

if (!jsBundlesDir || !componentsDir) {
  console.error("Usage: node verify-animations.js <js-bundles-dir> <components-dir> [css-file]");
  process.exit(1);
}

// Read all JS bundle content
function readAllFiles(dir, ext) {
  let content = "";
  if (!fs.existsSync(dir)) return content;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      content += readAllFiles(full, ext);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      content += fs.readFileSync(full, "utf-8") + "\n";
    }
  }
  return content;
}

const jsContent = readAllFiles(jsBundlesDir, ".js");
const tsxContent = readAllFiles(componentsDir, ".tsx");
const cssContent = cssFile && fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf-8") : "";

const results = [];

// Detect animation libraries used in source
const libs = {
  gsap: /gsap\.(to|from|fromTo|set|timeline)|ScrollTrigger|gsap\.register/i.test(jsContent),
  framerMotion: /motion\.(div|span|section)|useAnimation|AnimatePresence|useInView/i.test(jsContent),
  anime: /anime\(|anime\.timeline/i.test(jsContent),
  lottie: /lottie|dotlottie/i.test(jsContent),
  intersectionObserver: /IntersectionObserver/i.test(jsContent),
  cssAnimations: /@keyframes|animation:|transition:/i.test(cssContent),
};

const detectedLibs = Object.entries(libs).filter(([, v]) => v).map(([k]) => k);
results.push({
  check: `Animation libraries detected in source: ${detectedLibs.join(", ") || "none"}`,
  pass: true,
});

// Extract GSAP calls if detected
if (libs.gsap) {
  // Count gsap.to/from/fromTo calls in source
  const gsapCalls = (jsContent.match(/gsap\.(to|from|fromTo|set)\s*\(/g) || []).length;
  const scrollTriggers = (jsContent.match(/ScrollTrigger/g) || []).length;
  const timelines = (jsContent.match(/gsap\.timeline/g) || []).length;

  results.push({
    check: `Source GSAP calls: ${gsapCalls} animations, ${scrollTriggers} ScrollTrigger refs, ${timelines} timelines`,
    pass: true,
  });

  // Check if clone uses GSAP
  const cloneHasGSAP = /gsap\.(to|from|fromTo|set)|ScrollTrigger|useGSAP/i.test(tsxContent);
  results.push({
    check: `Clone implements GSAP animations`,
    pass: cloneHasGSAP,
    details: cloneHasGSAP ? undefined : `Source uses GSAP (${gsapCalls} calls) but clone TSX has no GSAP imports or calls`,
  });

  // Count clone GSAP calls
  if (cloneHasGSAP) {
    const cloneGSAPCalls = (tsxContent.match(/gsap\.(to|from|fromTo|set)\s*\(/g) || []).length;
    results.push({
      check: `GSAP call count: source=${gsapCalls}, clone=${cloneGSAPCalls}`,
      pass: cloneGSAPCalls >= gsapCalls * 0.5,
      details: cloneGSAPCalls < gsapCalls * 0.5
        ? `Clone has significantly fewer GSAP animations than source`
        : undefined,
    });
  }

  // Extract easing values from source
  const easingRegex = /ease:\s*["']([^"']+)["']/g;
  const sourceEasings = new Set();
  let em;
  while ((em = easingRegex.exec(jsContent)) !== null) {
    sourceEasings.add(em[1]);
  }
  if (sourceEasings.size > 0) {
    results.push({
      check: `Source easing values: ${[...sourceEasings].join(", ")}`,
      pass: true,
    });
  }

  // Extract duration values
  const durationRegex = /duration:\s*([0-9.]+)/g;
  const sourceDurations = new Set();
  while ((em = durationRegex.exec(jsContent)) !== null) {
    sourceDurations.add(em[1]);
  }
  if (sourceDurations.size > 0) {
    results.push({
      check: `Source duration values: ${[...sourceDurations].join(", ")}`,
      pass: true,
    });
  }
}

// Check for Framer Motion
if (libs.framerMotion) {
  const cloneHasFramer = /motion\.|useAnimation|AnimatePresence|framer-motion/i.test(tsxContent);
  results.push({
    check: `Clone implements Framer Motion`,
    pass: cloneHasFramer,
    details: cloneHasFramer ? undefined : `Source uses Framer Motion but clone does not`,
  });
}

// Check for CSS animations
if (libs.cssAnimations) {
  const sourceKeyframeNames = [];
  const kfRegex = /@keyframes\s+([^\s{]+)/g;
  let km;
  while ((km = kfRegex.exec(cssContent)) !== null) {
    sourceKeyframeNames.push(km[1]);
  }

  // Check transitions
  const sourceTransitions = (cssContent.match(/transition:/g) || []).length;

  results.push({
    check: `CSS keyframes: ${sourceKeyframeNames.length} in source`,
    pass: true,
    details: sourceKeyframeNames.join(", "),
  });

  results.push({
    check: `CSS transitions: source=${sourceTransitions}`,
    pass: true,
  });
}

// Check IntersectionObserver
if (libs.intersectionObserver) {
  const cloneHasIO = /IntersectionObserver|useInView|isIntersecting/i.test(tsxContent);
  results.push({
    check: `Clone implements scroll-triggered visibility`,
    pass: cloneHasIO,
    details: cloneHasIO ? undefined : `Source uses IntersectionObserver but clone does not implement scroll triggers`,
  });
}

// If no animations detected at all
if (detectedLibs.length === 0) {
  results.push({
    check: `No animation libraries detected — Phase 3 may be marked N/A`,
    pass: true,
  });
}

report("verify-animations", results);
