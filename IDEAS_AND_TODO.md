# 🚀 Future Ideas & Development Roadmap

This file serves as the central repository for brainstorming ideas, feature requests, and the project to-do list. These items are planned for future discussion and implementation.

---

## 📞 1. Private Interaction System (Audio & Video Calls)
*   **Private Call Workflow:**
    *   Users can initiate private audio or video calls with streamers.
    *   Streamers receive a specific notification/interface to accept or decline.
*   **Privacy & Public Stream Handling:**
    *   **Auto-Mute/Hide:** When a streamer accepts a private call, the public microphone and video feed must be automatically disabled for the public audience.
    *   **Stream Pausing:** Streamers have an explicit "Pause Stream" option (different from ending the stream).
    *   **Custom Pause Screen:** Instead of a generic "Stream Paused" message, show a branded/custom screen (e.g., "Streamer is busy and will be back soon!").
*   **Technical Requirements:**
    *   State management for "Public" vs. "Private" modes.
    *   Dynamic UI overlays for the public audience during pauses.

## 🎲 2. "Dare the Streamer" & Prediction Enhancements
*   **"Dare the Streamer" Mechanic:**
    *   Viewers can send "Dares" to the streamer.
    *   Streamers can also dare viewers.
    *   Viewers pay (in Diamonds) to send a dare; streamer sets the price.
*   **Real-Time Prediction Ticker:**
    *   Show individual bets as they happen (e.g., "User X placed a bet!") in a live feed.
    *   **Suspense Mechanic:** Hide the *total* pool amount until the very end or specific milestones to maintain tension.
    *   Distinguish between "Pool Bets" (multi-user) and "Normal Bets."
*   **PK Battle "Margin of Loss" Logic:**
    *   **Post-Battle Summary:** When a PK ends, losers receive a popup showing exactly how many diamonds they lost by (the "Magic Margin").
    *   **Psychological Hook:** "You lost by only 5,000 diamonds! One more [Gift Name] would have changed the outcome!"
    *   Show the winners' margin as well to celebrate the victory.

## 🎁 4. Dynamic Admin Gift Management
*   **Visual Admin Control Panel (WYSIWYG):**
    *   The admin interface should mirror the actual app's gift section layout.
    *   **Drag-and-Drop / Slot Management:** Admins can see the current gift grid and tap on a slot to upload or replace a gift.
*   **Asset Support & Processing:**
    *   **Formats:** Support for static images (PNG/JPG), animated GIFs/WebP, and high-end animations (Lottie/SVGA).
    *   **Auto-Resizing:** The system automatically optimizes and resizes uploaded assets to fit the standard gift icon dimensions.
*   **Categorization & Placement:**
    *   **Umbrella Sections:** Admins can assign gifts to specific categories (e.g., "Popular," "Noble," "Event," "Flash," "Lucky").
    *   **Precise Positioning:** Ability to choose the exact slot or order within a category.
*   **Real-Time CRUD Operations:**
    *   **Instant Updates:** Deleting or replacing a gift in the admin panel reflects immediately across all live streams on the platform.
    *   **Flash Logic:** Integrated timer for "Flash" gifts that removes them from the category once the countdown hits zero.

## 💰 3. Revenue Sharing & Streamer Targets
*   **Revenue Split:**
    *   **App Cut:** 40% – 50% of the gift/dare value.
    *   **Streamer Cut:** 55% – 60% of the value.
*   **The "Held Back" Incentive System:**
    *   A portion of the streamer's earnings (e.g., 10-15% of their cut) is held in a "Target Reserve."
    *   **Targets & Tasks:** Streamers are assigned specific tasks or diamond targets (e.g., "Stream for 20 hours this week" or "Receive 50,000 diamonds").
    *   **Release Logic:**
        *   If the target is met: The held-back portion is released to the streamer.
        *   If the target is NOT met: The streamer only receives their base percentage; the reserve remains held or is forfeited based on final policy.
*   **Task Sender:** A system to automatically generate and send tasks/targets to streamers.

## 🎬 5. High-End Animation Engine (Big Gifts)
*   **Asset Formats & Technical Handling:**
    *   **Transparent Video (WebM):** Best for realistic animations like cars or dragons. Supports alpha transparency (the background is invisible).
    *   **SVGA / Lottie:** Vector-based animations that are lightweight and high-quality.
    *   **Video-to-Animation Pipeline:** Admins can upload short WebM videos, and the app uses a global overlay to play them.
*   **Layering & Positioning:**
    *   **Z-Index Management:** High-end animations play on a layer *above* the video stream but *below* the chat/UI elements.
    *   **"Behind the Chat" Effect:** By placing the animation layer between the video and the UI, a car can drive "behind" the scrolling comments and buttons, making it feel integrated into the room.
    *   **Entrance Paths:** Admins can define paths (e.g., "Right to Center", "Full Screen Pass", "Bottom Up").
*   **Global Announcement:**
    *   Big gifts trigger a platform-wide "Ticker" or "Banner" that appears in *every* room, inviting people to jump into the stream where the big gift was sent.

## 🎮 6. "Control the Stream" Interactive Polls
*   **Weighted Voting:**
    *   Viewers spend coins/diamonds to vote on stream decisions (e.g., "What should I do next?").
    *   **Power Mechanic:** 1 Diamond = 1 Vote. A "Whale" can swing the entire result by spending 1,000 diamonds.
    *   **Live Feedback:** Real-time progress bars showing which option is winning.
