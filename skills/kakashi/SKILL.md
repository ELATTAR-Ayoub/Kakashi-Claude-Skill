---
name: kakashi
description: Use when the user wants a pixel-perfect 1:1 clone/rebuild of any website. Triggers on requests to replicate, clone, copy, or rebuild a site as Next.js + Tailwind + TypeScript components. Also triggers when the user provides a URL or HTML reference and wants an exact visual match.
---

# Kakashi: Pixel-Perfect Website Cloner

**Goal:** Take any website URL or HTML and produce an exact 1:1 clone as a modern Next.js + Tailwind CSS + TypeScript codebase. Every pixel, animation, and value comes from the original source, zero creative additions.

## Prerequisites

Required plugins, install before using this skill:
```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/plugin install frontend-design@claude-plugins-official
```

Skills used: `superpowers:dispatching-parallel-agents`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion`, `superpowers:executing-plans`, `frontend-design:frontend-design`

---

## ENFORCEMENT SYSTEM (READ THIS FIRST: NON-NEGOTIABLE)

This section exists because the agent has a proven pattern of acknowledging this skill, then skipping every phase and rationalizing it afterward. That stops now.

### Hard Gates: The Agent Cannot Bypass These

**GATE 1: No code without capture.**
Before writing ANY `.tsx`, `.css`, or component file, the agent MUST verify that `reference/clone.html` exists and contains actual page content (not an error page, not empty). If it doesn't exist, STOP. You are in Phase 1. You cannot be in Phase 4.

**GATE 2: No code without PROGRESS.md.**
Before writing ANY component or style file, the agent MUST verify that `reference/PROGRESS.md` exists. If it doesn't, STOP. Create it first. This is the first thing you do, before anything else.

**GATE 3: No code without design system extraction.**
Before writing ANY component, the agent MUST verify that Phase 2 results exist, either in `reference/phases/phase-2.md` with status VERIFIED, or as extracted color/typography/spacing tokens saved to a file. If Phase 2 isn't done, you cannot build components.

**GATE 4: No "done" without disclosure.**
The agent CANNOT tell the user the work is complete, finished, or done until Phase 6 (Disclosure Report) has been generated and presented inline in the conversation. "Done" without disclosure = failure.

**GATE 5: No phase skipping.**
Every phase must be executed or explicitly documented as N/A with justification in the phase file. "I didn't have time" is not justification. "The site has no animations" IS justification for skipping Phase 3, but you still must create the phase file and write that in it.

### Fetch Escalation Ladder (MANDATORY when first fetch fails)

When WebFetch or curl returns empty/useless content (e.g., CSR/SPA framework shell), you MUST escalate through ALL of these before giving up:

1. **curl with browser user-agent**: `curl -L -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" <URL>`
2. **curl with different endpoints**: Try common API/prerender paths: `<URL>?_escaped_fragment_=`, `<URL>?__renderer=ssr`
3. **WebFetch with content extraction prompt**: Use WebFetch with a detailed prompt asking to extract all visible text, headings, images, layout structure
4. **Search for cached/archived version**: Try `web.archive.org/web/<URL>` or Google Cache
5. **Ask the user**: "I cannot fetch the rendered page because [specific reason]. Can you: (a) paste the page HTML from browser DevTools, (b) provide a screenshot, or (c) save the page as HTML and give me the file path?"

**You do NOT get to say "the site uses CSR so I'll just guess" after trying one fetch.** That is the exact failure mode this ladder prevents.

### Anti-Rationalization List

These are thoughts the agent has had before to skip this skill. Each one is INVALID:

| Rationalization | Why It's Bullshit |
|---|---|
| "This is design adaptation, not a full clone" | The skill applies to ANY visual replication. "Extract design DNA" IS cloning the design system. Phases 1-2 still apply fully. |
| "The site uses CSR so I can't get the content" | Use the Fetch Escalation Ladder. All 5 steps. Then you've earned the right to say you can't get it. |
| "I'll just extract some hex values from raw CSS" | That's not a design system extraction. That's grep. Phase 2 requires semantic mapping of colors, typography, spacing, and patterns. |
| "The user has a lot of tasks, I need to be fast" | Fast and wrong wastes MORE time than slow and right. The user will reject bad work and you'll redo it anyway. |
| "I'll follow the spirit of the skill, not the letter" | No. Follow the letter. The phases exist because skipping them produces garbage. You've proven this. |
| "I can do this without the phase files" | You literally cannot. Context compression will erase your extraction work, and you'll start inventing values. The phase files ARE the memory system. |
| "The skill is overkill for this task" | If you're extracting visual design from one site to apply to another, you need Phase 1 (capture), Phase 2 (extract design system), and Phase 6 (disclosure). Minimum. |
| "I already know what this site looks like" | No you don't. You have compressed memories of a previous conversation. Re-fetch, re-extract, re-verify. |

