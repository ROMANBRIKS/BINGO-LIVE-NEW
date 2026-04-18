# 🔴 TikTok + Bigo-Style Live Gifting System (Final Advanced Specs)

This document contains the refined architecture, component logic, and future roadmap for the real-time gifting engine, including "Safe Mode" for testing without external APIs.

---

## 🧠 CORE ARCHITECTURE (ADVANCED)

### 1. Main Live Stream (`LiveStream`)
- **Real-Time Listener:** Uses Firestore `onSnapshot` on `liveGifts`.
- **Safe Mode Coin System:** 
    - Local state `coins` (e.g., default 1000) for testing.
    - Deduction happens locally before Firestore write.
- **Combo Logic:** 
    - Key: `senderId + giftName`.
    - Threshold: 3 seconds.
    - Triggers: `triggerFX(count)`.
- **Combo Tiers & Effects:**
    - **x10:** Combo Sound ✨ (`/sounds/combo.mp3`)
    - **x50:** Explosion Sound 🔥 (`/sounds/explosion.mp3`)
    - **Visuals:** CSS `pop` animation on gift boxes.

### 2. TikTok-Style Gift Modal (`GiftModal`)
- **Swipe Gesture Paging:** Real touch swipe detection (left/right) for smooth mobile feel.
- **Page Indicators:** Visual dots to show current page status.
- **Paging System:** Multi-page layout (Page 1, Page 2, etc.) to handle large gift inventories.
- **UI:** Grid-based layout (e.g., 4 columns) with hover scale effects and modern rounded layout.
- **Action:** Triggers `onSend(gift)` which handles coin validation and Firestore recording.

### 3. Insane Combo FX System
- **Center Explosion:** Large, high-energy text ("🔥 GIFT NAME!!!") appears in the center of the screen.
- **Screen Shake:** Physical screen shake effect (`shake` class) triggered on every major gift or combo milestone.
- **Audible Impact:** High-impact sound effects (`explosion.mp3`) to create an addictive feedback loop.
- **Auto-Cleanup:** Precise timing to remove FX elements and reset the screen state after 1.2 seconds.

### 4. Hold-to-Send & Multiplier Logic
- **Continuous Sending:** Users can hold down a gift card to send gifts repeatedly every 200ms.
- **Spam Mechanics:** Mimics TikTok/Bigo "spam gifting" to drive faster engagement and higher spending.
- **Interaction Events:** Supports both `onMouseDown`/`onMouseUp` and `onTouchStart`/`onTouchEnd` for cross-device compatibility.

### 5. Fake Gift Engine (`FakeEngine`)
- **Purpose:** Engagement simulation.
- **Logic:** `setInterval` (3s) to inject random gifts from a pool of fake users.

### 4. OBS Overlay Page (`OBSOverlay`)
- **Purpose:** External stream integration.
- **Logic:** Dedicated listener for the streamer's ID to display gifts on a transparent background.

---

## 💰 PAYMENT & WALLET (SAFE/MOCK)

### Mock Payment System
- `mockBuyCoins`: Simulates a successful top-up (e.g., +500 coins).
- `cryptoMock`: Simulates global crypto payment (e.g., +1000 coins).

### Future Production Integration
- **Paystack:** `window.PaystackPop.setup` (amount * 100 for kobo).
- **Stripe:** Backend-generated `/api/stripe-session` redirect.
- **Crypto:** Integration with NOWPayments or Coinbase Commerce.

---

## 🚀 FUTURE UPGRADE ROADMAP

### 1. 💸 Payment → Coins (CRITICAL)
- Automate coin balance updates upon successful payment callback.
- `updateDoc(user, { coins: increment(amount) })`.

### 2. 🌍 Global Crypto System
- Full integration for "any wallet anywhere" support.

### 3. 🎆 Advanced Combo Visuals
- Replace console logs with:
    - Full-screen Lottie/GIF animations.
    - Spatial sound effects.
    - Screen shake/haptic feedback.
    - Floating combo counter (x10 → x50).

### 4. 🎯 TikTok-Level UX
- **Real Swipe Gestures:** Real touch swipe detection (left/right) with page indicators (dots).
- **Animated Selection:** Visual feedback when a gift is selected.
- **Quantity Selector:** Quick-send options (x1, x10, x100).
- **Smart Sending:** Hold button for auto-send and combo multiplier button.