*   **Backend Implementation Details:**
    *   **Database Structure:**
        *   `polls`: `id`, `stream_id`, `question`, `status` (active, closed, settled), `start_time`, `end_time`.
        *   `poll_options`: `id`, `poll_id`, `option_text`, `total_coins` (default 0).
        *   `votes`: `id`, `user_id`, `stream_id`, `poll_id`, `option_id`, `coins_spent`, `created_at`.
    *   **Core Logic (Voting Transaction):**
        1. Verify poll `status == "active"`.
        2. Check user diamond balance.
        3. Atomic Transaction: Deduct diamonds from user -> Insert record into `votes` -> Increment `total_coins` in `poll_options`.
    *   **Real-Time Sync:** Every vote triggers a WebSocket broadcast with `{ option_id, new_total }` to update live bars for all viewers.
    *   **Winner Determination:** On poll close, select `option_id` with `MAX(total_coins)`.
    *   **Anti-Abuse:** Implement minimum vote (e.g., 5 coins) and per-user cooldowns.

## ⚡ 7. Live Chaos Events (Threshold Triggers)
*   **Platform-Wide or Room-Specific Events:**
    *   Triggered when a certain spending threshold is hit (e.g., 100k diamonds spent in 5 mins).
    *   **Event Types:**
        *   "🔥 2x Gift Value": All gifts count for double PK points for 60 seconds.
        *   "💥 Power Hour": All votes count as double.
        *   "🎁 Bonus Rain": Random diamond/coin drops for active viewers.
    *   **Sudden Trigger:** No warning, creates a "rush" environment.
*   **Backend Implementation Details:**
    *   **Database Structure:**
        *   `chaos_events`: `id`, `stream_id`, `event_type`, `trigger_threshold`, `duration_seconds`, `status` (inactive, active, ended).
        *   `stream_activity`: `stream_id`, `total_coins_last_60s`, `last_updated`.
    *   **Trigger Logic:**
        1. Track all coin-spending actions in `stream_activity`.
        2. Background worker/job checks if `total_coins_last_60s >= threshold`.
        3. If threshold met AND no active event AND cooldown passed: Trigger event.
    *   **Real-Time Sync:** Broadcast `chaos_start` via WebSocket with `{ type, duration }`.
    *   **Effect Application:**
        *   `2x_gifts`: Intercept gift processing and multiply PK points by 2.
        *   `double_votes`: Intercept poll voting and multiply vote power by 2.
        *   `bonus_drop`: Trigger the `spawn_egg` logic from Section 8.
    *   **Cooldown & Priority:** Only one active event per stream; 2-minute cooldown between events.

## 🎁 8. Hidden Easter Egg Drops
*   **Randomized Rewards:**
    *   Small icons (Chests, Eggs, Stars) appear randomly on the screen for 3-5 seconds.
    *   **Tap-to-Claim:** First user to tap the icon gets the reward.
    *   **Rewards:** Small amounts of coins, temporary multipliers, or exclusive chat badges.
    *   **Retention Hook:** Keeps users' eyes glued to the screen so they don't miss a drop.
*   **Backend Implementation Details:**
    *   **Database Structure:**
        *   `easter_eggs`: `id`, `stream_id`, `type` (coin, multiplier, bonus, badge), `value`, `spawn_time`, `expiry_time`, `status` (active, claimed, expired), `position_x`, `position_y` (percentage-based).
        *   `user_egg_claims`: `id`, `user_id`, `egg_id`, `claimed_at`.
    *   **Spawn Logic:**
        *   Triggered by time (every 30-90s), activity (spending threshold), or random chance.
        *   Broadcast `egg_spawn` event via WebSocket with `{ id, x, y, expires_in }`.
    *   **Claim Logic:**
        *   Atomic check: Is egg active? Is it expired? Has user already claimed?
        *   Reward user -> Mark egg as claimed -> Broadcast `egg_claimed` event.
    *   **Anti-Bot Protection:** Speed limits (e.g., max 5 claims/min) and server-side validation delays.

## ⚔️ 9. Multi-Stream Team Battles (2v2 / 4v4)
*   **Collaborative Competition:**
    *   Multiple streamers (2-4) link their streams into a single battle interface.
    *   **Team Support:** Viewers pick a side to support.
    *   **MVP Spotlight:** The top spender for the winning team gets a special "MVP" animation and profile highlight.
    *   **Rivalry Mechanics:** Real-time "Tug of War" bar showing which team is leading.

## 👑 10. VIP & Social Status (Spending Psychology)
*   **Custom Entrance Effects:**
    *   When a high-level user (Wealth Level 50+) enters a room, a special animation plays (e.g., a red carpet rolls out, or a "VIP HAS ARRIVED" banner).
*   **Exclusive Chat Styling:**
    *   Unlockable chat bubble colors, fonts, and "Glow" effects based on recent spending.
*   **The "Guardian" System:**
    *   A user can pay a high monthly fee to become a streamer's "Guardian."
    *   **Perks:** Exclusive badge, ability to pin their own comments, and a special "Guardian" seat at the top of the viewer list.
*   **Leaderboard "Sniping" Alerts:**
    *   In the final 30 seconds of a PK, if the score is close, trigger a "CRITICAL" alert to encourage last-second "sniping" (saving the streamer at the last moment).

## 💰 11. Spending Psychology (Monetization Hooks)
*   **The "Near Win" Effect:**
    *   After a PK or Prediction, show losers exactly how close they were (e.g., "You missed the 300 coin jackpot by just 1 vote!").
    *   **Goal:** Trigger immediate "try again" behavior.
*   **Visual Progress Bars (The Completion Hook):**
    *   Show users how close they are to the next milestone (e.g., "Spend 50 more diamonds to unlock the 'Knight' badge").
    *   **Goal:** Use the human desire for completion to push small extra spends.
