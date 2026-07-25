# ReactBits Animation Catalog

Source: https://reactbits.dev — open source, copy-paste React components.

When a ReactBits component fits the user's request, fetch the code from the URL and adapt to their theme. Components are framework-agnostic React — they work in any Next.js project.

---

## Text Animations

| Component | What it does | URL path | Good for |
|-----------|-------------|----------|----------|
| **Split Text** | Text splits into individual characters/words that animate in | `/text-animations/split-text` | Hero headlines, section titles |
| **Blur Text** | Text fades in with a blur-to-sharp effect | `/text-animations/blur-text` | Subtle headline entrances |
| **Circular Text** | Text wraps around a circle, rotating | `/text-animations/circular-text` | Decorative badges, logos |
| **Text Type** | Typewriter effect, characters appear one by one | `/text-animations/text-type` | Terminal-style, chat interfaces |
| **Shuffle** | Characters shuffle/scramble before settling | `/text-animations/shuffle` | Tech/hacker aesthetic |
| **Shiny Text** | Shimmer/shine effect sweeps across text | `/text-animations/shiny-text` | CTAs, premium labels |
| **Text Pressure** | Text reacts to cursor proximity (size/weight changes) | `/text-animations/text-pressure` | Interactive headers, experimental |
| **Curved Loop** | Text follows a curved path, looping | `/text-animations/curved-loop` | Decorative, marquee-style |
| **Fuzzy Text** | Text has a fuzzy/vibrating effect | `/text-animations/fuzzy-text` | Attention-grabbing, playful |
| **Gradient Text** | Animated gradient sweeps through text | `/text-animations/gradient-text` | Hero text, branding |
| **Falling Text** | Characters fall/drop into place | `/text-animations/falling-text` | Dramatic reveals |
| **Text Cursor** | Custom animated cursor follows text | `/text-animations/text-cursor` | Text editors, writing interfaces |
| **Decrypted Text** | Text decrypts character-by-character (Matrix-style) | `/text-animations/decrypted-text` | Tech products, security themes |
| **True Focus** | Text blurs except where cursor/focus is | `/text-animations/true-focus` | Reading focus, highlighting |
| **Scroll Float** | Text floats/moves based on scroll position | `/text-animations/scroll-float` | Parallax text, editorial |
| **Scroll Reveal** | Text reveals as user scrolls | `/text-animations/scroll-reveal` | Long-form content, storytelling |
| **ASCII Text** | Text rendered in ASCII art style | `/text-animations/ascii-text` | Dev tools, terminal aesthetic |
| **Scrambled Text** | Text scrambles then resolves (similar to Shuffle) | `/text-animations/scrambled-text` | Tech, cyberpunk |
| **Rotating Text** | Text rotates through multiple strings | `/text-animations/rotating-text` | Taglines, feature lists |
| **Glitch Text** | Text glitches with distortion effect | `/text-animations/glitch-text` | Edgy, tech, gaming |
| **Scroll Velocity** | Text speed changes based on scroll velocity | `/text-animations/scroll-velocity` | Marquee, dynamic headers |
| **Variable Proximity** | Font weight/size varies by cursor distance | `/text-animations/variable-proximity` | Experimental, interactive |
| **Count Up** | Numbers count up from 0 to target | `/text-animations/count-up` | Stats, dashboards, metrics |

## General Animations

| Component | What it does | URL path | Good for |
|-----------|-------------|----------|----------|
| **Animated Content** | Content animates in with configurable entrance | `/animations/animated-content` | Any section entrance |
| **Fade Content** | Simple fade in/out | `/animations/fade-content` | Subtle reveals |
| **Electric Border** | Animated electric/glowing border | `/animations/electric-border` | Cards, CTAs, premium feel |
| **Orbit Images** | Images orbit around a center point | `/animations/orbit-images` | Feature showcases, team pages |
| **Pixel Transition** | Content transitions via pixel dissolve | `/animations/pixel-transition` | Page transitions, image reveals |
| **Glare Hover** | Glare/shine follows cursor on hover | `/animations/glare-hover` | Cards, product images |
| **Antigravity** | Elements float upward defying gravity | `/animations/antigravity` | Playful, creative pages |
| **Logo Loop** | Logo carousel/loop | `/animations/logo-loop` | Partner logos, client lists |
| **Target Cursor** | Crosshair/target follows cursor | `/animations/target-cursor` | Gaming, precision tools |
| **Magic Rings** | Concentric rings animate | `/animations/magic-rings` | Loading states, backgrounds |
| **Laser Flow** | Laser/light beam animation | `/animations/laser-flow` | Tech, sci-fi aesthetic |
| **Magnet Lines** | Lines attract toward cursor | `/animations/magnet-lines` | Interactive backgrounds |
| **Ghost Cursor** | Ghostly trail follows cursor | `/animations/ghost-cursor` | Creative, experimental |
| **Gradual Blur** | Content gradually blurs on scroll/interaction | `/animations/gradual-blur` | Depth, focus effects |
| **Click Spark** | Spark/particle burst on click | `/animations/click-spark` | Micro-interaction, delight |
| **Magnet** | Elements attract toward cursor | `/animations/magnet` | Magnetic buttons, interactive |
| **Sticker Peel** | Element peels like a sticker | `/animations/sticker-peel` | Playful reveals |
| **Pixel Trail** | Pixelated trail follows cursor | `/animations/pixel-trail` | Gaming, retro aesthetic |
| **Cubes** | 3D cube animations | `/animations/cubes` | Tech, data visualization |
| **Metallic Paint** | Metallic paint/chrome effect | `/animations/metallic-paint` | Premium, luxury feel |
| **Noise** | Animated noise/grain texture | `/animations/noise` | Film grain, texture |
| **Shape Blur** | Blurred shape animations | `/animations/shape-blur` | Abstract backgrounds |
| **Crosshair** | Crosshair overlay | `/animations/crosshair` | Precision, targeting UI |
| **Image Trail** | Images trail behind cursor | `/animations/image-trail` | Portfolio, gallery |
| **Ribbons** | Flowing ribbon animations | `/animations/ribbons` | Decorative backgrounds |
| **Splash Cursor** | Paint splash follows cursor | `/animations/splash-cursor` | Creative, artistic |
| **Meta Balls** | Metaball/blob merging animation | `/animations/meta-balls` | Abstract, organic backgrounds |
| **Blob Cursor** | Blob follows cursor | `/animations/blob-cursor` | Soft, organic cursor |
| **Star Border** | Animated star/sparkle border | `/animations/star-border` | Premium cards, highlights |

---

## How to Use ReactBits Components

1. Pick the component from the table above
2. Fetch the code: `WebFetch https://reactbits.dev/<url-path>`
3. If WebFetch can't get the code (SPA), search GitHub: `https://github.com/DavidHDev/react-bits`
4. Copy the component into the project's `components/ui/` directory
5. Adapt colors and easing to match the project's theme
6. Import and use in the target page
