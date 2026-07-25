<p align="center">
  <img src="https://img.shields.io/badge/Claude-Skills-blueviolet?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDdWMTdMMTIgMjJMMjAgMTdWN0wxMiAyWiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+" alt="Claude Skills" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock" alt="GSAP" />
  <img src="https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js" alt="Three.js" />
</p>

<h1 align="center">Kakashi + Animation Forge ✧ カカシ</h1>

<p align="center">
  Claude skills that turn any reference website into a production-ready Next.js codebase<br/>
  and add professional animations, without needing frontend or design experience.<br/><br/>
  <i>...座って。全部やるから。</i> <code>(◕‿◕)</code>
</p>

---

## The Workflow ✧ 作業の流れ

This is how we build landing pages at Lens. It's fast, it produces professional results, and you don't need to be a designer or frontend developer to use it.

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                                                                      │
 │   1. FIND    ✧ 探す     Find a great reference website               │
 │       │                 (same industry = better results)             │
 │       ▼                                                              │
 │   2. CLONE   ✧ 写す     "Clone this site" → Kakashi builds it        │
 │       │                 You get: Next.js + Tailwind + all components │
 │       ▼                                                              │
 │   3. REWRITE ✧ 書く     Replace the copy with YOUR content           │
 │       │                 Product name, features, messaging            │
 │       ▼                                                              │
 │   4. ASSETS  ✧ 素材     Swap images/videos with your own             │
 │       │                 (or generate with AI: Midjourney, Runway)    │
 │       ▼                                                              │
 │   5. ANIMATE ✧ 動かす   "Add scroll animations" → Animation Forge    │
 │       │                 Pick from a menu, it builds + wires in       │
 │       ▼                                                              │
 │   6. SHIP    ✧ 届ける   Production-ready landing page                │
 │                        ...もう関わることないけど、頑張ってね。(￣ω￣)│
 │                                                                      │
 └──────────────────────────────────────────────────────────────────────┘
```

### Why this works

- **You skip design.** A good reference website was designed by a professional. You inherit their layout, spacing, typography, and color decisions, all the hard stuff.
- **You skip frontend.** Kakashi extracts everything into clean React components. Animation Forge adds motion without writing GSAP or Three.js code.
- **You keep quality.** The reference gives you a proven foundation. Your changes (copy, assets, small tweaks) stay within the design language.

*...簡単でしょ？* `(◕‿◕)`

---

## The Golden Rule ✧ 黄金律

> **If you don't have strong design taste, stay close to your reference.**
>
> The reference website was built by a good designer. Every section, every spacing choice, every color was intentional. When you add new sections, build them from patterns that already exist in the cloned codebase, same fonts, same spacing, same component structure.
>
> Going too far from the reference is where things break. A section that "doesn't feel right" usually means you invented something instead of reusing what was already there.

*...遠くに行きすぎないで。迷子になるから。* `( ˘ω˘ )`

---

## Setup (One-Time) ✧ セットアップ

### Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- Node.js 18+
- Python 3 (for asset download scripts)

### Install the Skills

```bash
# Clone this repo
git clone https://github.com/ELATTAR-Ayoub/kakashi.git
cd kakashi