*   **Micro-Spending Actions (Low Friction):**
    *   Introduce ultra-cheap actions (1-5 coins) like:
        *   Highlighting a chat message for 10 seconds.
        *   Sending a special animated emoji.
        *   Triggering a short sound effect in the room.
    *   **Goal:** Get users comfortable with spending small amounts frequently.
*   **Timed Multipliers (Urgency):**
    *   Randomly trigger "Happy Minute" events where all gifts count for 1.5x or 2x points.
    *   **Goal:** Create a "buying frenzy" through artificial urgency.

## 🧠 12. Social Status Addiction (Identity & Rivalry)
*   **Live Rank Climbing:**
    *   Show top spenders in real time within the room (e.g., "Top supporter this minute").
    *   **Goal:** Encourage users to spend just to stay on top of the list.
*   **Custom Titles:**
    *   Assign special titles to top users (e.g., "King of the Stream", "Top Predictor").
    *   **Goal:** Make status part of the user's identity so they protect it by spending.
*   **Exclusive Chat Privileges:**
    *   Unlock special features for top spenders/VIPs:
        *   Voice messages in chat.
        *   Special exclusive emojis.
        *   Permanently highlighted or "pinned" comments.
    *   **Goal:** Make spending feel like gaining exclusive access.
*   **Big Spend Alerts:**
    *   When a user spends a large amount, trigger a live alert (e.g., "🔥 John just sent 500 coins!").
    *   **Goal:** Trigger competition and "copycat" spending behavior.

## 🎮 13. Gamification (Retention & Progression)
*   **Daily Missions:**
    *   Simple tasks users complete daily (e.g., "Bet 3 times", "Win 1 prediction").
    *   **Goal:** Use small rewards to keep users active every single day.
*   **XP & Level System:**
    *   Users gain experience points (XP) for all activity (betting, watching, spending).
    *   **Goal:** Higher levels unlock better perks, creating a long-term sense of achievement.
*   **Loot Boxes:**
    *   Users can spend coins for random rewards (e.g., more coins, rare badges, multipliers).
    *   **Goal:** Use the excitement of uncertainty to create an addictive loop.
*   **Streak System:**
    *   Reward consistency (e.g., daily login streaks, winning streaks).
    *   **Goal:** Users return daily to maintain their streaks and avoid losing progress.

## 🔥 14. FOMO & Urgency (Impulse Drivers)
*   **Flash Streams:**
    *   Short, limited-time streams (e.g., 10-15 mins) with boosted rewards or exclusive content.
    *   **Goal:** Create a "rush" effect where users drop everything to join.
*   **Last Seconds Surge:**
    *   Visually highlight massive activity in the final moments of a PK or Prediction (e.g., "🔥 2,000 coins placed in last 5 seconds!").
    *   **Goal:** Trigger panic betting and last-second "sniping."
*   **Expiring Coins:**
    *   Bonus coins or rewards that must be used within a short window (e.g., 24 hours).
    *   **Goal:** Force users to spend quickly rather than hoarding.
*   **Limited-Time Gifts:**
    *   Special gifts available for a very short duration (e.g., 1 hour).
    *   **Goal:** Drive impulse buying through scarcity.

## 🤝 15. Creator–Viewer Economy (Engagement & Loyalty)
*   **Streamer Challenges:**
    *   Streamers set specific coin/diamond goals for live outcomes (e.g., "If we hit 5,000 coins, I'll do X").
    *   **Goal:** Give viewers a tangible reason to spend to unlock specific content or actions.
*   **Fan Clubs (Paid Access):**
    *   Users join a streamer's exclusive club using coins or a monthly subscription.
    *   **Perks:** Exclusive streams, special badges, and priority interaction/mentions.
    *   **Goal:** Build long-term loyalty and recurring revenue for creators.
*   **Pay to Join Live:**
    *   Viewers can spend coins to request to join the streamer's live broadcast (guest slot).
    *   **Goal:** Create a sense of exclusivity and allow fans to be "seen" by the audience.
*   **Co-Creation Control:**
    *   Viewers pay to influence the stream's direction (e.g., choosing the next game or giving the streamer a specific challenge).
    *   **Goal:** Make viewers feel like active participants in the content creation process.

## 🎯 16. Prediction Enhancers (Advanced Betting)
*   **Side Bets (User vs User):**
    *   Allow users to bet directly against each other on specific outcomes.
    *   **Goal:** Make betting more personal and competitive between viewers.
*   **Insurance Option:**
    *   Users can pay an extra fee (e.g., 10%) to insure their bet. If they lose, they get 50% of their stake back.
    *   **Goal:** Lower the perceived risk and encourage larger bets.
*   **High-Risk Hidden Pools:**
    *   Exclusive predictions with massive multipliers that are only visible to high-level users or VIPs.
    *   **Goal:** Create a sense of exclusivity and reward high-status users.
*   **Auto (AI) Predictions:**
    *   The system automatically generates simple predictions during the stream (e.g., "Will the streamer win the next round?").
    *   **Goal:** Keep the betting action constant without requiring manual setup from the streamer.

## 📱 17. Bigo-Style Live Stream Screen Layout
*   **🧭 Overall Structure:**
    *   **Top Bar:** Streamer info, LIVE badge, viewer count, coin count.
    *   **Main Video Area:** 70-80% of screen. Overlays for Chaos events, Polls, Easter eggs, and Gift animations.
    *   **Left Panel (Engagement Feed):** Vertical scrolling chat, system messages, and live reactions. Fades after 5-10s.
    *   **Right Panel (Action Stack):** Vertical buttons for Gifts, Polls, Battles, Chaos Indicator, and Predictions.
    *   **Bottom Action Bar:** Chat input, quick reactions (❤️ 😂 🔥 👏), coin balance, and shop button.
