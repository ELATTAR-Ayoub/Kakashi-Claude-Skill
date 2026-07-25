# GSAP Animation Recipes

Battle-tested GSAP patterns for common animation needs. Each recipe includes the component code, required CSS, and wiring instructions.

All recipes assume GSAP + ScrollTrigger are installed:
```bash
npm install gsap
```

And a GSAP setup file exists at `lib/gsap.ts`:
```typescript
"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
```

---

## 1. Staggered Page Entrance

Elements slide up and fade in one-by-one when the page loads.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface StaggerEntranceProps {
  children: React.ReactNode;
  /** CSS selector for child elements to stagger */
  selector?: string;
  /** Delay between each element (seconds) */
  stagger?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Distance to travel (pixels) */
  distance?: number;
}

export function StaggerEntrance({
  children, selector = ":scope > *",
  stagger = 0.08, duration = 0.6, distance = 20,
}: StaggerEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll(selector);
    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y: distance, opacity: 0,
        duration, stagger,
        ease: "power2.out",
        clearProps: "all",
      });
    }, el);
    return () => ctx.revert();
  }, [selector, stagger, duration, distance]);

  return <div ref={ref}>{children}</div>;
}
```

**Usage:**
```tsx
<StaggerEntrance selector=".card" stagger={0.1}>
  <div className="card">...</div>
  <div className="card">...</div>
  <div className="card">...</div>
</StaggerEntrance>
```

---

## 2. Scroll Reveal

Elements animate in when they enter the viewport.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ScrollRevealProps {
  children: React.ReactNode;
  /** Direction to reveal from */
  from?: "bottom" | "left" | "right" | "fade";
  /** Distance to travel (pixels) */
  distance?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Viewport threshold to trigger (0-1) */
  threshold?: string;
}

export function ScrollReveal({
  children, from = "bottom", distance = 40,
  duration = 0.7, threshold = "0% 0% -15% 0%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fromVars: gsap.TweenVars = { opacity: 0, duration, ease: "power2.out" };
    if (from === "bottom") fromVars.y = distance;
    if (from === "left") fromVars.x = -distance;
    if (from === "right") fromVars.x = distance;

    const ctx = gsap.context(() => {
      gsap.from(el, {
        ...fromVars,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, el);
    return () => ctx.revert();
  }, [from, distance, duration, threshold]);

  return <div ref={ref}>{children}</div>;
}
```

**Usage:**
```tsx
<ScrollReveal from="bottom" distance={30}>
  <div className="my-section">...</div>
</ScrollReveal>
```

---

## 3. Parallax Section

Background moves at a different speed than foreground content.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ParallaxProps {
  children: React.ReactNode;
  /** Speed factor: 0.5 = half speed, 2 = double speed */
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 30,
        ease: "none",
        scrollTrigger: {
          trigger: el.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);
    return () => ctx.revert();
  }, [speed]);

  return <div ref={ref} className={className}>{children}</div>;
}
```

---

## 4. Counter Animation

Numbers count up from 0 to a target value when visible.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

interface CounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function Counter({
  target, duration = 2, prefix = "", suffix = "",
  decimals = 0, className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: target, duration,
        ease: "power2.out",
        onUpdate: () => setDisplayed(proxy.val),
      });
    }, { threshold: 0.5 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed)}{suffix}
    </span>
  );
}
```

**Usage:**
```tsx
<Counter target={1250} suffix="+" duration={2.5} />
<Counter target={99.9} suffix="%" decimals={1} />
```

---

## 5. Magnetic Button

Button subtly follows the cursor when hovering near it.

```tsx
"use client";
import { useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    gsap.to(el, { x, y, duration: 0.3, ease: "power2.out" });
  }, [strength]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
  }, []);

  return (
    <div ref={ref} className={className}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}
```

---

## 6. Card Hover Tilt (3D Perspective)

Card tilts toward the cursor on hover, creating a 3D effect.