### 5. Particle + FX Engine
- **Dynamic Particles:** Generates 20+ particles per gift event with randomized trajectories.
- **Visual Burst:** High-impact "explosion" effect using CSS animations and scaling.
- **Audible Feedback:** Synchronized sound effects (`explosion.mp3`) for maximum impact.

### 6. Floating Hearts System
- **Engagement Trigger:** Users can tap a heart button to send floating hearts.
- **Animation:** Hearts float upward and fade out smoothly over 2 seconds.
- **Social Proof:** Constant visual activity that keeps the stream feeling "alive."

### 7. Live Chat & Leaderboard
- **Real-Time Chat:** Instant message delivery with user attribution.
- **Live Leaderboard:** Tracks top 3 senders in real-time based on gift value.
- **Competition Loop:** Encourages "ego spending" as users fight for the top spot.

### 8. 🎥 OBS Overlay (Final Version)
- **Real-Time Stream Source:** A dedicated transparent page that streamers can load into OBS as a browser source.
- **Live Sync:** Listens to the `liveGifts` collection and displays animations on top of the streamer's external broadcast.
- **Platform-Level Readiness:** Fully functional and ready for professional streamers.

### 9. Ultra Premium UI Layer
- **Glassmorphism:** Blurred transparent panels (`backdrop-filter: blur(10px)`) with soft borders for a luxury feel.
- **Neon Glow:** High-intensity box shadows (`neon` class) for interactive elements like gift and clip buttons.
- **Radial Depth:** Cinematic background gradients (`radial-gradient`) to create visual depth and focus.
- **Emotional UI:** Layered motion (floating hearts) combined with glass and glow for high engagement.

### 10. Auto Clip -> Story System
- **Viral Loop Engine:** Streamers record 5-second clips that are automatically added to a live story feed and saved to Firestore (`stories` collection).
- **Technical Logic:** Uses `MediaRecorder` API to capture the video stream.
- **Story Feed:** A horizontal preview bar on the live screen showing recent clips with auto-play loops.
- **Retention:** Creates replay value and content discovery for viewers who missed live moments.

### 11. Follow System
- **User Network:** One-tap "Follow" button to build relationships between users and streamers.
- **Storage:** Saves follow status in a dedicated `follows` collection (`followerId_followingId`).
- **Real-Time Tracking:** Updates follower counts and status locally for instant feedback.

### 12. Lottie Cinematic Animation Engine
- **High-End Visuals:** Uses `lottie-react` to play vector-based cinematic animations for premium gifts.
- **Trigger:** Gift events trigger full-screen or centered Lottie overlays.
- **Assets:** Requires `.json` animation files (e.g., `gift.json`) stored in `/src/lottie/`.

### 13. Profile & Story Grid
- **User Identity:** Dedicated profile pages displaying a user's collected stories and clips.
- **UI:** Responsive grid layout pulling from the `stories` collection with filtering by `userId`.

### 14. VIP Level & Badge System
- **Status Progression:** Users level up (1-5) based on total coins spent.
- **Visual Badges:** Automatic badge assignment (🥉, 🥈, 🥇, 💎, 👑) displayed next to usernames in chat and leaderboards.
- **Monetization Hook:** Encourages higher spending to achieve elite social status.

### 15. Lucky Pair Gift System
- **Special Event:** Triggers a "LUCKY PAIR BONUS!" when two identical gifts are sent consecutively.
- **Engagement Mechanic:** Adds a layer of randomness and excitement to the gifting process.
- **Visuals:** High-impact center-screen text with "pop" animations.

### 16. Discover Page (Growth Engine)
- **Content Discovery:** A central hub showing all active live streams from the `streams` collection.
- **UI:** Grid-based layout with stream thumbnails and titles.
- **Growth Logic:** Essential for user acquisition and content distribution across the platform.

### 17. Ranking System (Daily + Weekly + Rewards)
- **Competition Loops:** Tracks top senders over the last 24 hours (Daily) and 7 days (Weekly).
- **Auto-Reward Engine:** Automatically distributes coin rewards (🥇 1000, 🥈 500, 🥉 200) to top users to drive repeat spending.
- **Status Visibility:** Top users are highlighted on a dedicated ranking board.