*   **⚡ Chaos Event UI:** Full-width banner ("🔥 CHAOS EVENT ACTIVE 🔥"), pulsing glow borders, light screen shake, and countdown timer.
*   **🗳 Poll UI (Control Stream):** Center popup with question and options (A/B/C). Each option shows a live-animating coin count bar.
*   **🎁 Easter Egg UI:** Random floating icons (🎁 💎 ⭐) that appear for 2-4 seconds. Tap to collect.
*   **⚔️ Multi-Stream Battle UI:** Top-center "STREAM A 🆚 STREAM B" with side bars for coin totals and a dynamic progress bar.
*   **🧠 UX Behavior Rules:**
    *   Real-time WebSocket updates (no refreshes).
    *   Fast animations (<300ms).
    *   Event hierarchy: Chaos > Chat > Gifts.
    *   **Key Principle:** "Everything competes for attention, but nothing blocks viewing."

## 🛠 18. Admin Control & Autopilot System
*   **Control Modes:**
    *   **ON:** Manual activation by admin/streamer.
    *   **OFF:** Feature completely disabled.
    *   **AUTOPILOT:** System-driven activation based on predefined logic (e.g., spending thresholds, time intervals, or random chance).
*   **Features Under Control:** Polls, Chaos Events, Easter Eggs, Flash Streams, and Big Spend Alerts.
*   **Admin Dashboard Integration:**
    *   Centralized panel to toggle modes for each feature globally or for specific streams.
    *   Real-time status indicators for active features.
    *   Configuration settings for Autopilot thresholds (e.g., "Trigger Chaos at 5,000 coins").

---

## 🎬 19. Stream Ending & Lifecycle Management
*   **Status-Based Visibility:**
    *   Rooms should have a `status` field (`live`, `ended`, `scheduled`).
    *   **Homepage Filtering:** The gallery must only display rooms with `status == 'live'`.
    *   **Direct Access Prevention:** If a user navigates to a room URL where `status == 'ended'`, they should see a "Stream Ended" summary screen (showing final stats like total likes, gifts, and duration) rather than the live interface.
*   **Cleanup Logic:**
    *   When a streamer clicks "End Stream", the system updates the document status.
    *   **Question for Brainstorming:** How do we handle "ghost" rooms if a streamer's connection drops without clicking end? (e.g., Heartbeat system or timeout).

## 🥚 20. Easter Egg Tracking & Rewards
*   **Collection Tracking:**
    *   We need a way to track which eggs a user has collected over time.
    *   **Inventory/History:** Add a `collected_eggs` subcollection to the user profile or a global `egg_claims` log.
*   **Profile Integration:**
    *   Show "Total Eggs Found" or a "Collection Gallery" in the user's profile.
*   **Reward Verification:**
    *   Ensure the reward (Beans/Diamonds) is accurately reflected in the user's balance immediately upon collection.

## 🛡️ 21. Dual-Layer Moderation System
*   **Global Moderators (Staff):**
    *   Appointed exclusively by the Admin.
    *   **Role:** The "Judges" of the platform. They handle the central **Report Queue**.
    *   **Powers:** 
        *   **Banning:** Can ban both streamers and users for specific durations: **Hours, Days, Weeks, Months, or Permanently**.
        *   **Unbanning:** Exclusive power to lift bans and restore account access.
        *   **Account Suspension:** Can temporarily or permanently disable accounts based on report severity.
    *   **Authority:** They review reports filed by both users and Room Moderators. Only Global Mods (and Admins) have the power to ban/unban.
*   **Room Moderators (Bouncers):**
    *   Appointed by the Host for their specific room.
    *   **Role:** Local enforcement. Their only job is to keep the chat clean and protect the streamer.
    *   **Powers:** Room-specific **Kick** and **Mute**. They do NOT handle reports; instead, they **file** reports to the Global Moderators.
*   **The Reporting Pipeline:**
    *   **User -> Global Mod:** Users can report streamers or other viewers for violations.
    *   **Room Mod -> Global Mod:** Bouncers can escalate local abuse to the staff for platform-wide action.
*   **Visual Identity:**
    *   **Staff Badge:** High-authority badge for Global Mods.
    *   **Bouncer Badge:** Smaller "Mod" icon for room-specific moderators.

## 🔒 22. Privacy & Content Protection
*   **Screenshot Policy:**
    *   **Public Rooms:** Screenshots are **Allowed**. This ensures users can capture evidence of violations for reporting.
    *   **Private Calls/Rooms:** Screenshots are **Strictly Banned**. Any user caught leaking private content will face an immediate permanent ban.
*   **Screen Recording Policy:**
    *   **General Users:** Screen recording is **Strictly Banned** platform-wide, especially in private sessions.
    *   **Admin Override:** Only the **Top Admin** has the authority to perform screen recordings in any room (public or private) for platform oversight and legal compliance.
*   **Technical Enforcement:**
    *   Implement "Screen Capture Detection" where possible (e.g., using Page Visibility API or specific browser flags).
    *   Display "Privacy Watermarks" in private calls to discourage leaks.

## 🏢 23. Agency Tier Logic
*   **Agency Structure:**
    *   Streamers can join Agencies.
    *   Agencies have tiers (Bronze, Silver, Gold, Diamond) based on total monthly diamonds generated by their streamers.
*   **Commission & Bonuses:**
    *   Agency owners receive a small percentage of their streamers' earnings.
    *   Higher tiers unlock better commission rates and exclusive platform support.
*   **Recruitment Tools:**
    *   Agency-specific dashboards to track streamer performance and recruitment.

