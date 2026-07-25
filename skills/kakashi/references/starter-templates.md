# Starter Templates

Copy these files as your starting point for every project. Adapt colors, fonts, and animation parameters to match the target site.

---

## lib/utils.ts

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## lib/gsap.ts

```typescript
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";

gsap.registerPlugin(ScrollTrigger);

type GsapCtx = ReturnType<typeof gsap.context> | null;

// Shared easing, ADAPT these to match the target site
export const EASE = "power2.out";
export const EASE_CSS = "cubic-bezier(.33, 1, .68, 1)";

export const DUR = {
  fast: 0.15,
  color: 0.45,
  bg: 0.65,
  transform: 0.65,
  opacity: 0.55,
} as const;

const GsapCtxReact = createContext<GsapCtx>(null);

export function GsapProvider({ children }: { children: ReactNode }) {
  const ctx = useRef<GsapCtx>(null);

  useEffect(() => {
    ctx.current = gsap.context(() => {});
    return () => ctx.current?.revert();
  }, []);

  return React.createElement(GsapCtxReact, { value: ctx.current }, children);
}

export function useGsapCtxReact() {
  return useContext(GsapCtxReact);
}

export { gsap, ScrollTrigger };
```

---

## lib/headline-reveal.ts

Custom scramble text implementation (GSAP ScrambleTextPlugin is premium/$).
Replicates the common `v-headline` Vue directive pattern found on many Nuxt sites.

```typescript
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// ADAPT: Extract the exact charset from the target site's JS bundles
const SCRAMBLE_CHARS = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz~!@#$%^&*-+=?";

function scrambleReveal(
  element: HTMLElement,
  opts: { duration?: number; staggerAmount?: number; delay?: number } = {}
) {
  const { duration = 0.75, staggerAmount = 0.5, delay = 0 } = opts;
  const originalText = element.textContent || "";
  const chars = originalText.split("");
  if (!chars.length) return null;

  element.innerHTML = chars
    .map((ch) =>
      ch === " "
        ? '<span class="char" style="display:inline-block">&nbsp;</span>'
        : `<span class="char" style="display:inline-block;visibility:hidden">${ch}</span>`
    )
    .join("");

  const charEls = element.querySelectorAll("span.char");
  const totalChars = charEls.length;
  const tl = gsap.timeline({ delay });

  charEls.forEach((charEl, i) => {
    const el = charEl as HTMLElement;
    const original = chars[i];
    if (original === " ") return;

    const charDelay = (i / totalChars) * staggerAmount;
    const scrambleDuration = duration * 0.6;

    const proxy = { progress: 0 };
    tl.to(
      proxy,
      {
        progress: 1,
        duration: scrambleDuration,
        ease: "none",
        onStart: () => { el.style.visibility = "visible"; },
        onUpdate: () => {
          if (proxy.progress < 1) {
            el.textContent = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }
        },
        onComplete: () => {
          el.textContent = original === " " ? "\u00A0" : original;
        },
      },
      charDelay
    );
  });

  tl.eventCallback("onComplete", () => {
    element.textContent = originalText;
  });

  return tl;
}

interface HeadlineRevealOptions {
  headlineSelector?: string;  // e.g., "h1,h2,h5"
  bodySelector?: string;      // e.g., "p,h3"
  animateBody?: boolean;
  rootMargin?: string;        // IntersectionObserver margin
  delay?: number;
  duration?: number;
  animateButtons?: boolean;
  self?: boolean;             // animate the ref element itself
}

export function useHeadlineReveal(
  ref: React.RefObject<HTMLElement | null>,
  options: HeadlineRevealOptions = {}
) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;

    const {
      headlineSelector = "h1,h2,h5,h6",
      bodySelector = "h3,h4,p",
      animateBody = false,
      rootMargin = "0% 0% -10% 0%",
      delay = 0,
      duration = 0.75,
      animateButtons = false,
      self = false,
    } = options;

    const headlineEls = self ? [el] : Array.from(el.querySelectorAll(headlineSelector));
    const bodyEls = animateBody ? Array.from(el.querySelectorAll(bodySelector)) : [];

    // Replace hyphens with non-breaking hyphens (prevents line-break mid-word during animation)
    headlineEls.forEach((h) => { h.innerHTML = h.innerHTML.replaceAll("-", "&#8209;"); });
    bodyEls.forEach((b) => { b.innerHTML = b.innerHTML.replaceAll("-", "&#8209;"); });

    el.classList.add("dur-anim");
    headlineEls.forEach((h) => { (h as HTMLElement).style.visibility = "hidden"; });
    bodyEls.forEach((b) => { (b as HTMLElement).style.visibility = "hidden"; });

    const buttons = animateButtons ? el.querySelectorAll(".button, a.group") : [];
    buttons.forEach((btn) => { (btn as HTMLElement).style.opacity = "0"; });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasAnimated.current) return;
          hasAnimated.current = true;
          observer.unobserve(entry.target);

          el.classList.remove("pre-anim");
          const masterTl = gsap.timeline();

          headlineEls.forEach((h, i) => {
            const htmlEl = h as HTMLElement;
            htmlEl.style.visibility = "visible";
            const charCount = (h.textContent || "").length;
            const staggerAmount = Math.min(0.6, Math.max(0.3, charCount / 50));
            scrambleReveal(htmlEl, { duration, staggerAmount, delay: delay + i * 0.1 });
          });

          if (bodyEls.length) {
            bodyEls.forEach((b, i) => {
              const htmlEl = b as HTMLElement;
              htmlEl.style.visibility = "visible";
              scrambleReveal(htmlEl, { duration, staggerAmount: 0.3, delay: delay + 0.2 + i * 0.05 });
            });
          }

          if (buttons.length) {
            masterTl.fromTo(buttons, { opacity: 0 }, { opacity: 1, visibility: "visible", delay: delay + 0.3 });
          }

          masterTl.eventCallback("onComplete", () => { el.classList.remove("dur-anim"); });
        });
      },
      { root: null, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, options]);
}
```

