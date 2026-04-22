# Bingo Live: Competitive Strategy & Market Knockout Plan

This tracker records our strategic decisions and implementation roadmap to disrupt the live streaming market.

## Phase 1: The "Math Advantage" (Financial Alpha)
- [ ] **Standardized 60% Payout Model:** finalize the "Creator Split" at 60% (Creator) / 40% (Platform) to cover operational/employee costs while still beating TikTok/Bigo rates.
- [ ] **Comparison Dashboard (Wallet Integration):** Implement a "Truth Section" in the Wallet and Creator Center.
    - Show: "What you earned on Bingo" vs. "Estimated earnings on TikTok for the same activity."
    - Visual: A side-by-side bar chart showing the "Platform Tax" creators are saving.
- [ ] **Mobile Money Fast-Track:** Priority integration for O-Pay (Nigeria), M-Pesa (Kenya), etc.

## Phase 2: The Migration & "Status Match" Tooling (Refugee Strategy)
- [ ] **The "Status Match" Program & Security:**
    - Mechanism: User uploads a screenshot + temporarily adds "Verified Bingo ID: [UID]" to their Bigo/TikTok bio.
    - **Gemini-Powered Verification:** Use Gemini 3 Flash (Multimodal) to scan screenshots. It identifies User ID, Noble Tier, and total spending/recharge history while detecting forgeries/UI inconsistencies.
    - Ownership Check: A simple bot or admin checks the original platform bio to ensure the account truly belongs to the claimant.
    - **30-Day Expiration Rule:** Migration status (Noble/Discount) is valid for 30 days. To retain the status, the user must meet internal Bingo spending targets.
- [ ] **Evidence-Based Grading (The "Fair Grade" System):**
    - Users can upload **Total Recharge/Spending History** screenshots.
    - Logic: If a user's USD spend exceeds their current rank's requirement, Bingo Live can pre-emptively upgrade them to a higher Bingo title (e.g., matching a high-spending "Marquis" to a Bingo "King").
    - Requirement: Platform ID must be visible and match the Bingo profile.
- [ ] **The "Bingo Blitz 20" (Target Platform Mapping):**
    - **The Universal Status Matcher:** Values normalized to **USD Spent** to ensure "butt-to-butt" fairness across all platforms.
    - **Target List:**
        - 1. **Bigo Live:** (Nobles: Knight to Monarch)
        - 2. **TikTok:** (Gifter levels 1-60. Lv 40=King, Lv 50=Emperor)
        - 3. **Tango Live:** (Bronze to Diamond. Platinum=Archduke, Diamond=Overlord)
        - 4. **Poppo Live:** (Noble title matching)
        - 5. **Chamet:** (User levels. Lv 40 = God of War)
        - 6-20: Yalla, MICO, Likee, Ahlan, YoHo, StarMaker, Uplive, LivU, Hakuna, Nimo TV, Azar, OmeTV, Tiki, Bolo.
- [ ] **The "Migration Discount" (22-Title Granular Mapping):**
    - **VIP Sector (13 Royal Titles - 2% to 25%):**
        - Knight / Dame (VIP 1): 2%
        - Viscount / Viscountess (VIP 1): 4%
        - Earl / Countess (VIP 1): 6%
        - Marquis / Marchioness (VIP 2): 8%
        - Baron / Baroness (VIP 2): 10%
        - Viscount Elite (VIP 2): 12%
        - Earl Elite (VIP 2): 14%
        - Duke / Duchess (VIP 3): 16%
        - Grand Duke / Duchess (VIP 3): 18%
        - Archduke / Archduchess (VIP 3): 20%
        - Prince / Princess (VIP 4): 22%
        - Crown Prince / Princess (VIP 4): 23.5%
        - King / Queen (VIP 4): 25% (**VIP Sector Cap**)
    - **SVIP Sector (9 Elite Titles - 27% to 45%):**
        - Emperor / Empress (VIP 5): 27%
        - Great Emperor (VIP 5): 29%
        - Legendary Emperor (VIP 5): 31%
        - Supreme Emperor (VIP 5): 33%
        - Overlord / Overlady (VIP 5): 35% (**SVIP-1 Cap**)
        - Demi-God / Goddess (VIP 6): 38%
        - God of War (VIP 6): 40%
        - Celestial God / Goddess (VIP 6): 42%
        - Global God / Goddess (VIP 6): 45% (**Market Buster**)
    - *Strategic Alignment:* These discounts map "butt to butt" with the spending amounts and noble titles defined in our `VIP_NOBLE_MAPPING.md`.