## 🔊 24. Sound Design System
*   **Audio Implementation:**
    *   Download and include sound files in `/public/sounds/`.
    *   Use `new Audio('/sounds/file.mp3').play()` for interactions.
*   **Layered Sound Strategy:**
    *   Combine light clicks for taps, sparkles for gifts, and bass-heavy explosions for big gifts.
    *   Add optional ambient background loops for immersion.
*   **Sourcing:** Use free/licensed sources like Pixabay, Mixkit, or Zapsplat.

## 👥 25. Multi-Guest / Tile-Based Gifting System (Next Level)
*   **Targeted Logic:**
    *   Implement tile-specific gift targeting.
    *   Localized animations within the user's tile box.
*   **Multi-Target Gifting:**
    *   **Sequential Send**: Default behavior for multiple targets (Sender → A, then Sender → B).
    *   **Split Animation**: Premium behavior where one gift splits mid-air into multiple targets (triggered for 3+ targets).
    *   **UI Selection**: Tap tiles to highlight/select multiple recipients.
*   **Flying Gift Animation (Advanced):**
    *   **Curved Path**: Tile-to-Tile or Center-to-Tile trajectory using Bezier curves (`offset-path`).
    *   **Trail Effect**: Glowing particle trail (✨) that follows the gift.
    *   **Impact Explosion**: Visual burst (glow + expand + fade) when the gift hits the target tile.
    *   **Per-Gift Styles**: Unique visual signatures (trails, explosions) for Rose, Lion, Rocket.
*   **Combo Stacking System:**
    *   Implement "x5 COMBO 🔥" localized to the target tile.
    *   Build hype through persistent combo counters.
*   **Chaos Control:**
    *   Toned-down combo effects for multi-guest rooms.
    *   Global feed integration for social proof without full-screen takeover.
*   **Big Gift Flash:** Brief global banner for high-value gifts.
*   **Future Upgrades (Insane Level):**
    *   **Target Glow**: Tile briefly lights up on impact.
    *   **Sound Sync**: "Whoosh" during flight and "Boom" on impact.
    *   **Mini Combo Counter**: Small x3, x5 counters near the target tile.
    *   **Per-Gift Styling**: Unique trails and explosions (e.g., Pink for Rose, Gold for Lion).
    *   **Multi-Target UI**: Long-press mode for batch selection and "Send All" functionality.

## 🔥 26. Final God-Tier Layer (Streamer FX + AI Pin + Stickers)
*   **AI Spotlight System:**
    *   Trigger high-impact visual feedback (shake, gold glow, screen dim) for big gifts.
    *   Full-screen spotlight overlay for "Diamond" level contributions.
*   **AI Big Spender Pin:**
    *   Automatically pin top gifters to the top right of the stream.
    *   Create a "Competition for the Pin" mechanic to drive higher spends.
*   **Interactive Sticker System:**
    *   Streamers can add draggable text stickers to the screen.
    *   Use stickers for live goals, shoutouts, or room rules.
*   **Streamer Boost System:**
    *   Implement a controlled, transparent boost system for polls.
    *   **Limits**: 10-20% pool cap, one boost per poll, no late-stage sniping.
    *   **Modes**: Confidence Mode (pre-commit) and All-In Challenge (supporter rewards).
*   **High-Psychology Visuals:**
    *   **Live Profile Frames**: Animated, glowing frames for top contributors.
    *   **Animated Badges**: Shimmering and pulsing badges for status recognition.
    *   **Full-Screen Cinematic Gifts**: Ultra-premium sequences for the highest-value gifts.
*   **Sound Sync Engine:**
    *   Implement Whoosh (flight) and Boom (impact) sound effects.
    *   Add combo sound escalation (pitch/intensity increase).
*   **Streamer Reaction Hook:**
    *   Trigger visual animations on the streamer's camera feed during big gift events.
*   **Social Proof Engine:**
    *   Combine pinning, spotlighting, and global banners for a "Celebrity" feel for spenders.

## 🚀 27. Launch Preparation & Scaling
*   **Performance Optimization:**
    *   Ensure animations are GPU-accelerated and performant on mobile devices.
    *   Optimize Firestore listeners and state updates for high-concurrency rooms.
*   **Real Payments Integration:**
    *   Connect Paystack, Stripe, and Crypto gateways for real coin purchases.
*   **Deployment & Scaling:**
    *   Prepare the backend for high-traffic events and thousands of concurrent users.
    *   Implement robust error handling and logging for production stability.

## 🎥 28. Platform Core Infrastructure (Technical Modules)
*   **Animations Engine:**
    *   **Library:** `lottie-react`
    *   **Purpose:** Interactive animations for gifting and UI effects.
*   **Streaming (Agora):**
    *   **Streamers:** RTC Participant model for instant, real-time communication.
    *   **Viewers:** HLS (HTTP Live Streaming) for scalable, low-latency-balanced mass viewing.
*   **Image Processing (Sharp):**
    *   **Backend:** High-performance Node.js processing for assets and user photos.

## ⚔️ 29. Elite PK Battle Experience & Visuals
*   **PK Evolution (Point 18):** Advanced PK interaction system.
*   **PK Themes (Point 23):** We will have specific themes for PK battles (not just teams), defining the visual atmosphere.
*   **PK Designs (Point 30):** Custom-crafted designs for the PK interface.
*   **The Divider Line (Point 39):** The middle line dividing players will sometimes feature dynamic **Fire FX**.
*   **Chain Divider (Point 53):** A heavy chain will sometimes divide the screen. It stays until the counter stops.
*   **Voting Chain (Point 57):** During the vote counting phase, the divider chain becomes a central visual element.
*   **The Lock Rock (Point 103):** The chain features a massive "Lock Rock" – a heavy stone lock suspended from the chain.
*   **Swinging Rock Mechanic (Point 132):**
    *   Once counting starts, the Rock swings left and right like a pendulum.
    *   Each player has a "Glass Panel" in front of their screen view.
    *   The Rock moves based on the leading/losing status.