### 18. Smart Discover Algorithm
- **Engagement Scoring:** Ranks streams based on a weighted formula: `(viewers * 2) + (gifts * 3) + followers`.
- **Dynamic Feed:** High-engagement streams rise to the top automatically, ensuring the platform always feels "alive."
- **Burial Logic:** Inactive or low-engagement streams are naturally deprioritized.

### 19. Per-Gift Cinematic Lottie System
- **Unique Identity:** Each gift in the inventory (Rose, Lion, Car, etc.) has its own unique `.json` animation file.
- **High Impact:** Premium gifts trigger full-screen, high-fidelity cinematic sequences.
- **Scalability:** New gifts can be added simply by mapping a new JSON file to the gift name.

### 20. Final Polish Pass (Smoothness + UX Perfection)
- **Cinematic Easing:** Uses `cubic-bezier(0.22, 1, 0.36, 1)` for all transitions to ensure natural acceleration and deceleration.
- **Micro Interactions:** Every button and interactive element provides instant visual feedback (shrink on tap, glow effects).
- **Layered Depth:** Floating animations and glassmorphism layers create a sense of depth and visual hierarchy.
- **Skeleton Loaders:** Prevents "blank screen" states by showing shimmer-animated placeholders during data fetching.
- **Breathe Logic:** Timing is adjusted to ensure no abrupt transitions; the UI "breathes" with consistent, smooth motion.

### 21. Sound Design System
- **Local Assets:** Sound files must be stored in `/public/sounds/` for reliable playback.
- **Trigger Logic:** Uses the `Audio` API (`new Audio('/sounds/file.mp3').play()`) for real-time feedback.
- **Layered Audio:** Combines multiple sound layers (e.g., Tap + Sparkle + Bass) for premium gift events to create an addictive feel.
- **Categories:**
    - `tap.mp3`: Light click for button interactions.
    - `gift.mp3`: Sparkle/twinkle sound for standard gifts.
    - `explosion.mp3`: High-impact bass/explosion for big gifts.
    - `ambient.mp3`: Subtle background loop for atmosphere.
- **Licensing:** Strictly use free or licensed assets (Pixabay, Mixkit, Zapsplat).

### 22. Multi-Guest / Tile-Based Gifting System (Next Level)
- **Targeted Gifting**: Gifts are directed to specific user tiles in a multi-guest stream.
- **Multi-Target Gifting**:
    - **UI Selection**: Users can tap multiple tiles to highlight them. A "Send to X people" button appears in the gift panel.
    - **Sequential Send (Default)**: Gifts are sent one by one in rapid succession (Sender → A, then Sender → B). This is cleaner and easier to track.
    - **Split Animation (Premium)**: For special gifts or when 3+ targets are selected, a single gift launches and splits mid-air into multiple pieces, each targeting a different selected tile.
- **Flying Gift Animation (Advanced)**:
    - **Dynamic Start**: If the sender is in a tile, the gift starts from their tile. If the sender is a viewer, it starts from the center of the screen.
    - **Coordinate Calculation**: Uses `getBoundingClientRect()` to calculate precise `startX`, `startY`, `endX`, and `endY`.
    - **Curved Flight Path**: Uses `offset-path` with a Quadratic Bezier curve (`Q`) for natural, cinematic motion.
    - **Trail Effect**: Glowing particle trail (`trail` class) that follows the gift and fades out.
    - **Impact Explosion**: Visual burst (`impact` class) on arrival at the target tile (glow + expand + fade).
- **Per-Gift Styling (Elite)**:
    - **Rose**: Pink soft trail, delicate sparkle explosion.
    - **Lion**: Gold heavy trail, massive impact explosion with screen shake.
    - **Rocket**: Fast neon streak, high-velocity impact with blue/purple flash.
- **Combo Stacking System**:
    - **Logic**: Instead of individual +1 popups, combos stack visually (e.g., "x5 COMBO 🔥").
    - **Persistence**: Stored per user/tile to build hype and encourage competition.
