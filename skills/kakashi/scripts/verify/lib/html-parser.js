const fs = require("fs");
const path = require("path");

/**
 * Extract all visible text content from HTML, grouped by top-level section.
 * Strips tags, decodes entities, normalizes whitespace.
 * Returns: [{ section: "header"|"section"|"footer", index: 0, texts: ["line1", ...] }]
 */
function extractVisibleText(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  // Remove script, style, SVG internals, and HTML comments
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "[SVG]");

  // Split into top-level sections (header, section, footer, nav, main)
  const sectionRegex =
    /<(header|section|footer|nav|main|div)(\s[^>]*)?>[\s\S]*?<\/\1>/gi;
  const sections = [];
  let match;
  let idx = 0;

  while ((match = sectionRegex.exec(cleaned)) !== null) {
    const tag = match[1].toLowerCase();
    const content = match[0];
    // Strip all HTML tags to get text
    const text = content
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;|&apos;/g, "'")
      .replace(/&copy;/g, "\u00A9")
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length > 0) {
      sections.push({ section: tag, index: idx++, texts: text.split(/\s{2,}/).filter(Boolean) });
    }
  }
  return sections;
}

/**
 * Extract all class names from HTML.
 * Returns: Set<string> of unique class names.
 */
function extractClassNames(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  const classRegex = /class="([^"]*)"/g;
  const classes = new Set();
  let match;
  while ((match = classRegex.exec(html)) !== null) {
    match[1].split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }
  return classes;
}

/**
 * Extract DOM structure: for each top-level section, count elements by tag.
 * Returns: [{ section: string, tagCounts: { div: 5, span: 3, ... }, depth: number }]
 */
function extractStructure(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  const sectionRegex =
    /<(header|section|footer|nav|main)(\s[^>]*)?>[\s\S]*?<\/\1>/gi;
  const sections = [];
  let match;

  while ((match = sectionRegex.exec(html)) !== null) {
    const content = match[0];
    const tag = match[1].toLowerCase();
    const tagCounts = {};
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)/g;
    let tagMatch;
    while ((tagMatch = tagRegex.exec(content)) !== null) {
      const t = tagMatch[1].toLowerCase();
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }

    // Estimate nesting depth
    let maxDepth = 0;
    let currentDepth = 0;
    const depthRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)/g;
    let dm;
    while ((dm = depthRegex.exec(content)) !== null) {
      if (dm[0].startsWith("</")) {
        currentDepth--;
      } else {
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
      }
    }

    // Extract class for identification
    const classMatch = match[2] && match[2].match(/class="([^"]*)"/);
    const className = classMatch ? classMatch[1] : "";

    sections.push({ section: tag, className, tagCounts, depth: maxDepth });
  }
  return sections;
}

/**
 * Count top-level sections in HTML.
 * Returns: { total: number, tags: { header: 1, section: 5, footer: 1 } }
 */
function countSections(htmlPath) {
  const html = fs.readFileSync(htmlPath, "utf-8");
  const tags = {};
  const regex = /<(header|section|footer|nav|main)[\s>]/gi;
  let match;
  let total = 0;
  while ((match = regex.exec(html)) !== null) {
    const t = match[1].toLowerCase();
    tags[t] = (tags[t] || 0) + 1;
    total++;
  }
  return { total, tags };
}

module.exports = {
  extractVisibleText,
  extractClassNames,
  extractStructure,
  countSections,
};
