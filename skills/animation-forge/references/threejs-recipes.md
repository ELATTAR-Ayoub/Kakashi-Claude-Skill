# Three.js / React Three Fiber Recipes

3D animation patterns for adding depth to web pages. All recipes use React Three Fiber + Drei.

```bash
npm install three @react-three/fiber @react-three/drei
```

---

## 1. Floating Geometry (Background Accent)

Subtle rotating 3D shapes floating in the background. Great for hero sections.

```tsx
"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingShape({ position, color, speed = 1, distort = 0.3 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2 * speed;
      ref.current.rotation.y += delta * 0.15 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color} distort={distort} speed={2}
          roughness={0.2} metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export function FloatingGeometry({ colors }: {
  /** Array of hex colors matching your theme */
  colors?: string[];
}) {
  const palette = colors || ["#6366f1", "#8b5cf6", "#a855f7"];

  return (
    <div className="absolute inset-0 -z-10 opacity-40 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {palette.map((color, i) => (
          <FloatingShape
            key={i}
            position={[(i - 1) * 3, Math.sin(i) * 1.5, -2]}
            color={color}
            speed={0.5 + i * 0.3}
            distort={0.2 + i * 0.1}
          />
        ))}
      </Canvas>
    </div>
  );
}
```

**Usage:**
```tsx
<section className="relative min-h-screen">
  <FloatingGeometry colors={["var(--accent)", "#6366f1", "#3b82f6"]} />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

---

## 2. Particle Field

Floating particles that drift slowly. Creates depth and atmosphere.

```tsx
"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 200, color = "#ffffff" }: {
  count?: number;
  color?: string;
}) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 20;
      arr[i + 1] = (Math.random() - 0.5) * 20;
      arr[i + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.05} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export function ParticleField({ count = 200, color = "#ffffff" }: {
  count?: number;
  color?: string;
}) {
  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <Particles count={count} color={color} />
      </Canvas>
    </div>
  );
}
```

---

## 3. Interactive Globe

A wireframe globe that rotates slowly and responds to cursor.

```tsx
"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Globe({ color = "#3b82f6", wireframe = true }: {
  color?: string;
  wireframe?: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial
        color={color} wireframe={wireframe}
        transparent opacity={0.3}
      />
    </mesh>
  );
}

export function InteractiveGlobe({ color, size = 400 }: {
  color?: string;
  /** Size in pixels */
  size?: number;
}) {
  return (
    <div style={{ width: size, height: size }} className="pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Globe color={color} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
```

---

## 4. Abstract Mesh Blob

An organic, slowly morphing 3D blob. Premium, modern aesthetic.

```tsx
"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

function Blob({ color = "#6366f1", speed = 2, distort = 0.4 }: {
  color?: string;
  speed?: number;
  distort?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.1;
      ref.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <mesh ref={ref} scale={2}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        color={color} distort={distort} speed={speed}
        roughness={0.1} metalness={0.9}
      />
    </mesh>
  );
}

export function AbstractBlob({ color, className }: {
  color?: string;
  className?: string;
}) {
  return (
    <div className={className || "absolute inset-0 -z-10 opacity-60 pointer-events-none"}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Blob color={color} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
```

---

## 5. Lazy-Loaded 3D Scene Wrapper

All 3D scenes should be lazy-loaded to avoid blocking page load. Wrap any scene with this:

```tsx
"use client";
import { useEffect, useRef, useState, Suspense, lazy, ComponentType } from "react";

interface Lazy3DProps {
  /** The 3D scene component to lazy-load */
  component: ComponentType<any>;
  /** Props to pass to the scene */
  props?: Record<string, any>;
  /** Placeholder while loading */
  fallback?: React.ReactNode;
  className?: string;
}

export function Lazy3D({ component: Scene, props = {}, fallback, className }: Lazy3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "200px" });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        <Suspense fallback={fallback || <div className="animate-pulse bg-muted rounded" />}>
          <Scene {...props} />
        </Suspense>
      ) : (
        fallback || <div className="animate-pulse bg-muted rounded" style={{ minHeight: 200 }} />
      )}
    </div>
  );
}
```

**Usage:**
```tsx
import { FloatingGeometry } from "@/components/3d/floating-geometry";

<Lazy3D
  component={FloatingGeometry}
  props={{ colors: ["#6366f1", "#8b5cf6"] }}
  className="absolute inset-0 -z-10"
/>
```

---

## Performance Notes

- Keep particle count under 500 on mobile, 1000 on desktop
- Use `IntersectionObserver` to only render 3D scenes when visible
- Set `frameloop="demand"` on Canvas if the scene doesn't need continuous animation
- Always add `pointer-events-none` to background 3D scenes so they don't block clicks
- Test on mobile — disable 3D on low-power devices:
  ```tsx
  const [is3D, setIs3D] = useState(false);
  useEffect(() => {
    // Only enable 3D on devices with good GPU
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    setIs3D(!!gl);
  }, []);
  ```