- **Localized Animations**: Animations occur within the specific user's tile box, rather than full-screen, to maintain clarity.
- **Toned-Down Combos**: Combos are limited or simplified (e.g., x2, x3) to avoid visual chaos on screen.
- **Global Feed Integration**: Chat and top banners still show the gift event (e.g., "User sent Lion to John") for social proof.
- **Big Gift Global Flash**: Expensive gifts trigger a brief, non-intrusive global flash or banner, but not a full-screen takeover.
- **UX Goal**: Ensure the interface remains clean and readable even with multiple participants on screen.

### 23. Final God-Tier Layer (Streamer FX, AI Pin, Stickers)
- **Streamer FX (AI Spotlight)**:
    - **Trigger**: Big gifts (e.g., > 500 coins).
    - **Visuals**: Stream video area triggers `shake` and `glow` (gold shadow) effects.
    - **Spotlight Overlay**: Full-screen or centered text overlay ("💎 BIG GIFT! [Amount]") for maximum visibility.
    - **Screen Dim**: The rest of the screen dims to focus all attention on the big spender.
- **AI Big Spender Pin System**:
    - **Logic**: Automatically pins the top gifter's name/ID to a safe area (top right) for a set duration (e.g., 4 seconds).
    - **Social Proof**: Publicly acknowledges high-value contributors, encouraging others to compete for the "Pinned" spot.
- **Interactive Sticker System**:
    - **Functionality**: Streamers can add custom text stickers (e.g., "Kiss Me 💋", "Goal: 10k") to the screen.
    - **Interaction**: Stickers are draggable (`onMouseDown`/`onMouseMove`) and can be positioned anywhere on the stream layer.
    - **Persistence**: Stickers remain on screen until removed, allowing for persistent goals or messages.
- **Sound Sync Engine (Elite)**:
    - **Whoosh**: Triggered during the flight phase of the gift.
    - **Boom**: Triggered on impact with the target tile.
    - **Combo Escalation**: Sound pitch or intensity increases as the combo count rises.
- **Streamer Reaction Hook**:
    - **Logic**: When a big gift hits, a specific animation (e.g., a "Surprise" emoji or frame) triggers on the streamer's camera feed.
- **High-Psychology Visual Systems (God-Tier)**:
    - **AI Big Spender Highlight**: 
        - When a gift exceeds the threshold (e.g., 500 coins), the screen dims (`dim-overlay`), a spotlight focuses on the sender/gift, and a "💎 BIG GIFT!" message pops.
    - **Live Profile Frames**: 
        - Animated frames (glow, pulse, shimmer) appear around the user's tile or profile picture during big gift events or high-status entries.
    - **Animated Badges & Tags**: 
        - Badges (VIP, Top Gifter) are no longer static; they shimmer, glow, and move slightly to feel valuable and "alive."
    - **Full-Screen Cinematic Gifts**: 
        - Ultra-expensive gifts trigger full-screen, high-fidelity cinematic sequences that take over the UI for 2-3 seconds.

### 24. The Full Emotional Loop (The Addiction Loop)
To ensure maximum engagement and monetization, every gift event (especially big ones) must follow this precise sequence:
1.  **Launch**: Gift flies from sender to target (Curved Path + Whoosh Sound).
2.  **Impact**: Gift hits the target tile (Impact Explosion + Boom Sound).
3.  **Feedback**: Target tile glows and the combo counter pops (+1 or x5).
4.  **Reaction**: Streamer camera area shakes and glows (Streamer FX).
5.  **Spotlight**: Screen dims and the AI Spotlight focuses on the gift/sender.
6.  **Status**: Top Gifter is pinned to the top-right; Profile Frame activates.
7.  **Social Proof**: Global banner flashes; Chat feed announces the event.
8.  **Persistence**: Stickers remain visible; Combo counter stays on the tile.

### 25. Streamer Boost System (Controlled Influence)
To maintain platform trust while allowing streamers to engage with polls, the "Streamer Boost" system provides a fair way for streamers to influence outcomes.
- **Controlled Boost**:
    - Streamers can add a limited amount of coins to their side of a poll.
    - **Limit**: Max boost is capped at 10-20% of the total poll pool.
    - **Frequency**: Only one boost allowed per poll.
    - **Timing**: Boost must be applied before the final 10 seconds of the poll.