*   **The Final Blow (Point 138):** When a loser is determined, the Swinging Rock delivers a powerful hit to that player's side.
*   **Glass Break Effect (Point 147):** The rock hits and shatters the glass in front of the losing streamer's screen.
*   **Fire Theme Eruption:** The fire divider moves to erupt across the loser's screen. Applies a "Burn Mask" effect (charred/survivor look) to the loser's stream after the eruption.
*   **Water Theme Fountain:** A fountain or stream of water between players as the divider.
*   **Water Splash Punishment:** Loser is "washed" by a heavy splash of chaotic, dripping water dropping from the top of their screen.
*   **Implementation Strategy (Point 201 & 218):** 
    *   Initial focus is on the design and logic.
    *   Decision pending on whether to use pure code (CSS/SVG) or assets (Animations).

## 👨‍👩‍👧‍👦 30. Family & Referral System
*   **Referral Engine:**
    *   Generation of unique referral codes and deep-links for every user.
    *   Dashboard to track successful referrals and earned rewards.
*   **Sign-up Flow Integration:**
    *   **Referral Field:** Add a dedicated field for referral codes during account creation.
    *   **Incentivized Onboarding:** New users are automatically added to the inviter's "Family" upon successful sign-up with a code.
    *   **Extended Profile Capture:** Even for social/Gmail logins, implement a mandatory (but skippable) secondary step to fill in profile details that will be displayed on their public page.
*   **Family Hierarchy & Perks:**
    *   **Automatic Linking:** Referred users are permanently (or semi-permanently) linked to the referrer's family tree.
    *   **Dual-Gain Rewards:** Both the referrer and the new user gain benefits (coins, badges, or ranking boosts).
    *   **Family Dashboard:** A shared space for family members to see their collective contribution to the platform.

## ⚔️ 31. Unified PK Battle & Interactive Arena System (Master Blueprint)
*   **Aesthetic UI Layer Restructuring (Solving the "Messy Room" Overlaps):**
    *   **Observed Overlaps in Screen Analysis:**
        *   *AD LIVE / NVIDIA STREAM floating promo cards:* Currently override the side action buttons, causing clutter.
        *   *Centered Modal Collisions:* "settlement of the PK" and "VICTORY! FORFEIT: DO 10 PUSHUPS" panels cover up real-time badges ("HNM 🦋🌹") and active chat components.
        *   *Unbounded Feeds:* High-intensity comment feeds and "sent 99x Gift Box!" alerts stack on top of bottom controllers, preventing clean inputs.
        *   *State Badges:* Hexagonal status indicators (e.g. "LOSS") overlap streamer feeds in a cramped arrangement.
    *   **Resolution Strategy:**
        *   Create standard horizontal zone boundaries or custom collapsible drawers for AD cards.
        *   Implement a central overlay manager (queue structure) so active animations, settlement modals, and interactive popups play sequentially rather than concurrently.
        *   Use standardized glassmorphism panels with bounded clipping heights to restrict chat bubbles from escaping into the active combat space.
*   **Predictions & Community Betting Pools:**
    *   **Wagers on PK Thresholds:** Let fans place side-bets (e.g., "Will Host win Round 3 with >1,000 diamond margin?").
    *   **Prediction Bar Sync:** Embed dedicated micro prediction bars that sync predictions inside the active PK progress UI.
*   **Group & Multi-Stream PK Battles (2v2 / 4v4 matches):**
    *   **Flexible Grids:** Support multi-viewport side-by-side video feeds matching participants.
    *   **Unified Tug-of-War Score:** Aggregate team points in real-time onto a shared central bar.
*   **Comprehensive Interactive Voting Pools:**
    *   Incorporate active voting modules into the battle layout, letting voters apply multipliers or dynamic shields to their chosen side.

---