- [ ] **Top Streamer "Fresh Start" Perks (The VIP Host Package):**
    - **Algorithmic Boost:** Migrating high-level streamers get "Priority Spotlight" (top of home page) for their first 7 days to help them rebuild their fan base.
    - **Sign-on Bonus Payout:** Offer a temporary **65% payout rate** (instead of 60%) for the first 30 days as an incentive to move their "Whales" over.
    - **"Legendary Refugee" Badge:** A unique, time-limited profile glow that identifies them as a proven talent from the "Old World."
- [ ] **Bio-Sync Import:**
    - *Auto-Retrieval:* Profile picture, Username, Bio text, and Category (e.g., Music, Gaming, Chat).
    - *Manual Addition:* Local bank/payment info, mobile money verification, and setting their "Primary Language" for targeted room placement.

## Phase 3: The "Smart Bot" Audience System
- [ ] **Dynamic Floor Management:**
    - High human traffic = Zero bots.
    - Low human traffic (dry stream) = Gradual bot injection to maintain a "base" energy level.
    - *Constraint:* Real-time reduction of bots as real humans join.
- [ ] **Bot Identity Logic:** 
    - Bots NEVER receive VIP/Noble tiers or entry effects.
    - Bots have "Plain" identities to distinguish from high-tier whales.
- [ ] **Verified Human Certification:** A "High-Transparency" badge for rooms that reach 100% human status.

## Phase 4: Regional Dominance & Culturally Linked Economy
- [ ] **Culturally Integrated Gifts:** Launch "Naira Pulse," "London Fog," and "USA Pride" gift sets.
- [ ] **GEO-Baiting / News Hub:** Use the `/news` and `/trends` routes to publish daily stats proving Bingo's payout superiority over legacy platforms.

## Phase 6: Non-Destructive UI Implementation (Bigo-Style Integration)
- [ ] **The "Plugin & Pop-over" UI Architecture:**
    - **Room UI (Floating Treasure Layer):** Add an animated "Mystery Box" floating widget for lottery games without moving chat/gift buttons.
    - **Social Feed (Earning Layer):** Add a 🎁 Gift Icon to `PostsPage.tsx` next to Like/Comment to enable 24/7 earning for creators.
    - **Homepage (Global Connectivity):** Add a high-visibility Region Bar ([🏠 All] [🌍 Global] [🇳🇬 Nigeria] [🇬🇧 UK] [🇺🇲 USA]).
    - **Profile Entry:** Add a distinct "Migration Portal" gold banner to the profile header leading to `/migration`.
    - **Visual Injection:** Wrap components in `NobleFrame` globally (Chat, Leaderboards, Room Seats) to show off user status.

## Phase 7: The "Talent Web Bridge" (GitHub Bio Strategy)
- [ ] **Professional Talent ID Cards (The "Bio-Bait"):**
    - **The Concept:** A web-optimized "Mini-Profile" accessible via a browser (no app needed to view).
    - **The URL:** Generate a high-trust URL (e.g., `bingo-live.io/talent/[username]`) that creators put in TikTok/Bigo bios.
    - **Content Hub:** Creators upload "Gifting Portfolios" (exclusive clips/photos) inside the Bingo app. These automatically "sync" to their web Talent ID Card.
    - **The Conversion Funnel:**
        - Fan clicks bio link -> Lands on Talent ID Card (Web).
        - Fan sees "Matched Ranking" (e.g., "Verified Bigo King") + Exclusive Clips.
        - Fan clicks "Support/Join Live" -> Deep Link opens Bingo App or leads to Download Page.
    - **24/7 Gifting:** Even if the streamer is offline, the web page displays "Support my Content" buttons linked to Bingo's payment gateway.

---
*Note: Every conversation we have is added here. No code changes will be made until a specific "Go-Ahead" is given by the user.*