- **Transparency**:
    - Every boost is visible to all users with a specific animation (e.g., "🔥 STREAMER BOOST +500").
    - The boosted amount is displayed separately but added to the final total.
- **Confidence Mode**:
    - Streamers can "lock" coins before a poll starts.
    - If they win, they receive a 1.5x reward; if they lose, the coins are forfeited.
- **All-In Challenge**:
    - Streamers can deposit coins into a "Supporter Reward Pool."
    - If the streamer's side wins, the pool is distributed among their top supporters.
- **Anti-Abuse Logic**:
    - Streamers cannot see hidden vote counts before boosting.
    - Boosts are blocked during the "Sniping" phase (last 10s).
- **Chaos Integration**:
    - During a "Chaos Event," streamer boosts may receive a 2x multiplier, creating massive spending competition.

### 26. Firebase-Native Architecture (Production Ready)
For production, the system utilizes Firestore for real-time data and Cloud Functions for secure, server-side logic.
- **Firestore Structure**:
    - `polls/{pollId}`: `{ streamId, question, status: "active", createdAt }`
    - `polls/{pollId}/options/{optionId}`: `{ text, userVotes: 0, streamerBoost: 0 }`
    - `users/{userId}`: `{ coins: 1000 }`
    - `chaosEvents/{streamId}`: `{ type: "double_votes", status: "active", endsAt }`
    - `streamerBoosts/{pollId}`: `{ streamerId, optionId, amount }`
- **Cloud Function Logic (Secure Transactions)**:
    - **`voteOnPoll`**: Deducts coins, checks for active Chaos Events (multipliers), and increments votes using `runTransaction`.
    - **`streamerBoost`**: Validates streamer identity, enforces boost limits, deducts coins, and updates poll options.
    - **`triggerChaos`**: Randomly selects a chaos type (e.g., `double_votes`, `2x_gifts`) and sets a 60-second timer.
    - **`spawnEgg`**: Spawns interactive "Easter Eggs" with random coin rewards at randomized screen coordinates.
- **Real-Time Updates**:
    - Uses Firestore `onSnapshot()` for instant UI updates without manual WebSocket management.

### 27. Frontend Connection Logic (React + Firebase)
The frontend components connect directly to Firestore for real-time state and call Cloud Functions for all mutations.
- **Live Poll Component**:
    - Listens to the `options` subcollection of a poll.
    - Displays progress bars based on `userVotes + streamerBoost`.
    - Calls `voteOnPoll` function to cast votes.
- **Chaos Banner Component**:
    - Listens to the `chaosEvents/{streamId}` document.
    - Displays a high-intensity banner (e.g., "🔥 DOUBLE VOTES ACTIVE") when an event is active.
- **Easter Egg System**:
    - Listens to the `eggs` subcollection of a stream.
    - Renders interactive icons (🎁) at randomized `x/y` coordinates on the screen.
    - Calls `claimEgg` function to reward the user and deactivate the egg.
- **Streamer Boost Button**:
    - Exclusive to the streamer; calls `streamerBoost` to influence poll outcomes within limits.

### 28. Premium Polish (Framer Motion + Glass Blue UI)
To match the high-end feel of TikTok and Bigo, the UI utilizes **Framer Motion** for physics-based animations and a **Glassmorphism + Neon Blue** aesthetic.
- **Aesthetic Recipe (Atmospheric/Immersive)**:
    - **Background**: Deep navy/black (`#0a0f1f`).
    - **Surfaces**: Glassmorphism (`rgba(255, 255, 255, 0.08)` + `backdrop-filter: blur(12px)`).
    - **Accents**: Neon Blue Glow (`#00c3ff`) and Linear Gradients (`linear-gradient(135deg, #00c3ff, #007bff)`).
- **Animation Logic (Framer Motion)**:
    - **Poll Progress**: `motion.div` with `animate={{ width: total }}` for smooth, satisfying bar updates.
    - **Chaos Pulse**: `scale: [1, 1.1, 1]` keyframes for a high-urgency "heartbeat" effect.
    - **Easter Egg Pop**: `type: "spring"` with high stiffness for a tactile, rewarding feel when spawning.
    - **Boost Impact**: High-scale, fading entrance (`scale: 1.5, opacity: 1`) to signal a "Power Moment."
    - **Interactive Hover**: Subtle `whileHover={{ scale: 1.02 }}` on all interactive glass panels.
