# TODO & Architectural Specs: Premium Tap-to-Like System Refinement

This document serves as the absolute source of truth, frame-by-frame analysis, and implementation roadmap for our **Premium Tap-to-Like System**. It captures the exact user feedback, video-analysis details, and visual dynamics required to achieve a "boot to boot" match of premium livestreaming like mechanics.

---

## 1. Frame-by-Frame Video Analysis & Design Directives

### 🎭 A. Mascot Behavior (At Tap Coordinates)
*   **The Tap Trigger**: When a user taps/clicks, the heart does **NOT** immediately pop up at the tap location. Instead, a custom mascot (like our Golden Slime companion) pops up at the tap coordinates.
*   **Volumetric 3D, No Spiraling**: The mascots look highly polished and premium with dimensional depth (3D-like), but they **DO NOT SPIRAL** or flip 360 degrees. You should never see their back side or a raw "two-image sandwich" flipping effect. They are single-sided but possess clean, high-fidelity visual depth.
*   **Zigzag Rise**: Upon popping up, the mascots float upwards in a distinct **zigzag/swaying fashion**.
*   **Short Lifespan**: The mascots travel only a short distance up from the tap point before **fading out completely**.

### 💖 B. Heart Behavior (Trajectory & Aesthetics)
*   **Mascot-to-Heart Spawning**: As the user continues to tap, or as the mascots begin their zigzag and fade out, beautiful **hearts start forming and emerging out of those mascots**.
*   **Return to 2D Flatness**: The hearts are **strictly 2D (one-dimensional flat graphics)**. We must completely remove the volumetric 3D extrusion and 360-degree card flipping on the hearts themselves. They should look elegant, clean, and classic.
*   **The Curving Arc Trajectory**: Flying hearts do not go straight up. They travel toward the top target destination (the streamer profile header/progress bar) along a beautiful, sweepingly curved **arc trajectory/trajectory line**.

### 👑 C. The Top Target Destination (The Beating Heart)
*   **Progress Bar Target**: The hearts queue up and fly directly to the heart icon adjacent to the streamer's progress bar (at the top profile badge).
*   **Living Heartbeat Effect**: The target heart icon up top must **beat and pulse dynamically** (almost like a physical breathing heart) as the flying hearts arrive, creating a powerful loop of visual feedback.

### 🎉 D. The Burst/Blast Mechanics (Confetti Papers)
*   **Party Papers**: During high-intensity taps or "likes blast" milestones, colorful party papers (flat triangular and rectangular confetti, like festive streamers) explode out in multiple directions in a realistic cascading cascade, adding a premium sense of celebration.

---

## 2. Refined Component Blueprint

To implement this perfectly, we will structure the state in our `LikeParticles` canvas component as follows:

```
                  [ USER TAP EVENT (x, y) ]
                             │
                             ▼
              [ Spawn Mascot Particle (isMascot: true) ]
               - Set initial size and 2D-looking-3D face
               - Animate upwards in Zigzag: x = tapX + sin(time) * sway
               - Fade out over short distance (life: 1.0 -> 0)
                             │
                             ▼ (As taps accrue or on mascot fade)
              [ Spawn 2D Heart Particle (isHeart: true) ]
               - 2D classic flat rendering (No 3D side-walls)
               - Arc trajectory interpolation to Target coordinates
               - On arrival: Trigger Target Heart Pulse + Sparkles
```

### 🛠️ Step-by-Step Task Checklist (For the implementation phase)

- [ ]  **Mascot Particles Creation**:
    *   Map tap events to spawn mascots with simple flat-shading 3D appearance (using layered dropshadows or single static canvas templates) but disable any rotation flip speeds.
    *   Apply a precise sinusoidal zigzag formula for horizontal sway on mascots.
    *   Configure maximum travel height (e.g., ~150px) before fade-out.
- [ ]  **Mascot-to-Heart Emergence Math**:
    *   Track consecutive taps. Every tap triggers a mascot. On every tap (or every 2nd tap), generate a 2D heart that emerges directly from the active mascot's position and enters the curved flight queue.
- [ ]  **Flat 2D Hearts & Arc Physics**:
    *   Strip out `drawHeart` 3D extrusion steps to render a classic, high-contrast, beautiful flat 2D vector heart.
    *   Formulate a distinct Bezier cubic curve from the bottom-right tap area winding up to the top-left host profile tag (`targetX`, `targetY`).
- [ ]  **Top Badge Beating Pulse**:
    *   Add a custom CSS pulse animation or custom framer-motion scaling (`motion.div` with an active heartbeat scale loop) to the heart inside `HostProfileBadge.tsx`.
    *   Enable this scale beat whenever a heart successfully completes its flight and arrives at the target.
- [ ]  **Confetti / Party Papers**:
    *   Add a distinct particle type for **Party Papers** (rectangles, triangles, confetti) with high-contrast pastel colors that spin, float down, and bounce during grand blast events.