```tsx
"use client";
import { useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface TiltCardProps {
  children: React.ReactNode;
  /** Max tilt angle in degrees */
  maxTilt?: number;
  className?: string;
}

export function TiltCard({ children, maxTilt = 8, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(el, {
      rotateY: x * maxTilt,
      rotateX: -y * maxTilt,
      transformPerspective: 800,
      duration: 0.3,
      ease: "power2.out",
    });
  }, [maxTilt]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    gsap.to(el, {
      rotateY: 0, rotateX: 0,
      duration: 0.5, ease: "power2.out",
    });
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}
```

---

## 7. Text Scramble Reveal

Text characters scramble through random chars before settling on the real text.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface ScrambleTextProps {
  text: string;
  /** Characters to cycle through */
  charset?: string;
  /** Speed in ms per character */
  speed?: number;
  className?: string;
  /** Trigger on mount or on visibility */
  trigger?: "mount" | "visible";
}

export function ScrambleText({
  text, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%",
  speed = 30, className, trigger = "visible",
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(trigger === "mount" ? "" : text);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    const el = ref.current;
    if (!el) return;

    function run() {
      hasRun.current = true;
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayed(
          text.split("").map((char, i) => {
            if (i < iteration) return char;
            if (char === " ") return " ";
            return charset[Math.floor(Math.random() * charset.length)];
          }).join("")
        );
        iteration += 1 / 3;
        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplayed(text);
        }
      }, speed);
    }

    if (trigger === "mount") {
      run();
    } else {
      const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      }, { threshold: 0.5 });
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [text, charset, speed, trigger]);

  return <span ref={ref} className={className}>{displayed}</span>;
}
```

---

## 8. Staggered List

Items in a list/grid animate in one-by-one on scroll.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface StaggerListProps {
  children: React.ReactNode;
  /** CSS selector for items */
  selector?: string;
  stagger?: number;
  duration?: number;
  className?: string;
}

export function StaggerList({
  children, selector = ":scope > *",
  stagger = 0.1, duration = 0.5, className,
}: StaggerListProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = el.querySelectorAll(selector);
    const ctx = gsap.context(() => {
      gsap.from(items, {
        y: 20, opacity: 0,
        duration, stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, el);
    return () => ctx.revert();
  }, [selector, stagger, duration]);

  return <div ref={ref} className={className}>{children}</div>;
}
```

---

## 9. Smooth Reveal (Clip Path)

Content reveals via an expanding clip-path — looks like a curtain opening.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ClipRevealProps {
  children: React.ReactNode;
  /** Direction: inset shrinks from edges, circle expands from center */
  type?: "inset" | "circle";
  duration?: number;
  className?: string;
}

export function ClipReveal({
  children, type = "inset", duration = 1, className,
}: ClipRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const from = type === "circle"
      ? { clipPath: "circle(0% at 50% 50%)" }
      : { clipPath: "inset(10% 10% 10% 10%)" };
    const to = type === "circle"
      ? { clipPath: "circle(75% at 50% 50%)" }
      : { clipPath: "inset(0% 0% 0% 0%)" };

    const ctx = gsap.context(() => {
      gsap.fromTo(el, from, {
        ...to, duration,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });
    }, el);
    return () => ctx.revert();
  }, [type, duration]);

  return <div ref={ref} className={className}>{children}</div>;
}
```

---

## 10. Progress Bar on Scroll

A bar that fills as the user scrolls through the page/section.

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface ScrollProgressProps {
  /** Color of the progress bar */
  color?: string;
  /** Height in pixels */
  height?: number;
  /** Position */
  position?: "top" | "bottom";
}

export function ScrollProgress({
  color = "var(--accent, #3b82f6)",
  height = 3, position = "top",
}: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        [position]: 0,
        left: 0,
        width: "100%",
        height: `${height}px`,
        backgroundColor: color,
        transformOrigin: "left",
        transform: "scaleX(0)",
        zIndex: 9999,
      }}
    />
  );
}
```
