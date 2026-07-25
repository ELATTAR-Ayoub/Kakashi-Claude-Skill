const { extractKeyframes } = require("./lib/css-parser");
const { report } = require("./lib/reporter");

const [sourceCSS, cloneCSS] = process.argv.slice(2);

if (!sourceCSS || !cloneCSS) {
  console.error("Usage: node verify-keyframes.js <source.css> <clone.css>");
  process.exit(1);
}

const sourceKF = extractKeyframes(sourceCSS);
const cloneKF = extractKeyframes(cloneCSS);

const cloneLookup = {};
for (const kf of cloneKF) cloneLookup[kf.name] = kf;

const results = [];

for (const kf of sourceKF) {
  if (!cloneLookup[kf.name]) {
    results.push({
      check: `@keyframes "${kf.name}" exists`,
      pass: false,
      details: `Missing in clone CSS. Source has ${kf.steps.length} steps.`,
    });
    continue;
  }

  const cloneSteps = cloneLookup[kf.name].steps;
  if (kf.steps.length !== cloneSteps.length) {
    results.push({
      check: `@keyframes "${kf.name}" step count`,
      pass: false,
      details: `Source: ${kf.steps.length} steps, Clone: ${cloneSteps.length} steps`,
    });
  } else {
    // Compare each step
    let stepMatch = true;
    for (let i = 0; i < kf.steps.length; i++) {
      if (kf.steps[i].selector !== cloneSteps[i].selector) {
        stepMatch = false;
        break;
      }
      // Compare properties
      const srcProps = kf.steps[i].properties.map((p) => `${p.prop}:${p.value}`).sort().join(";");
      const clnProps = cloneSteps[i].properties.map((p) => `${p.prop}:${p.value}`).sort().join(";");
      if (srcProps !== clnProps) {
        stepMatch = false;
        break;
      }
    }
    results.push({
      check: `@keyframes "${kf.name}" matches`,
      pass: stepMatch,
      details: stepMatch ? undefined : `Step properties differ, compare source vs clone manually`,
    });
  }
}

if (sourceKF.length === 0) {
  results.push({ check: "No @keyframes in source CSS", pass: true });
}

report("verify-keyframes", results);