---

## components/ui/pixel-reveal.tsx

Grid of squares that dissolve to reveal content beneath. Used on videos and images.

```tsx
"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { gsap } from "@/lib/gsap";

// ADAPT: Change to match the target site's background color
const PIXEL_SIZE = 10;

export interface PixelRevealHandle {
  toggle: () => void;
}

interface PixelRevealProps {
  initialVisibility?: "visible" | "hidden";
  duration?: number;
}

export const PixelReveal = forwardRef<PixelRevealHandle, PixelRevealProps>(
  function PixelReveal({ initialVisibility = "visible", duration = 0.5 }, ref) {
    const gridRef = useRef<HTMLDivElement>(null);
    const visibleRef = useRef(initialVisibility === "visible");
    const toggleFnRef = useRef<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
      toggle: () => toggleFnRef.current?.(),
    }));

    useEffect(() => {
      const el = gridRef.current;
      if (!el) return;
      const grid = el;

      let tween: gsap.core.Tween | undefined;

      function buildGrid() {
        grid.innerHTML = "";
        const w = grid.clientWidth;
        const h = grid.clientHeight;
        if (w === 0 || h === 0) return;
        const size = Math.ceil(w / PIXEL_SIZE);
        const cols = Math.ceil(w / size);
        const rows = Math.ceil(h / size);

        for (let c = 0; c < cols; c++) {
          const col = document.createElement("div");
          for (let r = 0; r < rows; r++) {
            const px = document.createElement("div");
            px.style.width = `${size}px`;
            px.classList.add("pixel");
            if (!visibleRef.current) px.style.opacity = "0";
            col.appendChild(px);
          }
          grid.appendChild(col);
        }
      }

      function onResize() { tween?.kill(); buildGrid(); }

      buildGrid();

      toggleFnRef.current = () => {
        tween?.kill();
        buildGrid();
        const pixels = grid.querySelectorAll(".pixel");
        tween = gsap.to(pixels, {
          opacity: visibleRef.current ? 0 : 1,
          duration: duration / 2,
          stagger: { amount: duration, from: "random" },
          onStart: () => { visibleRef.current = !visibleRef.current; },
        });
      };

      window.addEventListener("resize", onResize);
      return () => {
        tween?.kill();
        window.removeEventListener("resize", onResize);
        toggleFnRef.current = null;
      };
    }, [duration]);

    return <div ref={gridRef} className="pixel-grid" />;
  }
);
```

**Required CSS in globals.css:**
```css
.pixel-grid {
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  z-index: 1;
}
.pixel-grid .pixel {
  aspect-ratio: 1;
  background-color: #0b0b0e; /* ADAPT: match the target site's background */
}
```

---

## components/ui/video-player.tsx

Lazy-loading video with integrated PixelReveal.

```tsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { PixelReveal, PixelRevealHandle } from "@/components/ui/pixel-reveal";

interface VideoPlayerProps {
  src: string;
  className?: string;
  wrapperClassName?: string;
  loop?: boolean;
  cover?: boolean;
  pixelReveal?: boolean;
}

export function VideoPlayer({
  src, className, wrapperClassName,
  loop = true, cover = true, pixelReveal = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pixelRef = useRef<PixelRevealHandle>(null);
  const loadedRef = useRef(false);

  const handleLoaded = useCallback(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    pixelRef.current?.toggle();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.src = src;
          video.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={cn("relative", wrapperClassName)}>
      <video
        ref={videoRef} autoPlay muted loop={loop} playsInline
        onCanPlay={handleLoaded}
        className={cn(cover ? "img-cover" : "img-contain", className)}
      />
      {pixelReveal && <PixelReveal ref={pixelRef} />}
    </div>
  );
}
```

---

## components/ui/lines.tsx

Section border decoration with animated entrance (lines expand, plus markers reveal).

```tsx
"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/lib/gsap";

type LinePosition = "top" | "right" | "bottom" | "left";
type PlusPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
type ClipVariant = "top" | "bottom" | "outside" | "none";

interface LinesProps {
  offset?: boolean;
  lines?: LinePosition[];
  plusPositions?: PlusPosition[];
  clipVariants?: Partial<Record<PlusPosition, ClipVariant>>;
  className?: string;
}

export function Lines({ offset, lines = [], plusPositions = [], clipVariants = {}, className }: LinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);

          const hLines = container.querySelectorAll(".line-h");
          const vLines = container.querySelectorAll(".line-v");
          const plusEls = container.querySelectorAll(".plus");

          if (hLines.length) {
            gsap.to(hLines, {
              startAt: { left: "50%", right: "50%" },
              left: "0%", right: "0%",
              onStart: () => { hLines.forEach((el) => el.classList.remove("pre-anim")); },
              ease: "cubic.in", duration: 0.65,
            });
          }

          if (vLines.length) {
            const tl = gsap.timeline({
              onStart: () => { vLines.forEach((el) => el.classList.remove("pre-anim")); },
            });
            tl.to(vLines, { startAt: { height: "0%" }, height: "100%", ease: "cubic.in", duration: 1 });
            if (plusEls.length) {
              tl.from(plusEls, {
                clipPath: "inset(5px 5px 5px 5px)",
                onStart: () => { plusEls.forEach((el) => el.classList.remove("pre-anim")); },
                clearProps: "clipPath",
              });
            }
          } else if (plusEls.length) {
            gsap.from(plusEls, {
              clipPath: "inset(5px 5px 5px 5px)",
              onStart: () => { plusEls.forEach((el) => el.classList.remove("pre-anim")); },
              clearProps: "clipPath",
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("lines pointer-events-none absolute inset-0", offset && "offset", className)}>
      {lines.map((pos) => {
        const isH = pos === "top" || pos === "bottom";
        return (
          <div key={pos} className={cn(
            "line pre-anim absolute bg-border", pos, isH ? "line-h" : "line-v",
            pos === "top" && "top-0 left-0 right-0 h-px",
            pos === "bottom" && "bottom-0 left-0 right-0 h-px",
            pos === "left" && "top-0 left-[var(--left,0)] h-full w-px",
            pos === "right" && "top-0 right-[var(--right,0)] h-full w-px",
          )} />
        );
      })}
      {plusPositions.map((pos) => {
        const clip = clipVariants[pos];
        return (
          <div key={pos} className={cn(
            "plus pre-anim absolute h-[11px] w-[11px] z-[2]", pos, clip && `clip-${clip}`,
            pos === "topLeft" && "left-[var(--left,0)] -top-px -translate-y-1 -translate-x-[5px]",
            pos === "topRight" && "right-[var(--right,0)] -top-px -translate-y-1 translate-x-[5px]",
            pos === "bottomLeft" && "left-[var(--left,0)] -bottom-px top-auto -translate-x-[5px] translate-y-1",
            pos === "bottomRight" && "right-[var(--right,0)] -bottom-px top-auto translate-x-[5px] translate-y-1",
          )}>
            <span className="absolute left-0 top-[5px] h-px w-[11px] bg-storm" />
            <span className="absolute left-0 top-[5px] h-px w-[11px] bg-storm rotate-90" />
          </div>
        );
      })}
    </div>
  );
}
```

---

## components/ui/button.tsx

