const fs = require("fs");

/**
 * Parse CSS into an array of { selector, properties: [{ prop, value }] }.
 * Handles nested @media blocks by flattening with media prefix.
 */
function parseRules(cssPath) {
  const css = fs.readFileSync(cssPath, "utf-8");
  // Remove comments
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];

  // Match top-level rules and @media blocks
  const blockRegex = /(@media[^{]+)\{([\s\S]*?\})\s*\}|([^@{][^{]*)\{([^}]*)\}/g;
  let match;

  while ((match = blockRegex.exec(cleaned)) !== null) {
    if (match[1]) {
      // @media block — parse inner rules
      const mediaQuery = match[1].trim();
      const innerCSS = match[2];
      const innerRegex = /([^{]+)\{([^}]*)\}/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(innerCSS)) !== null) {
        const selector = innerMatch[1].trim();
        const properties = parseProperties(innerMatch[2]);
        rules.push({ selector, properties, media: mediaQuery });
      }
    } else if (match[3]) {
      const selector = match[3].trim();
      const properties = parseProperties(match[4]);
      rules.push({ selector, properties, media: null });
    }
  }
  return rules;
}

/**
 * Parse "prop: value; prop: value;" into [{ prop, value }].
 */
function parseProperties(block) {
  const props = [];
  const lines = block.split(";").filter((l) => l.trim());
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const prop = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (prop && value) {
      props.push({ prop, value });
    }
  }
  return props;
}

/**
 * Extract all color values from CSS.
 * Returns: Set<string> of normalized color values.
 */
function extractColors(cssPath) {
  const css = fs.readFileSync(cssPath, "utf-8");
  const colors = new Set();

  // Hex colors
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
  let m;
  while ((m = hexRegex.exec(css)) !== null) colors.add(m[0].toLowerCase());

  // rgb/rgba
  const rgbRegex = /rgba?\([^)]+\)/g;
  while ((m = rgbRegex.exec(css)) !== null) colors.add(m[0].replace(/\s+/g, ""));

  // hsl/hsla
  const hslRegex = /hsla?\([^)]+\)/g;
  while ((m = hslRegex.exec(css)) !== null) colors.add(m[0].replace(/\s+/g, ""));

  // oklch
  const oklchRegex = /oklch\([^)]+\)/g;
  while ((m = oklchRegex.exec(css)) !== null) colors.add(m[0].replace(/\s+/g, ""));

  return colors;
}

/**
 * Extract typography properties grouped by selector.
 * Returns: [{ selector, fontSize, fontWeight, lineHeight, letterSpacing }]
 */
function extractTypography(cssPath) {
  const rules = parseRules(cssPath);
  const typo = [];
  for (const rule of rules) {
    const entry = { selector: rule.selector, media: rule.media };
    let hasTypo = false;
    for (const { prop, value } of rule.properties) {
      if (prop === "font-size") { entry.fontSize = value; hasTypo = true; }
      if (prop === "font-weight") { entry.fontWeight = value; hasTypo = true; }
      if (prop === "line-height") { entry.lineHeight = value; hasTypo = true; }
      if (prop === "letter-spacing") { entry.letterSpacing = value; hasTypo = true; }
      if (prop === "text-transform") { entry.textTransform = value; hasTypo = true; }
    }
    if (hasTypo) typo.push(entry);
  }
  return typo;
}

/**
 * Extract spacing properties (margin, padding, gap) grouped by selector.
 * Returns: [{ selector, properties: [{ prop, value }] }]
 */
function extractSpacing(cssPath) {
  const rules = parseRules(cssPath);
  const spacingProps = [
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "gap", "row-gap", "column-gap",
  ];
  const results = [];
  for (const rule of rules) {
    const spacing = rule.properties.filter((p) => spacingProps.includes(p.prop));
    if (spacing.length > 0) {
      results.push({ selector: rule.selector, media: rule.media, properties: spacing });
    }
  }
  return results;
}

/**
 * Extract all @media queries with their exact breakpoint values.
 * Returns: Set<string> of media query strings.
 */
function extractBreakpoints(cssPath) {
  const css = fs.readFileSync(cssPath, "utf-8");
  const breakpoints = new Set();
  const regex = /@media\s*([^{]+)/g;
  let m;
  while ((m = regex.exec(css)) !== null) {
    breakpoints.add(m[1].trim());
  }
  return breakpoints;
}

/**
 * Extract all @keyframes definitions with their steps.
 * Returns: [{ name, steps: [{ selector, properties }] }]
 */
function extractKeyframes(cssPath) {
  const css = fs.readFileSync(cssPath, "utf-8");
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const keyframes = [];
  const regex = /@keyframes\s+([^\s{]+)\s*\{([\s\S]*?\})\s*\}/g;
  let m;
  while ((m = regex.exec(cleaned)) !== null) {
    const name = m[1];
    const body = m[2];
    const steps = [];
    const stepRegex = /([^{]+)\{([^}]*)\}/g;
    let sm;
    while ((sm = stepRegex.exec(body)) !== null) {
      steps.push({
        selector: sm[1].trim(),
        properties: parseProperties(sm[2]),
      });
    }
    keyframes.push({ name, steps });
  }
  return keyframes;
}

module.exports = {
  parseRules,
  parseProperties,
  extractColors,
  extractTypography,
  extractSpacing,
  extractBreakpoints,
  extractKeyframes,
};