### Minimum Viable Compliance (for "design DNA" / partial clone tasks)

When the user asks to "extract the design" or "apply the style" (not a full clone), these phases are STILL MANDATORY:

- **Phase 1**: Capture the target (fetch the page, save HTML, identify tech stack)
- **Phase 2**: Extract the design system (colors, typography, spacing, with EVIDENCE saved to files)
- **Phase 6**: Disclosure report (what was extracted 1:1, what was approximated, what was skipped)

Phases 3-5 can be marked N/A if the task is purely design extraction, but their phase files must still be created with that justification.

### "I'm Stuck" Protocol (MANDATORY: No Silent Improvisation)

**The agent MUST NEVER silently work around a problem.** When you hit a blocker at ANY phase, you do NOT get to quietly improvise a solution and keep going. You STOP and tell the user.

**When to trigger this protocol:**
- A fetch returns unusable content after completing the Fetch Escalation Ladder
- You cannot extract a specific value (color, font size, animation timing) from any source
- A phase's acceptance criteria cannot be met with the data available
- You're about to approximate something instead of copying it exactly
- You need a tool, access, or capability you don't have
- The task requires something outside the skill's scope

**What to do, the BLOCKER REPORT:**

Stop what you're doing and present this to the user:

```
BLOCKER: [One-line description of what's blocked]

What I tried:
- [Step 1 you attempted]
- [Step 2 you attempted]
- [Step N you attempted]

What I can't do:
- [Specific thing that's impossible/blocked and why]

Options for you:
1. [Concrete solution the user can provide, e.g., "Paste the HTML from DevTools"]
2. [Alternative approach, e.g., "I proceed with approximation, but I'll flag it in the disclosure report"]
3. [Scope reduction, e.g., "Skip this section entirely and document it as Not Implemented"]
4. [Different tool/method, e.g., "Use a headless browser to render the page"]

Which option do you want?
```

**Rules for the Blocker Report:**
- **Options must be concrete and actionable.** Not "we could try something else", give SPECIFIC alternatives.
- **Always include an approximation option** with the caveat that it WILL be flagged in Phase 6 disclosure. The user decides if approximation is acceptable, not the agent.
- **Always include a skip option.** Sometimes the user would rather skip a section than get a bad version of it.
- **Never present a blocker without options.** The user needs solutions, not just problems.
- **The user picks. You execute.** Do not pick an option yourself and keep going. Wait for the user's choice.

**What NEVER to do:**
- Silently approximate and hope the user won't notice
- Downgrade from "clone" to "inspired by" without asking
- Skip a phase and mention it only in passing later
- Invent values because you couldn't extract them
- Say "I'll do my best" and then deliver guesswork

---

## Mindset

You are Kakashi. You do not design. You do not improvise. You reverse-engineer and replicate with surgical precision. Every CSS value, every animation parameter, every class name must come from the original. If you can't find a value in the source, dig deeper, JS bundles, computed styles, network payloads. You never guess.

---

## Context Persistence (MANDATORY)

Context window compression causes phases to be skipped and content to be invented. This system prevents that.

### At Clone Start
1. Create `reference/PROGRESS.md`: master checklist tracking mode (CONFIRM/AUTO), current phase, and status of all 6 phases
2. Create `reference/phases/phase-{1-6}.md`: one file per phase containing: instructions, source files, output files, acceptance criteria, verification method, and results (filled after completion)
3. Mode defaults to **CONFIRM** (user approves each phase transition). Pass "auto" argument to skip confirmations.
4. Copy verification scripts: `cp -r <skill-dir>/scripts/verify/ scripts/verify/`: scripts must be in the project for phase verification to work

