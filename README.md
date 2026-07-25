<p align="center">
  <img src="https://img.shields.io/badge/Claude-Skills-blueviolet?style=for-the-badge" alt="Claude Skills" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=for-the-badge&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock" alt="GSAP" />
</p>

<h1 align="center">Kakashi ✧ カカシ</h1>

<p align="center">
  Claude Code skills that clone any website into a production-ready<br/>
  Next.js + Tailwind + TypeScript codebase.
</p>

---

## Two ways to clone

They produce the same kind of output — a Next.js + Tailwind + TypeScript project. They differ in **how they reproduce the motion**, and that is the whole decision.

| | [`kakashi`](skills/kakashi) | [`lens-copy-web-1`](skills/lens-copy-web-1) |
|---|---|---|
| **Strategy** | **Reimplementation** — extract the design system, then rebuild components and rewrite animations yourself | **Engine adoption** — reproduce the DOM byte-identically, then run the *original site's own CSS and JS* on it |
| **You own the code** | Yes — idiomatic React you can modify | Partly — the vendored engine is a black box you must not edit |
| **Motion fidelity** | Very close, but reimplemented motion can drift | Exact — it *is* the original code |
| **Process** | 6 enforced phases, 17 verification scripts | 6 phases, verified via live engine state |
| **Use when** | You need to own and change the animations, or the original JS can't run standalone | You want a pixel-and-motion-perfect replica and the original JS is reusable |

**Rule of thumb:** if the original's own JS can be reused, start with `lens-copy-web-1` — it is the higher-fidelity approach. Fall back to `kakashi` when the JS is inseparable from a live backend, is an obfuscated anti-bot bundle, or when you explicitly want the motion rebuilt in React so you can own it.

### `animation-forge`

A companion skill, not a cloner. After you have a page, it adds scroll effects, 3D, hover states, and text reveals from a menu — you pick, it wires GSAP/Three.js in. Referenced by the `kakashi` workflow.

---

## Install

```bash
git clone https://github.com/ELATTAR-Ayoub/kakashi.git
cd kakashi

cp -r skills/kakashi          ~/.claude/skills/kakashi
cp -r skills/lens-copy-web-1  ~/.claude/skills/lens-copy-web-1
cp -r skills/animation-forge  ~/.claude/skills/animation-forge
```

**Prerequisites:** [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Node.js 18+, Python 3 (asset download scripts).

`kakashi` also expects the Superpowers plugins:

```
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
/plugin install frontend-design@claude-plugins-official
```

Skills trigger automatically from what you ask — no slash commands needed.

---

## Repo layout

```
skills/
  kakashi/              Reimplementation cloner
    SKILL.md              6 phases + enforcement gates
    README.md             Full tutorial and workflow
    references/           Animation extraction, component patterns, starter templates
    scripts/              Capture: fetch-page.sh, download-assets.py, detect-stack.py,
                          extract-design-system.py, search-animations.sh
    scripts/verify/       17 verification scripts — the clone grades itself
    evals/                Eval cases
  lens-copy-web-1/      Engine-adoption cloner
  animation-forge/      Animation companion
```

---

## Why `kakashi` is phase-gated

The skill was hardened after a repeated failure mode: the agent acknowledges the skill, then skips straight to writing components and invents values it never extracted. So the skill enforces itself:

- **5 hard gates** — no code before the page is captured, before `PROGRESS.md` exists, before the design system is extracted; no "done" before the disclosure report.
- **Fetch escalation ladder** — 5 mandatory steps before it may claim a page can't be fetched. "It's a CSR site" is not an excuse.
- **Anti-rationalization list** — the specific excuses the agent has used before, each with why it's invalid.
- **Blocker protocol** — when stuck it stops and presents options, instead of silently approximating.
- **Phase files** — instructions are re-read from disk before every phase, so context compaction can't erase the extraction work.
- **Scripts are the judge** — the agent never self-grades.

---

## Disclosure and IP

These skills replicate an existing website. **The content, images, logos, fonts, and brand of the source site belong to its owner.** A clone is a starting structure, not something publishable as-is — replace the assets and copy before shipping anything public. Both cloners end with a mandatory disclosure phase reporting what was copied 1:1, what was approximated, and what was skipped.

Use them on sites you own, on references you have the right to adapt, or as scaffolding you then make your own.
