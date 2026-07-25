const fs = require("fs");
const path = require("path");

// Usage: node dispatch-phase.js <phase-file.md> [skill-file.md]
const phaseFile = process.argv[2];
const skillFile = process.argv[3] || path.join(__dirname, "..", "..", "SKILL.md");

if (!phaseFile) {
  console.error("Usage: node dispatch-phase.js <phase-file.md> [skill-file.md]");
  process.exit(1);
}

if (!fs.existsSync(phaseFile)) {
  console.error(`Phase file not found: ${phaseFile}`);
  process.exit(1);
}

const phaseContent = fs.readFileSync(phaseFile, "utf-8");

// Extract sections from phase file
function extractSection(content, heading) {
  const regex = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |$)`, "m");
  const match = content.match(regex);
  return match ? match[1].trim() : "(not found)";
}

const instructions = extractSection(phaseContent, "Instructions");
const filesToRead = extractSection(phaseContent, "Files to Read");
const filesToModify = extractSection(phaseContent, "Files to Modify");
const acceptanceCriteria = extractSection(phaseContent, "Acceptance Criteria");

// Extract rules from SKILL.md
let rules = "(rules file not found)";
if (fs.existsSync(skillFile)) {
  const skillContent = fs.readFileSync(skillFile, "utf-8");
  const rulesMatch = skillContent.match(/## Rules & Guardrails\s*\n([\s\S]*?)(?=\n---|\n## Self-Learning)/);
  if (rulesMatch) {
    rules = rulesMatch[1].trim();
  }
}

// Extract phase name from first heading
const phaseNameMatch = phaseContent.match(/^# (.+)$/m);
const phaseName = phaseNameMatch ? phaseNameMatch[1] : "Unknown Phase";

// Format the subagent prompt
const prompt = `You are working on: ${phaseName}

FILES TO READ:
${filesToRead}

FILES TO MODIFY:
${filesToModify}

INSTRUCTIONS:
${instructions}

ACCEPTANCE CRITERIA (satisfy ALL before reporting done):
${acceptanceCriteria}

RULES:
${rules}

IMPORTANT:
- Do NOT touch files outside the FILES TO MODIFY list
- Do NOT invent content — every value must come from source files
- Do NOT skip any acceptance criterion
- When done, list what you changed and verify each criterion
`;

console.log(prompt);