## 📝 To-Do List (Pending Discussion)
- [ ] **Infrastructure Upgrade: Streaming** - Integrate Agora SDK (RTC for Streamers, HLS for Viewers).
- [ ] **Infrastructure Upgrade: Animations** - Install `lottie-react` and set up the global animation overlay.
- [ ] **Infrastructure Upgrade: Backend** - Configure Node.js server with `sharp` for extreme image processing.
- [ ] Implement "User Management" in Admin Dashboard (to appoint Global Mods).
- [ ] Design the "Report Queue" interface for Global Moderators.
- [ ] Implement Timed Ban logic (Hours, Days, Weeks, Months, Permanent).
- [ ] Create "Unban" functionality for Global Moderators.
- [ ] Implement "Room Moderator" assignment UI for streamers.
- [ ] Create "Kick/Mute" local actions for Room Moderators.
- [ ] Implement "Report to Staff" escalation button for Room Moderators.
- [ ] Design the "Staff" and "Bouncer" badges.
- [ ] Implement "Privacy Protection" logic for Private Calls (Screenshot/Recording blocks).
- [ ] Add "Admin Recording" override permission.
- [ ] Implement "Stream Ending" logic (status update + gallery filtering).
- [ ] Design the "Stream Ended" summary screen for viewers.
- [ ] Brainstorm: How to handle streamers who disconnect abruptly? (Heartbeat/Timeout).
- [ ] Implement "Easter Egg Collection History" for user profiles.
- [ ] Verify reward balance updates for all egg types.
- [ ] Define exact "Held Back" percentages.
- [ ] Design the "Streamer Task Center" UI.
- [ ] Map out the Private Call UI for both Streamer and User.
- [ ] Decide on the "Dare the Streamer" verification process.
- [ ] Finalize the "App Cut" vs "Streamer Cut" math.
- [ ] Research SVGA player integration for React.
- [ ] Prototype the "Behind the Chat" animation layering.
- [ ] Design the "Weighted Poll" UI component.
- [ ] Map out the "Chaos Event" trigger logic.
- [ ] Design the "VIP Entrance" animation system.
- [ ] Create UI mockups for "Near Win" notifications.
- [ ] Define the list of "Micro-Spending" triggers.
- [ ] Design the "Live Rank" ticker.
- [ ] Create a list of "Exclusive Chat Privileges" by tree.
- [ ] Map out the "Big Spend Alert" animation.
- [ ] Design the "Daily Missions" dashboard.
- [ ] Map out the "XP and Level" progression curve.
- [ ] Design the "Loot Box" opening animation.
- [ ] Implement the "Streak" tracking logic.
- [ ] Design the "Flash Stream" notification banner.
- [ ] Implement the "Expiring Coins" timer logic.
- [ ] Create the "Last Seconds Surge" visual effect.
- [ ] Design the "Streamer Challenge" progress bar.
- [ ] Map out the "Fan Club" subscription tiers and perks.
- [ ] Implement the "Pay to Join" guest request logic.
- [ ] Design the "Side Bet" interface.
- [ ] Implement the "Bet Insurance" logic.
- [ ] Map out the "AI Prediction" trigger system.
- [ ] Create React component structure for the Bigo-style layout.
- [ ] Connect frontend components to WebSocket architecture.
- [ ] Implement `polls`, `poll_options`, and `votes` Firestore collections.
- [ ] Create `POST /poll/vote` cloud function with atomic transaction.
- [ ] Implement `easter_eggs` and `user_egg_claims` collections.
- [ ] Create random spawn logic for Easter Eggs.
- [ ] Implement `chaos_events` and `stream_activity` tracking.
- [ ] Create threshold trigger logic for Chaos Events.
- [ ] Design the Admin Control Dashboard UI.
- [ ] Implement the "Autopilot" logic for each interactive feature.
- [ ] Create the state management system for feature toggles (ON/OFF/AUTO).
- [ ] **Advanced Gifting System (Safe Mode)**
    - [ ] Implement `activeGifts` and `comboMap` logic in `LiveStream`.
    - [ ] **Insane Combo FX System**: Implement `triggerInsaneFX` with center explosion text, screen shake, and `explosion.mp3` sound.
    - [ ] Create `GiftModal` with multi-page paging (Page 1 / Page 2).
    - [ ] **Hold-to-Send & Multiplier**: Implement `startHold`/`stopHold` logic (200ms interval) for spam gifting.
    - [ ] **TikTok-Style Swipe Gesture Panel**: Implement real touch swipe detection (left/right) and page indicator dots.
    - [ ] Implement local coin deduction (Safe Mode) for testing.
    - [ ] Add `mockBuyCoins` and `cryptoMock` for simulated payments.
    - [ ] Apply "Pop" animations and hover scale effects to gift items.
- [ ] **Elite Live Stream Experience**
    - [ ] **Particle FX Engine**: Implement `triggerFX` with 20+ dynamic particles and `explosion.mp3`.
    - [ ] **Floating Hearts System**: Add `sendHeart` logic with upward floating animations.
    - [ ] **Live Chat System**: Build the real-time chat display with user attribution.
    - [ ] **Live Leaderboard**: Implement real-time top-3 sender tracking during streams.
    - [ ] **Premium UI Layout**: Organize Video, Chat, Hearts, Leaderboard, and Controls into a professional hierarchy.
- [ ] **Ultra Premium UI & Content System**
    - [ ] **Glassmorphism & Neon UI**: Apply blurred panels, soft borders, and neon glow effects to the live stream interface.
    - [ ] **5-Second Clip System**: Implement `recordClip` using `MediaRecorder` and `captureStream`.
    - [ ] **Clip Preview UI**: Create the on-screen preview stack for recorded "moments."
    - [ ] **Firestore Clip Storage**: Connect the clip system to the `clips` collection for platform-wide sharing.
    - [ ] **Radial Background Depth**: Implement cinematic radial gradients for the stream container.
- [ ] **Final Elite Social & Content System**
    - [ ] **Auto Clip -> Story System**: Implement automatic story generation from 5-second clips.
    - [ ] **Follow System**: Create the one-tap follow logic with Firestore persistence.
    - [ ] **Lottie Animation Engine**: Integrate `lottie-react` and set up the gift animation overlay.
    - [ ] **Profile Story Grid**: Build the profile page with filtered story previews.
    - [ ] **Story Feed UI**: Design the horizontal auto-play story bar for live streams.
- [ ] **Final Expansion: VIP & Growth Ecosystem**
    - [ ] **VIP Level & Badge System**: Implement `useVIP` hook and `VIPBadge` component.
    - [ ] **Lucky Pair Gift System**: Create the consecutive gift detection and bonus trigger logic.
    - [ ] **Discover Page**: Build the central stream hub with Firestore listing.
    - [ ] **Follow System Upgrade**: Refine the `follows` collection structure with timestamps.
- [ ] **Final Elite Layer: Competition & Intelligence**
    - [ ] **Ranking System**: Implement `useRanking` hook and `RankingBoard` component for daily/weekly tracking.
    - [ ] **Auto-Reward System**: Create the `rewardTopUsers` logic to distribute coins to top senders.
    - [ ] **Smart Discover Algorithm**: Implement the scoring formula `(viewers*2 + gifts*3 + followers)` in `DiscoverSmart`.
    - [ ] **Per-Gift Lottie System**: Set up the `GiftAnimation` component with a mapping of gift names to JSON files.
    - [ ] **Gift FX Layer**: Integrate the `GiftFXLayer` into the live stream UI.