- **Interaction Philosophy**:
    - **One Strong Animation**: Only one major screen-takeover animation at a time to prevent visual fatigue.
    - **Subtle Persistence**: Background elements (like the poll bars) use smooth, subtle transitions to keep the screen feeling "alive" without being distracting.

### 29. Advanced Engagement Systems (Combo + Leaderboard)
To further drive competition and spending, the system includes high-visibility feedback for active participants.
- **Visual Combo System**:
    - **Logic**: Increments on every vote or gift.
    - **Animation**: Uses `AnimatePresence` to pop the combo text (`⚡ COMBO x{count}`) from the bottom with a spring entrance and fade-out.
    - **Psychology**: Creates a "streak" feeling that users don't want to break.
- **Leaderboard Glow (Top Spender Recognition)**:
    - **Visuals**: The top spender's tile or nameplate features a persistent `glow-blue` pulse animation.
    - **Status**: Uses `motion.div` with `scale: [1, 1.05, 1]` to ensure the "King/Queen" of the room is always noticed.
    - **Competition**: Drives "ego spending" as users fight to steal the glowing status.

### Required Assets
- **Sounds:** `/public/sounds/combo.mp3`, `/public/sounds/explosion.mp3`.
- **Gifts:** `/public/gifts/rose.gif`, `/public/gifts/heart.gif`, etc.