# Install all three skills
cp -r skills/kakashi          ~/.claude/skills/kakashi
cp -r skills/kakashi-fast    ~/.claude/skills/kakashi-fast
cp -r skills/animation-forge  ~/.claude/skills/animation-forge
```

That's it. All skills trigger automatically, no slash commands needed.

*...インストール完了。* `(•̀ᴗ•́)و`

---

## Step-by-Step Tutorial ✧ 手順書

### Step 1: Find a Reference Website ✧ 探す

Browse sites in the same industry as what you're building. Good sources:

- [Awwwards](https://www.awwwards.com/), award-winning designs
- [Godly](https://godly.website/), curated landing pages
- [Lapa Ninja](https://www.lapa.ninja/), landing page inspiration
- [SaaS Landing Page](https://saaslandingpage.com/), SaaS-specific

**Tips for choosing a reference:**
- Pick something in the same industry (SaaS → SaaS, fintech → fintech)
- Look for sites with the right number of sections (don't pick a 20-section site for a simple landing)
- Dark sites clone better than light sites (fewer subtle shadow issues)
- Sites with GSAP animations give the best results (Kakashi is optimized for GSAP)

*...いいリファレンスを見つけたら、もう半分終わったようなもの。* `(￣ω￣)`

### Step 2: Clone It ✧ 写す

Open Claude Code in an empty directory and say:

```
Clone this website for me: https://example-reference.com
Make it pixel-perfect.
```

**Or** if you saved the HTML manually:

```
I saved the reference site at reference/clone.html.
Rebuild it as Next.js + Tailwind components. Pixel-perfect.
```

**What happens behind the scenes:**

Kakashi will:
1. Scaffold a Next.js project (`npx create-next-app`)
2. Download all assets (CSS, JS, fonts, images, videos)
3. Detect the tech stack (GSAP? Framer Motion? Three.js?)
4. Extract the full design system (colors, fonts, spacing, breakpoints)
5. Reverse-engineer every animation from the JS bundles
6. Build every section as a React component
7. Run 4 verification agents to check accuracy
8. Deliver a working, buildable project

You don't need to do anything during this process. Go get coffee.

*...コーヒー飲んできて。戻る頃には終わってる。* `(◕‿◕)`

### Step 3: Rewrite the Copy ✧ 書く

Now you have a working clone. Open it and replace the content:

```
Change all the text on the landing page to reflect our product.
Here's our web copy:

Hero: "Lens OS: The Operating System for Construction"
Subtitle: "AI-powered plan review that catches what humans miss"
...
```

**The structure stays the same**: same sections, same layout, same components. Only the words change.

### Step 4: Swap Assets ✧ 素材

Replace the reference's images and videos with your own:

```
Replace the hero video with /public/assets/lens-demo.mp4
Replace the product screenshots with our actual UI screenshots in /public/assets/
```

**If you don't have assets yet**, generate them:
- **Images:** Midjourney, DALL-E, or Ideogram
- **Videos:** Runway, Kling, or screen recordings
- **Icons:** Keep the originals or use Lucide/Heroicons

### Step 5: Add Animations ✧ 動かす

This is where it gets fun. Say something like:

```
Add some nice animations to this landing page.
Make it feel premium and alive.
```

Animation Forge will:
1. Read your page
2. Find animation opportunities
3. Present options in plain English:

```
I found 4 places where animations would improve this page:

1. HERO ENTRANCE: The hero loads all at once. Options:
   (a) Cascade, headline, then subtitle, then CTA slide up in sequence
   (b) Fade + blur, everything fades in with a soft blur dissolve
   (c) Scramble text, headline characters scramble before revealing

2. FEATURE CARDS: Cards appear statically. Options:
   (a) Stagger, cards slide up one-by-one as you scroll
   (b) Scale pop, cards scale up with a gentle bounce
   (c) 3D tilt, cards tilt toward your cursor on hover

3. STATS SECTION: Numbers are just text. Options:
   (a) Count up, numbers animate from 0 to their value
   (b) Count up + progress bars, numbers count with visual bars

4. BACKGROUND: Page feels flat. Options:
   (a) Floating geometry, subtle 3D shapes in the background
   (b) Particle field, floating dots that drift slowly
   (c) Gradient blob, organic shape that slowly morphs

...お好みは？ (◕‿◕)