### Before Every Phase
1. **Re-read** `reference/PROGRESS.md` to check current state
2. **Re-read** `reference/phases/phase-{N}.md` to reload instructions into active context
3. Execute the phase
4. Verify acceptance criteria against source HTML/CSS
5. Write results into the phase file
6. Update PROGRESS.md (mark complete, advance current phase)
7. **CONFIRM mode:** Ask user to approve before advancing. **AUTO mode:** Advance automatically after verification passes.

### Phase File Template
```markdown
# Phase N: [Name]
Status: PENDING | IN PROGRESS | VERIFIED | FAILED

## Instructions
[Copied from SKILL.md for this phase, the agent's ONLY source of truth for what to do]

## Files to Read
[Exact paths to reference files the agent must read before starting]
- reference/clone.html
- reference/raw-pretty.html
- downloaded_assets/styles.css

## Files to Modify
[Exact paths the agent will create or edit, touch NOTHING outside this list]
- app/globals.css
- components/sections/hero-section.tsx

## Acceptance Criteria
[Measurable, testable conditions, every one must pass before advancing]
- [ ] All colors extracted match source CSS (compare hex values 1:1)
- [ ] Every section in source HTML has corresponding CSS in globals.css
- [ ] Content is verbatim from source, zero invented text

## Verification Method
[Run these scripts, NEVER self-grade, let scripts produce evidence]

Phase 1: `node scripts/verify/verify-assets.js .` + `node scripts/verify/verify-fonts.js`
Phase 2: `node scripts/verify/verify-colors.js` + `verify-typography.js` + `verify-spacing.js` + `verify-breakpoints.js` + `verify-css-rules.js`
Phase 3: `node scripts/verify/verify-animations.js` + `verify-keyframes.js`
Phase 4: `node scripts/verify/verify-content.js` + `verify-structure.js` + `verify-classnames.js` + `verify-sections.js` + `verify-build.sh`
Phase 5: `bash scripts/verify/run-all-verifications.sh .`

## Results
[Filled ONLY after verification passes]
- What was done:
- Verification outcome (PASS/FAIL per criterion):
- Issues found and fixed:

## Retry Log
[If verification failed, log the error and what was tried]
- Attempt 1: [error] → [fix applied]
- Attempt 2: [error] → [fix applied]
```

### Subagent Rule
When dispatching subagents via `superpowers:dispatching-parallel-agents`, include the relevant phase file content in each subagent's prompt. Subagents must have access to skill rules and acceptance criteria, they cannot rely on conversation context they don't have.

---

## CSS File Strategy

Clone CSS is isolated from the user's existing styles:

- **Small site** (single page, <500 lines CSS): one file `app/cn-landing.css`
- **Larger site** (multi-page or >500 lines): shared `app/cn-global.css` + per-page `app/cn-landing.css`, `app/cn-about.css`, etc.
- All files imported into `app/globals.css` via `@import "./cn-landing.css"`
- User's existing CSS in `globals.css` is NEVER touched, only `@import` lines are added
- Naming convention: `cn-` prefix (clone namespace) prevents collisions

---

## Phase 1: Capture the Target

**HARD GATE CHECK: Does `reference/PROGRESS.md` exist? If NO → create it NOW before doing anything else.**

### Step 1.1: Fetch & Save the Full Page
Use the script first, it sends a full browser fingerprint, which plain `curl` does not:

```bash
bash scripts/fetch-page.sh <URL>
```

- Save raw HTML as `reference/clone.html` (single source of truth)
- Save a prettified version as `reference/raw-pretty.html` for easier searching
- If the user provides a URL, also try fetching with JavaScript rendering (some sites are SPAs)
- **IF THE FETCH RETURNS EMPTY/CSR SHELL:** Follow the Fetch Escalation Ladder. ALL 5 STEPS. Do not skip to "I'll just guess from raw CSS."

### Step 1.2: Download All Assets

```bash
python3 scripts/download-assets.py reference/clone.html <BASE_URL>
```

The script writes to these locations. **Do not invent other paths**: Phase 2 and 3 tooling reads from exactly here:

| Asset | Destination |
|---|---|
| External stylesheets + inline `<style>` blocks | `downloaded_assets/css/` |
| JS bundles (sorted by size for animation searching) | `downloaded_assets/js/` |
| Fonts (woff2, woff, ttf, otf) | `public/fonts/` |
| Images, videos, Lottie files | `public/assets/` |
| Favicon, OG images | `public/` |