### Animations
```css
.ranking-board {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 10px;
  z-index: 50;
}

.discover {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.card {
  background: #111;
  padding: 10px;
  border-radius: 10px;
}

.thumb {
  height: 100px;
  background: #333;
}

.gift-lottie {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  z-index: 210;
  pointer-events: none;
}

.vip-badge {
  margin-left: 5px;
  font-size: 18px;
}

.lucky-pair {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  color: gold;
  animation: pop 1s ease;
  z-index: 150;
}

.discover-page {
  padding: 10px;
  background: black;
  color: white;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stream-card {
  background: #111;
  border-radius: 10px;
  padding: 10px;
}

.thumbnail {
  height: 100px;
  background: #333;
  border-radius: 8px;
}

.follow-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ff0050;
  padding: 10px;
  border-radius: 20px;
  font-weight: bold;
}

.story-feed {
  position: absolute;
  top: 60px;
  left: 10px;
  display: flex;
  gap: 5px;
}

.story {
  width: 60px;
  height: 100px;
  border-radius: 10px;
  border: 2px solid #ff0050;
  object-fit: cover;
}

.lottie-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  z-index: 200;
  pointer-events: none;
}

.ultra-container {
  position: relative;
  height: 100vh;
  background: radial-gradient(circle at center, #0f0f1a, #000);
  color: white;
  overflow: hidden;
}

.glass {
  backdrop-filter: blur(10px);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
}

.neon {
  box-shadow: 0 0 10px #ff00ff, 0 0 20px #00ffff;
}

.heart {
  position: absolute;
  bottom: 0;
  animation: float 2s ease-out;
  pointer-events: none;
}

@keyframes float {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-200px); opacity: 0; }
}

.particle {
  width: 6px;
  height: 6px;
  background: gold;
  position: absolute;
  animation: explode 1s ease-out;
}

@keyframes explode {
  from { transform: scale(0); }
  to { transform: scale(1.5) translate(50px, -50px); }
}

.combo-insane {
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
  color: gold;
  animation: explode 1s ease;
  z-index: 100;
}

@keyframes explode {
  from { transform: scale(0.5); }
  to { transform: scale(2); }
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% { transform: translate(0px, 0px); }
  25% { transform: translate(5px, -5px); }
  50% { transform: translate(-5px, 5px); }
  75% { transform: translate(5px, 5px); }
  100% { transform: translate(0px, 0px); }
}

.gift-box {
  background: linear-gradient(45deg, #ff00cc, #3333ff);
  padding: 10px;
  border-radius: 10px;
  animation: pop 0.4s ease;
}

@keyframes pop {
  from { transform: scale(0.5); }
  to { transform: scale(1); }
}

.gift-item:hover {
  transform: scale(1.1);
}

.animate-slide-up {
  animation: slideUp 0.5s ease, fadeOut 4s ease forwards;
}

/* FINAL POLISH PASS (SMOOTHNESS + UX PERFECTION) */

.hearts-layer {
  position: absolute;
  bottom: 0;
  right: 20px;
}

.heart-advanced {
  position: absolute;
  animation: floatUp 2.5s cubic-bezier(0.22, 1, 0.36, 1);
  font-size: 20px;
}

@keyframes floatUp {
  0% { transform: translateY(0) scale(0.8); opacity: 1; }
  100% { transform: translateY(-250px) scale(1.4); opacity: 0; }
}

.gift-smooth {
  animation: popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes popIn {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.premium-btn {
  background: linear-gradient(135deg, #ff00cc, #3333ff);
  padding: 12px 16px;
  border-radius: 25px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.premium-btn:active {
  transform: scale(0.92);
  box-shadow: 0 0 20px rgba(255,0,255,0.8);
}

.skeleton {
  height: 100px;
  border-radius: 10px;
  background: linear-gradient(90deg, #222, #333, #222);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}

/* MULTI-GUEST ADVANCED FX */
.gift-fly-advanced {
  position: fixed;
  font-size: 26px;
  offset-rotate: auto;
}

@keyframes flyCurve {
  to {
    offset-distance: 100%;
  }
}

.trail-fx {
  position: fixed;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, gold, transparent);
  animation: trailFade 1.5s ease-out;
}

@keyframes trailFade {
  from { opacity: 1; }
  to { opacity: 0; transform: scale(2); }
}

.impact-fx {
  position: fixed;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle, yellow, orange, transparent);
  border-radius: 50%;
  animation: explode-impact 0.6s ease-out;
}

@keyframes explode-impact {
  from { transform: scale(0.5); opacity: 1; }
  to { transform: scale(2); opacity: 0; }
}

/* MULTI-TARGET UI & FX */
.tile-selected {
  border: 2px solid #ff0050;
  box-shadow: 0 0 15px #ff0050;
  transform: scale(1.05);
}

.tile-glow-impact {
  animation: glow-impact 0.5s ease-out;
}

@keyframes glow-impact {
  0% { box-shadow: 0 0 0px gold; }
  50% { box-shadow: 0 0 30px gold; }
  100% { box-shadow: 0 0 0px gold; }
}

.mini-combo {
  position: absolute;
  top: -20px;
  right: -10px;
  font-weight: bold;
  color: #ff0050;
  font-size: 18px;
  text-shadow: 0 0 5px black;
  animation: pop 0.3s ease;
}

/* GOD-TIER FX & STICKERS */
.stream-glow {
  box-shadow: 0 0 40px gold;
}

.spotlight-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.3);
  pointer-events: none;
  z-index: 200;
}

.spotlight-text {
  font-size: 32px;
  font-weight: bold;
  color: gold;
  text-shadow: 0 0 20px rgba(255,215,0,0.8);
  animation: pop 0.5s ease;
}

.pinned-gifter {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0,0,0,0.7);
  padding: 10px 15px;
  border-radius: 10px;
  color: gold;
  font-weight: bold;
  border: 1px solid gold;
  z-index: 100;
  animation: slideInRight 0.4s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.sticker-item {
  position: absolute;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(5px);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  color: white;
  font-weight: bold;
  border: 1px solid rgba(255,255,255,0.3);
  z-index: 150;
}

.sticker-item:active {
  cursor: grabbing;
  transform: scale(1.1);
}

/* HIGH-PSYCHOLOGY VISUALS (GOD-TIER) */
.dim-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.6);
  z-index: 190;
  animation: fadeIn 0.3s ease;
}

.profile-frame-animated {
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border: 2px solid gold;
  border-radius: 50%;
  box-shadow: 0 0 15px gold;
  animation: pulse-frame 1.5s infinite;
}

@keyframes pulse-frame {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 25px gold; }
  100% { transform: scale(1); opacity: 0.8; }
}

.badge-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer-badge 2s infinite;
}

@keyframes shimmer-badge {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.streamer-reaction-fx {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid gold;
  box-shadow: inset 0 0 40px gold;
  animation: flash-reaction 0.6s ease-out;
  pointer-events: none;
}

@keyframes flash-reaction {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
```