```tsx
"use client";

import { cn } from "@/lib/utils";
import { ArrowIcon } from "./arrow-icon";

interface ButtonProps {
  variant?: "primary" | "secondary" | "textLink";
  href?: string;
  label: string;
  target?: string;
  className?: string;
}

export function Button({ variant = "primary", href, label, target, className }: ButtonProps) {
  const Tag = href ? "a" : "button";
  const externalProps = target ? { rel: "noopener noreferrer", target } : {};

  return (
    <Tag
      href={href}
      aria-label={label}
      className={cn(
        "group inline-flex items-center cursor-pointer rounded-[4px]",
        "font-grotesk-mono text-[0.778rem] font-bold uppercase leading-none",
        "text-fg-light whitespace-nowrap w-fit transition-[background-color] duration-[0.65s]",
        variant === "primary" && "bg-card p-[4px]",
        variant === "secondary" && "gap-4",
        "hover:text-accent",
        variant === "primary" && "hover:bg-surface",
        className
      )}
      style={{ transitionTimingFunction: "var(--ease-out)" }}
      {...externalProps}
    >
      <span className={cn("transition-colors duration-[0.45s]", variant === "primary" && "px-8")}
        style={{ transitionTimingFunction: "var(--ease-out)" }}>
        {label}
      </span>
      {variant !== "textLink" && (
        <div className={cn(
          "grid place-items-center aspect-square rounded-[4px] transition-[background-color,border-color] duration-[0.45s]",
          variant === "primary" && "h-12 bg-accent",
          variant === "secondary" && "h-9 border border-card bg-transparent",
          "group-hover:border-accent"
        )} style={{ transitionTimingFunction: "var(--ease-out)" }}>
          <ArrowIcon className="group-hover:rotate-45"
            strokeColor={variant === "primary" ? "#242733" : "#F5F6F6"} />
        </div>
      )}
    </Tag>
  );
}
```

---

## components/ui/arrow-icon.tsx

```tsx
import { cn } from "@/lib/utils";

interface ArrowIconProps {
  className?: string;
  size?: number;
  strokeColor?: string;
}

export function ArrowIcon({ className, size = 14, strokeColor = "#F5F6F6" }: ArrowIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none"
      className={cn("transition-transform duration-[0.65s] arrow-icon", className)}
      style={{ transitionTimingFunction: "cubic-bezier(.33, 1, .68, 1)" }}>
      <path d="M13.0014 13V1H2.09229" stroke={strokeColor} className="arrow-path" />
      <path d="M0.998535 13L12.9985 1" stroke={strokeColor} className="arrow-path" />
    </svg>
  );
}
```

---

## components/ui/accordion-item.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    gsap.set(drawer, { height: defaultOpen ? "auto" : 0 });
  }, [defaultOpen]);

  function toggle() {
    const drawer = drawerRef.current;
    if (!drawer) return;
    gsap.to(drawer, { height: isOpen ? 0 : "auto" });
    setIsOpen(!isOpen);
  }

  return (
    <div className="accordion-helper">
      <div className="accordion-tab" onClick={toggle}>
        <h4 className="row-headline">{title}</h4>
        <div className="accordion-toggle shrink-0">
          <div className="relative h-[14px] w-[14px]">
            <div className="line absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
              style={{
                transition: "transform 0.65s var(--ease-out), background-color 0.45s cubic-bezier(.33,1,.68,1)",
                transform: isOpen ? "translateX(-50%) rotate(90deg)" : "translateX(-50%) rotate(0deg)",
              }} />
            <div className="line absolute top-1/2 left-0 w-full h-px -translate-y-1/2"
              style={{ transition: "background-color 0.45s cubic-bezier(.33,1,.68,1)" }} />
          </div>
        </div>
      </div>
      <div ref={drawerRef} className={`accordion-drawer${defaultOpen ? " start-open" : ""}`}
        style={{ height: defaultOpen ? "auto" : 0 }}>
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
}
```

---

## components/ui/lenis-provider.tsx

```tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "@/lib/gsap";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    const onTick = (time: number) => { lenis.raf(time * 1000); };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## app/layout.tsx

```tsx
import type { Metadata } from "next";
import { GsapProvider } from "@/lib/gsap";
import { LenisProvider } from "@/components/ui/lenis-provider";
import "./globals.css";

// ADAPT: metadata from target site
export const metadata: Metadata = {
  title: "Site Title",
  description: "Site description",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <GsapProvider>
          <LenisProvider>{children}</LenisProvider>
        </GsapProvider>
      </body>
    </html>
  );
}
```

---

## NPM Dependencies

```bash
npm install gsap lenis clsx tailwind-merge @lottiefiles/dotlottie-react
# Only if 3D content exists:
npm install three @react-three/fiber @react-three/drei
```