### Step 1.3: Identify the Original Tech Stack

```bash
python3 scripts/detect-stack.py reference/clone.html
```

Confirm each of these, they dictate extraction strategy:

| What | How to detect | Impact |
|------|--------------|--------|
| **Framework** | `__nuxt`, `__next`, `#__gatsby`, `data-reactroot` | Where animations/content live |
| **Animation lib** | Search JS for `gsap`, `framer-motion`, `anime`, `motion` | Animation rebuild approach |
| **3D lib** | Search for `THREE`, `@react-three`, `babylonjs`, `<canvas>` | Need R3F or vanilla Three.js |
| **CMS** | Search for `sanity`, `contentful`, `strapi`, API calls | Some content is client-rendered |
| **CSS approach** | Tailwind classes, CSS modules, styled-components, vanilla | Styling strategy |
| **Scroll library** | `lenis`, `locomotive-scroll`, `smooth-scrollbar` | Scroll behavior |

Document all findings before building.

**Human checkpoint:** "Here's the original tech stack. Proceeding to extract design system."

---

## Phase 2: Extract the Design System

**HARD GATE CHECK: Does `reference/clone.html` exist with real content? If NO → you are still in Phase 1. Go back.**

### Step 2.1: Colors
- Extract ALL colors from CSS (hex, rgb, hsl, oklch, CSS custom properties)
- Map to semantic tokens: `bg`, `fg`, `accent`, `border`, `muted`, `card`, `surface`
- Check for dark/light mode variants
- Register in Tailwind v4 `@theme inline` block as CSS custom properties
- **SAVE extracted colors to `reference/extracted-colors.md` with source evidence (which CSS rule, which file, which line)**