- [ ] **Next Level Polish**
    - [ ] **Final Polish Pass**: Refine all animations, easing curves, and UX smoothness for top-tier production feel.
    - [ ] **Sound Design System**: Implement layered audio feedback for taps, gifts, and ambient atmosphere.
    - [ ] **Multi-Target Gifting System**: Implement multi-select UI, sequential/split animations, and tile-based feedback.
    - [ ] **God-Tier Layer**: Implement the **Full Emotional Loop (Addiction Loop)**:
        - [ ] **Launch & Impact**: Flying gifts with Whoosh/Boom sounds.
        - [ ] **Streamer FX**: Screen shake, gold glow, and AI Spotlight.
        - [ ] **Status Systems**: AI Big Spender Pinning, Profile Frames, and Animated Badges.
        - [ ] **Interactive Stickers**: Draggable text stickers for streamer goals.
        - [ ] **Streamer Boost**: Controlled poll influence with limits and transparency.
        - [ ] **Firebase Integration**: Implement Cloud Functions for `voteOnPoll`, `streamerBoost`, `triggerChaos`, and `spawnEgg` using `runTransaction`.
        - [ ] **Frontend Connection**: Connect React components (`LivePoll`, `ChaosBanner`, `EasterEggs`) to Firestore `onSnapshot` and Cloud Functions.
        - [ ] **Premium Polish**: Implement **Framer Motion** animations and **Glass + Blue** UI theme across all interactive components.
        - [x] **Advanced Engagement**: Implemented the **Visual Combo System** and **Leaderboard Glow** for top-spender recognition.
    - [x] **SEO & GEO Optimization**: Implemented advanced meta tags, JSON-LD, Sitemap, Robots.txt, and AI Citation hooks for #1 ranking in USA/UK/Europe.
    - [x] **Agency Tier Logic**: Implemented agency structure, commissions, and tier-based bonuses.
    - [ ] **Launch Prep**: Integrate real payments (Stripe/Paystack/Crypto) and optimize for production scaling.
    - [x] **Smart Discover Algorithm**: Implemented AI-based stream recommendations using Gemini API.
    - [ ] **Per-Gift Cinematic Animations**: Create unique Lottie/GIF sequences for every gift in the inventory.
    - [ ] **VIP Levels & Badges**: Implement a ranking system with daily/weekly rewards.
    - [ ] **Advanced Lottie Animations**: Create unique cinematic sequences for each premium gift.
    - [ ] **Real Video Streaming**: Integrate WebRTC or RTMP for professional-grade live video.
    - [ ] **Smoother Animations**: Implement easing curves and layered motion for depth.
    - [ ] Upgrade combo effects to "Insane Level" (screen shake + explosions + full screen flash).
    - [ ] **Smart Gift Sending**: Add hold-to-send and combo multiplier button.
    - [ ] Connect real payments (Paystack + Stripe + Crypto).
    - [ ] Upgrade gift UI to premium (Bigo level).
- [ ] **PK Battle Graphics (Points 18, 23, 30)**: Design the themed PK battle interface.
- [ ] **PK Interactive FX (Points 39, 53, 57)**: Implement the divider FX (Fire, Heavy Chain).
- [ ] **PK "Glass Break" Mechanic (Points 103, 132, 138, 147)**: Create the Swinging Rock and shattering glass animations for PK finales.
- [ ] **PK Fire & Water Themes**: Implement Eruption/Burn and Splash/Wash effects for losers to make battles more fun.
- [ ] **PK Implementation Research (Points 201, 218)**: Evaluate whether to use code-driven or asset-driven approaches for advanced PK visuals.
- [ ] **Referral Code System**: Design and implement the referral code generation and validation logic.
- [ ] **Family Integration**: Connect the referral system to the "Family" logic, ensuring automatic linking.
- [ ] **Enhanced Sign-up Form**: Create a multi-step registration flow to collect additional profile info post-social login.
- [ ] **Referral Performance Dashboard**: Build a UI for users to track their invites and family growth.
- [ ] **Technical Implementation Research**: Decide on the flexibility of family membership (joining/leaving rules).
- [ ] **PK Master Layout Clean Up (Messy Room Fix)**:
    *   [ ] Refactor overlapping floating elements (AD promo panels, quick-action widgets, chats) to use bounded absolute-grid containers.
    *   [ ] Implement a centralized React Overlay Queue to safely orchestrate full-screen splash modals (Intro horns, settlement forfeits) so they never overlap.
- [ ] **Interactive PK Votes & Predictions Engine**:
    *   [ ] Build an overlay for live wagers and side-bets, with reward distribution on settlement.
    *   [ ] Connect viewer prediction statistics to the live PK arena progress indicator.
- [ ] **Group PK System (2v2 / 4v4 Team Matches)**:
    *   [ ] Design multi-window viewport configurations for teams.
    *   [ ] Integrate synchronized live web-sockets to manage combined points.
- [ ] **Platform-Provided Standard Agency-Streamer Contract Formulation**:
    *   [ ] Formulate a cohesive standard contract template directly inside the application for signed streamer relationships.
    *   [ ] Model automated platform-enforced buyout parameters, regional percentage multipliers, minimum active broadcast targets, and automatic weekly split payouts.
    *   [ ] Standardize the document to act as a system bond between **The Agency** and **The Streamer**, bypassing manual offline contract uploads.