Pick: (e.g., "1a, 2c, 3a, 4b")
```

Just pick the letters. It builds everything and wires it in.

*...迷ったら、全部試せばいい。* `(￣ω￣)`

### Step 6: Fine-Tune and Ship ✧ 届ける

At this point you have a production-ready landing page. Common final touches:

```
Make the scroll animations a bit faster
Change the accent color to our brand blue #2563EB
Add our logo to the header
Make the mobile menu work
```

Build and deploy:
```bash
npm run build    # Verify it compiles
npm run dev      # Preview locally
```

*...完了。お疲れ様。* `(•̀ᴗ•́)و`

---

## Example Prompts ✧ 使い方の例

Here are real prompts you can copy and use:

### Cloning
```
Clone https://linear.app, pixel-perfect, every animation.
```
```
I saved the HTML at reference/clone.html. Rebuild as Next.js components.
They use GSAP for animations and custom fonts. Pixel-perfect.
```

### Replacing Content
```
Replace all the text with our Lens Platform copy.
Keep the same layout and design, just change the words.
Here's our copy: [paste your content]
```

### Adding Animations
```
Add scroll animations to this page. Make the sections reveal
as the user scrolls down.
```
```
I want a 3D globe in the hero section background.
Use our brand colors: #0F172A and #3B82F6.
```
```
Make the pricing cards have a hover effect
something subtle and premium.
```
```
Add a text scramble animation to the hero headline,
like the one on scoutco.ai.
```

### Staying Close to the Reference
```
I need a new testimonials section. Build it using the same
design patterns as the existing sections, same fonts, spacing,
and component structure. Don't invent a new style.
```

---

## What's Included ✧ 中身

### Kakashi: Pixel-Perfect Cloner `(•̀ᴗ•́)و`

| File | Purpose |
|------|---------|
| `SKILL.md` | Core process (254 lines) |
| `scripts/fetch-page.sh` | Download + prettify HTML |
| `scripts/download-assets.py` | Download CSS, JS, fonts, images, videos |
| `scripts/detect-stack.py` | Identify framework + animation library |
| `scripts/extract-design-system.py` | Extract colors, fonts, spacing → JSON |
| `scripts/search-animations.sh` | Find animation patterns in JS bundles |
| `scripts/verify-build.sh` | TypeScript + Next.js build checks |
| `references/starter-templates.md` | 11 battle-tested React components |
| `references/animation-extraction.md` | 9 animation patterns + grep patterns |
| `references/component-patterns.md` | Project structure + CSS organization |
| `references/example-output.md` | What a finished clone looks like |
| `evals/evals.json` | 3 test cases for skill validation |

### Animation Forge: Animation Builder `(◕‿◕)`

| File | Purpose |
|------|---------|
| `animation-forge/SKILL.md` | Core process (221 lines) |
| `animation-forge/references/gsap-recipes.md` | 10 ready-to-use GSAP components |
| `animation-forge/references/threejs-recipes.md` | 5 ready-to-use 3D scenes |
| `animation-forge/references/reactbits-catalog.md` | 52 ReactBits components cataloged |

### GSAP Recipes ✧ レシピ集

| Recipe | What it does |
|--------|-------------|
| Stagger Entrance | Elements slide up one-by-one on page load |
| Scroll Reveal | Elements animate in when scrolled into view |
| Parallax | Background moves at different speed than content |
| Counter | Numbers count up from 0 when visible |
| Magnetic Button | Button subtly follows cursor on hover |
| Tilt Card | Card tilts toward cursor (3D perspective) |
| Scramble Text | Characters scramble before revealing real text |
| Stagger List | List items animate in one-by-one on scroll |
| Clip Reveal | Content reveals via expanding clip-path |
| Scroll Progress | Progress bar fills as user scrolls |

### Three.js Scenes ✧ 3Dシーン

| Scene | What it does |
|-------|-------------|
| Floating Geometry | Subtle rotating 3D shapes in background |
| Particle Field | Floating particles that drift slowly |
| Interactive Globe | Wireframe globe that rotates and responds to cursor |
| Abstract Blob | Organic morphing 3D blob |
| Lazy 3D Wrapper | Only loads 3D when visible (performance) |

---

## FAQ ✧ よくある質問

**Q: Do I need to know React/TypeScript/GSAP?**
No. Kakashi builds the codebase. Animation Forge adds animations. You just pick from menus and provide your content.

*...知らなくて大丈夫。全部やるから。* `(◕‿◕)`

**Q: What if the reference site uses Framer Motion instead of GSAP?**
Kakashi detects the animation library automatically and adapts. GSAP is the default for rebuilding because it's more flexible.

**Q: Can I clone any website?**
Technically yes, but results are best with marketing/landing pages. Complex web apps (dashboards, editors) are harder to clone perfectly.

**Q: What if I want to add a section that doesn't exist in the reference?**
Ask Claude to build it using the existing design patterns. The golden rule: stay close to what's already there.

*...既にあるものを使って。新しいものを発明しないで。* `( ˘ω˘ )`

**Q: How do I handle responsive/mobile?**
Kakashi extracts the original breakpoints and mobile styles automatically. They're included in `globals.css`.

**Q: What about SEO, metadata, Open Graph?**
Kakashi extracts the original metadata. Update it with your own content in `app/layout.tsx`.

---

<p align="center">
  Built for the Lens team. Works for anyone building landing pages with Claude.<br/><br/>
  ✧ <i>...また何かあったら呼んで。ここにいるから。</i> <code>(￣ω￣)</code> ✧
</p>