### Step 2.2: Typography
- Download actual font files (don't rely on CDN links)
- Register `@font-face` declarations with correct `font-weight`, `font-display`
- Extract every unique `font-size`: use EXACT original values (rem/px/clamp), NOT Tailwind defaults
- Map `font-weight`, `line-height`, `letter-spacing`, `text-transform` per element type
- Create Tailwind font family entries matching original family names
- **SAVE extracted typography to `reference/extracted-typography.md` with source evidence**

### Step 2.3: Spacing, Layout & Breakpoints
- Extract all padding, margin, gap values (often `vw` units on modern sites)
- Extract grid templates, flex configurations
- Find EVERY `@media` query, note exact `px` breakpoints (don't assume Tailwind defaults)
- Map CSS custom properties: `--section-px`, `--section-px-mobile`, `--header-height`, etc.
- **SAVE extracted spacing to `reference/extracted-spacing.md` with source evidence**

### Step 2.4: Shared CSS Patterns
Extract and document these common patterns:
- **Utility classes:** `.cover`, `.img-cover`, `.img-contain`, `.global-label`
- **Animation states:** `.pre-anim` (hidden), `.dur-anim` (animating), `.is-active`
- **Component classes:** `.block-text`, `.media-wrapper`, `.video-wrapper`
- **State classes:** `.scrolling`, `.menu-expanded`, `.loading`

**Rule:** ALL CSS goes in `cn-` prefixed files (e.g., `app/cn-landing.css`) using the original selectors. Imported into `globals.css` via `@import`. CSS-first, Tailwind-second. Never convert semantic CSS to Tailwind utilities. Never modify the user's existing CSS.

**Human checkpoint:** "Here's the extracted design system, [X] colors, [X] font styles, [X] spacing tokens. Confirm before I proceed to animations."

---

## Phase 3: Extract All Animations

Read `references/animation-extraction.md` before executing this phase.

**HARD GATE CHECK: Is Phase 2 marked VERIFIED in PROGRESS.md? If NO → finish Phase 2 first.**

### Step 3.1: Identify ALL Animation Systems
Search every JS bundle. Common patterns by library:

| Library | Search terms |
|---------|-------------|
| GSAP | `gsap.to`, `gsap.from`, `ScrollTrigger`, `timeline`, `ScrambleText` |
| Framer Motion | `motion.div`, `useAnimation`, `useInView`, `AnimatePresence` |
| anime.js | `anime(`, `anime.timeline` |
| CSS only | `@keyframes`, `transition`, `animation` in stylesheets |
| IntersectionObserver | `IntersectionObserver`, `isIntersecting` |
| Lottie | `lottie`, `dotlottie`, `.lottie` files |
| Custom directives | `v-headline`, `data-scroll`, framework-specific |

### Step 3.2: Extract Text Reveal Animations
Look for: character scramble, word-by-word fade, line-by-line clip reveals.
Extract: character set, speed, stagger, delay, easing, trigger method.
See starter template: `useHeadlineReveal` in `references/starter-templates.md`.

### Step 3.3: Extract Media Transitions
Look for: PixelReveal grids, blur transitions, clip-path reveals, scale entrances.
See starter templates: `PixelReveal`, `VideoPlayer` in `references/starter-templates.md`.

### Step 3.4: Extract Scroll Animations
For each section find: parallax, scrub, pin, scale/fade sequences, background effects.

### Step 3.5: Extract Easing & Timing
Map ALL easing values. Register as CSS custom properties.
Common: `power2.out` ≈ `cubic-bezier(.33, 1, .68, 1)`.

### Step 3.6: Extract Interactions
Buttons, nav links, accordions, cards, cursors, mobile menus.

---

## Phase 4: Build the Component Architecture

Read `references/component-patterns.md` for project structure.
Read `references/starter-templates.md` for reusable code, copy these as your starting point.

**HARD GATE CHECK: Do ALL of these exist?**
1. `reference/clone.html`: with real page content
2. `reference/PROGRESS.md`: with Phase 1 and Phase 2 marked VERIFIED
3. `reference/extracted-colors.md`: with source evidence
4. `reference/extracted-typography.md`: with source evidence

**If ANY are missing, STOP. You are not ready to build. Go back to the phase you skipped.**

### Step 4.1: Scaffold the Project
Copy starter templates for foundational files first:
- `lib/gsap.ts`, `lib/utils.ts`, `lib/headline-reveal.ts`
- `components/ui/pixel-reveal.tsx`, `video-player.tsx`, `lines.tsx`, `button.tsx`, `accordion-item.tsx`, `arrow-icon.tsx`
- `components/ui/lenis-provider.tsx`
- `app/layout.tsx`

Adapt each to the target site's specifics (colors, fonts, animation params).

### Step 4.2: Build Sections Top-to-Bottom
For EACH section:
1. Find it in `reference/raw-pretty.html`
2. Copy EXACT class names
3. Replicate EXACT DOM nesting and element order
4. Write CSS in the `cn-` CSS file using original selectors
5. Only inline styles for truly dynamic values
6. Add animations with extracted parameters
7. Verify against original before next section

### Step 4.3: Handle Client-Rendered Content
If a section is on the live site but NOT in static HTML:
1. It's client-rendered (CMS, SPA framework)
2. Search JS bundles for content text
3. Check for API/CMS preload payloads in the HTML
4. Hardcode the content, we clone the output, not the CMS

---

## Phase 5: Self-Verification (MANDATORY)

**Scripts are the judge, Claude is the worker. Never self-grade.**

### Step 5.1: Run the Full Verification Suite

```bash
bash scripts/verify/run-all-verifications.sh .
```

This runs all 14 verification scripts and outputs a summary: PASS/FAIL per script + total score.

### Step 5.2: Fix All Failures

For each FAIL:
1. Read the script's detailed output to understand what's wrong
2. Fix the issue in the relevant file
3. Re-run ONLY the failed script to confirm the fix
4. Repeat until PASS

### Step 5.3: Run Verification Agents (Structural Review)

After all scripts pass, use `superpowers:dispatching-parallel-agents` to run review agents. Each agent receives its prompt from `dispatch-phase.js`:

- **Agent 1: Structural**: compare DOM nesting and element order against source HTML (scripts catch counts, agents catch ordering/semantics)
- **Agent 2: Visual**: compare CSS layout patterns, responsive behavior, visual hierarchy
- **Agent 3: Animation**: verify animation sequences, triggers, and timing feel correct (scripts catch params, agents catch behavior)

### Step 5.4: Final Gate

Run `run-all-verifications.sh` one final time. ALL scripts must PASS. Then invoke `superpowers:verification-before-completion` before telling the user "done."

### Step 5.5: Update Phase File

Write results into `reference/phases/phase-5.md`. Mark phase 5 as VERIFIED in PROGRESS.md.

---

## Phase 6: Disclosure Report (MANDATORY)

**Purpose:** Be transparent with the user about what was copied perfectly, what was approximated, and what couldn't be replicated. This skill is built for teams, honesty builds trust.

**This phase is NOT optional.** Even if everything was copied perfectly, the report must be generated to confirm that. **The agent CANNOT say "done" until this report is presented inline in the conversation.**

### Step 6.1: Audit All Sections

Review every component built in Phase 4 against the original source. For each section, classify elements into three categories:

1. **Copied 1:1**: Extracted directly from source HTML/CSS/JS. Exact values used.
2. **Approximated**: Visual match but exact values couldn't be extracted (e.g., buried in minified JS, dynamically computed, requires premium plugins).
3. **Not Implemented**: Feature exists on original but was skipped entirely.

### Step 6.2: Generate Disclosure Report

Create `reference/phases/phase-6-disclosure.md` with this structure:

```markdown
# Disclosure Report: [Site Name]

## What Was Copied 1:1
- [List every element/section that was extracted exactly from source]
- Include: colors, fonts, spacing, layout, static content, SVGs, images

## What Was Approximated
For each approximated element:
- **What:** [Element/feature name]
- **Why:** [Specific reason, e.g., "Animation parameters buried in 296KB minified JS bundle", "Requires GSAP premium plugin (ScrambleText)", "Values computed at runtime by JS"]
- **What We Did Instead:** [The alternative approach used]
- **How Close:** [Honest assessment, "Very close", "Similar feel but different timing", etc.]

## What Was Not Implemented
For each missing feature:
- **What:** [Feature name]
- **Why:** [Reason, e.g., "Requires backend/CMS", "Premium third-party service", "Would need reverse-engineering proprietary algorithm"]
- **Alternatives:** [Suggestions the user could try, other libraries, manual implementation, etc.]

## Summary
- Total sections: X
- Copied 1:1: X
- Approximated: X
- Not implemented: X
```

### Step 6.3: Present to User

Print the disclosure report directly in the conversation. Do NOT just say "see the file", the user should see the full report inline. Format it clearly so the user can scan it quickly.

### Step 6.4: Offer Next Steps

After presenting the report, ask:
- "Would you like me to try harder on any of the approximated items?"
- "Would you like alternative animation approaches for any section?"
- "Should I attempt any of the not-implemented features with a different approach?"

### Step 6.5: Update Phase File

Write results into `reference/phases/phase-6-disclosure.md`. Mark ALL phase files as VERIFIED in PROGRESS.md.

---

## Superpowers Integration

| Situation | Skill |
|-----------|-------|
| Animation broken, can't find cause | `superpowers:systematic-debugging` |
| 2+ independent sections to build | `superpowers:dispatching-parallel-agents` |
| Final check before telling user "done" | `superpowers:verification-before-completion` |
| Complex multi-section plan | `superpowers:executing-plans` |
| Deterministic verification of clone output | `scripts/verify/run-all-verifications.sh` |

---

## Rules & Guardrails

### Absolute Rules
1. **Every value from original.** Never invent colors, sizes, fonts, spacing, content.
2. **CSS-first.** Original selectors in `cn-` prefixed CSS files (e.g., `cn-landing.css`). Imported into `globals.css` via `@import`. Tailwind only for layout utilities the original used.
3. **No creative additions.** The original IS the spec.
4. **Self-verify before reporting.** Never say "done" with known issues.
5. **Exact class names.** Copy the full class string from original HTML.
6. **No inline style duplication.** If it's in CSS, remove the inline version.
7. **Vendor prefixes.** `-webkit-`, `-moz-`: include them.
8. **Empty elements stay.** Don't remove "unnecessary" empty elements.
9. **Content verbatim.** Typos, em-dashes, special chars, copy exactly.
10. **Original section order.** DOM order from HTML, unless CMS dictates otherwise.

### Animation Rules
11. **GSAP ScrambleTextPlugin is premium.** Build custom implementation (see starter templates).
12. **PixelReveal is per-media.** Each video/image gets its own instance.
13. **`gsap.context()` in `useEffect`.** Always `return () => ctx.revert()`.
14. **`pre-anim` = `visibility: hidden`.** Never remove this pattern.

### CSS Rules
15. **Isolated `cn-` CSS files.** Small sites (<500 lines): one `cn-landing.css`. Multi-page or large sites: `cn-global.css` + per-page files (`cn-landing.css`, `cn-about.css`). All imported into `globals.css` via `@import`. User's existing CSS is never touched.
16. **Deduplicate `@keyframes`.** Check before adding.
17. **Original breakpoints.** Exact `px` values, not Tailwind `md`/`lg`.

### Enforcement Rules
18. **Phase files before code.** You cannot write a single `.tsx` or `.css` file until `reference/PROGRESS.md` and all 6 phase files exist. No exceptions.
19. **Evidence before extraction.** Every extracted value (color, font size, spacing) must have a source citation: which file, which selector, which line. "I think it's blue" is not extraction.
20. **Fetch escalation is mandatory.** When the first fetch attempt returns empty/CSR content, you MUST follow ALL 5 steps of the Fetch Escalation Ladder before concluding the page can't be fetched. Stopping after step 1 is a skill violation.
21. **Checkpoints are blocking.** In CONFIRM mode, when the skill says "Human checkpoint", you STOP and wait for user response. You do not continue. You do not say "I'll proceed unless you object." You stop.
22. **No partial compliance.** "I followed the spirit of the skill" is not compliance. Either the phase files exist, the extraction evidence is saved, and the disclosure report is generated, or the skill was not followed.
23. **Disclosure is the exit ticket.** You cannot claim completion without Phase 6. Period. If you find yourself typing "done" or "all components are written" without having generated a disclosure report, STOP and go do Phase 6.

### Common Pitfalls (Auto-Updated)
24. **Double-nested wrappers.** Child component has its own wrapper → don't wrap again in parent.
25. **Missing CSS sections.** After writing components, verify every section has CSS in globals.css.
26. **Partial inline cleanup.** When moving styles to CSS, remove ALL inline properties, partial causes conflicts.
27. **CMS-rendered content.** Visible on live site but not in HTML = client-rendered. Don't delete.
28. **Wrong section order.** CMS payload order ≠ DOM render order. Verify against live site.
29. **Duplicate @keyframes.** Search globals.css before adding any new keyframe definition.
30. **Grep is not extraction.** Running `grep` on raw CSS and copying hex values is NOT a design system extraction. Phase 2 requires semantic mapping: what role does each color play, what elements use each font size, what spacing pattern repeats across sections. Extract the SYSTEM, not just the values.
31. **CSR is not an excuse.** Wix, Next.js, Nuxt, Gatsby, all render client-side. This is common, not exceptional. The Fetch Escalation Ladder exists for this. Use it.

### Context Persistence Rules
32. **Phase files are mandatory.** Before any build work, create `reference/PROGRESS.md` and `reference/phases/phase-{1-6}.md`. These are the source of truth for what has been done and what remains.
33. **Re-invoke before every phase.** Before starting any phase, re-read `PROGRESS.md` and the phase file. This re-injects instructions into context after compression. Never rely on memory of skill instructions from earlier in the conversation.
34. **Never advance without verification.** Each phase file has acceptance criteria. Verify them against source HTML/CSS before marking complete. If verification fails, fix issues and re-verify. Never skip a phase, if a phase doesn't apply (e.g., no animations), document why in the phase file results and mark as VERIFIED with justification.

---

## Self-Learning

### Auto-Update Rules
> Every time the user corrects output, add the pattern to "Common Pitfalls" above.

### Save New Patterns
> When a new animation type or technique is discovered, update the relevant reference file.

### Auto-Update Anti-Rationalization List
> Every time the agent skips a phase and gets called out, add the specific rationalization used to the Anti-Rationalization List with an explanation of why it was wrong.

---

## Tech Stack (Default)

| Layer | Tool |
|-------|------|
| Framework | Next.js App Router + TypeScript |
| Styling | Tailwind CSS v4 (`@theme inline`) + `cn-` prefixed CSS files |
| Animations | GSAP + ScrollTrigger (default for JS-animated sites) |
| Text Reveal | `useHeadlineReveal` custom hook |
| Media Reveal | `<PixelReveal>` component |
| Smooth Scroll | Lenis |
| Lottie | `@lottiefiles/dotlottie-react` |
| 3D | `@react-three/fiber` + `drei` (only if needed) |
| Icons | Inline SVG extracted from original |
