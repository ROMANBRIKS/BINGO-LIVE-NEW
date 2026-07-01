# TODO & Architectural Specs: VIP Nobles and Streamer Gemstone Ranks

This document serves as the central reference, roadmap, and design log for our upcoming **VIP Noble & Streamer Gemstone Ranks** implementation. It covers everything discussed regarding the split paths for **Gift-Givers (VIP Spenders)** and **Streamers (Hosts/Earners)**, including raw data, diamond/gemstone values, and actionable next steps.

---

## 1. Core Architectural Concept

To create a balanced and prestigious ecosystem, we separate the progression paths for the two primary actors in our live streaming platform:

```
                  ┌───────────────────────────────────────────────┐
                  │               BINGO LIVE APP                  │
                  └───────┬───────────────────────────────┬───────┘
                          │                               │
       path A: SPENDING   ▼                               ▼   path B: RECEIVING
    ┌───────────────────────────┐                   ┌───────────────────────────┐
    │     GIFT-GIVERS / VIPS    │                   │   STREAMERS / ANCHORS     │
    ├───────────────────────────┤                   ├───────────────────────────┤
    │  • Diamond-driven spend   │                   │  • Gemstone-driven earn   │
    │  • 22 Noble titles        │                   │  • Ruby, Sapphire, etc.   │
    │  • 6 VIP levels (1–6)     │                   │  • Host Levels (1–119)    │
    └───────────────────────────┘                   └───────────────────────────┘
```

---

## 2. Path A: Gift-Givers / VIP Spenders (The Diamond Path)

All gift-givers rank up their **noble titles** and **VIP levels** based on the total number of **Diamonds purchased and spent**. 

### 💎 Diamond Color & Prestige Grading (Concept discussion)
In our rankings and level displays, we will map VIP status to diamond color rarities from most precious down to basic consumer jewelry:
1.  **Fancy Red Diamond** (The absolute rarest, most expensive and extremely precious colored diamond in existence).
2.  **Blue Diamond** (Extremely rare and highly premium, colored by boron).
3.  **Pink Diamond** (Highly sought after, ultra-luxe prestige).
4.  **Orange / Green Diamond** (Rare colored-defect diamonds).
5.  **Yellow / Canary Diamond** (Elegant, sparkling colored diamond).
6.  **Colorless / Clear White Diamond** (The popular jewelry standard - beautiful and common).
7.  **Silver / Champagne / Cognac Diamond** (Warm, standard entry levels).

### 👑 Spender Nobles & VIP Mapping Spec
There are **22 Noble titles** mapped to **6 general VIP brackets** depending on local level tiers (spending milestones):

*   **VIP 1 (Levels 1–9)**
    *   `Knight / Dame` (At Level 3 — 7,000 Cumulative Diamonds Spent)
    *   `Viscount / Viscountess` (At Level 5 — 17,000 Cumulative Diamonds Spent)
    *   `Earl / Countess` (At Level 7 — 31,000 Cumulative Diamonds Spent)
*   **VIP 2 (Levels 10–29)**
    *   `Marquis / Marchioness` (At Level 10 — 60,000 Cumulative Diamonds Spent)
    *   `Baron / Baroness` (At Level 15 — 120,000 Cumulative Diamonds Spent)
    *   `Viscount Elite / Viscountess Elite` (At Level 20 — 180,000 Cumulative Diamonds Spent)
    *   `Earl Elite / Countess Elite` (At Level 25 — 240,000 Cumulative Diamonds Spent)
*   **VIP 3 (Levels 30–49)**
    *   `Duke / Duchess` (At Level 30 — 300,000 Cumulative Diamonds Spent)
    *   `Grand Duke / Grand Duchess` (At Level 40 — 450,000 Cumulative Diamonds Spent)
    *   `Archduke / Archduchess` (At Level 49 — 630,000 Cumulative Diamonds Spent)
*   **VIP 4 (Levels 50–59)**
    *   `Prince / Princess` (At Level 50 — 660,000 Cumulative Diamonds Spent)
    *   `Crown Prince / Crown Princess` (At Level 55 — 810,000 Cumulative Diamonds Spent)
    *   `King / Queen` (At Level 59 — 930,000 Cumulative Diamonds Spent)
*   **VIP 5 (Levels 60–89)**
    *   `Emperor / Empress` (At Level 60 — 965,000 Cumulative Diamonds Spent)
    *   `Great Emperor / Great Empress` (At Level 67 — 1,210,000 Cumulative Diamonds Spent)
    *   `Legendary Emperor / Legendary Empress` (At Level 74 — 1,455,000 Cumulative Diamonds Spent)
    *   `Supreme Emperor / Supreme Empress` (At Level 81 — 1,700,000 Cumulative Diamonds Spent)
    *   `Overlord / Overlady` (At Level 89 — 1,980,000 Cumulative Diamonds Spent)
*   **VIP 6 (Levels 90–119)**
    *   `Demi-God / Demi-Goddess` (At Level 90 — 2,020,000 Cumulative Diamonds Spent)
    *   `God of War / Goddess of War` (At Level 100 — 2,420,000 Cumulative Diamonds Spent)
    *   `Celestial God / Celestial Goddess` (At Level 110 — 2,820,000 Cumulative Diamonds Spent)
    *   `Global God / Global Goddess` (At Level 119 — 3,180,000 Cumulative Diamonds Spent)

---

## 3. Path B: Streamers & Anchors (The Gemstone Path)

Where gift-givers climb via the Diamond ladder, **Streamer/Host levels** are themed around beautiful colored precious gemstones, honoring their earnings and entertainment value. 

### 🌺 The Deep Crimson Rubies, Sapphires & Gemstone Hierarchy
For Streamers, instead of plain numbers, we will design badge layers themed around non-diamond gemstones which have deep mystical and precious properties:
*   **The Deep Crimson Ruby**: Crimson red is associated with passion, energy, and royal entertainment. It represents top-tier, high-earning streamers who pull in outstanding daily numbers.
*   **Royal Sapphire**: Deep ocean blue, symbolizing wisdom, elegance, and steady streaming power.
*   **Emerald**: Rich green, indicating growth, active communities, and soaring fan clubs.
*   **Amethyst**: Violet/purple, for mysterious aura and unique, artistic performances.
*   **Opal / Pearl**: Sparkling white aura, denoting rising creators and clean, welcoming livestreams.

### 💰 Streamer Valuation Economics
To align with the exchange system, we keep in mind:
*   **210 Diamonds / 210 Beans = $1.00 USD**.
*   Vid-calls at $0.50/min = 105 beans per minute.
*   Aud-calls at $0.25/min = 52 beans per minute.
*   Host tiers will scale alongside bean earnings (e.g., milestone points to hit new gemstone ranks like Ruby Elite).

---

## 4. Implementation Checklist & Todo List

When we return to "attack" this page and script, we will follow these structured tasks:

- [ ]  **Create `src/gemstoneLogic.ts`**:
    *   Define the streamer level-to-gemstone mapping (e.g., Pearl tier, Amethyst tier, Emerald tier, Sapphire tier, Ruby tier, Celestial Ruby tier).
    *   Establish how many lifetime or monthly Beans earned are needed to progress through each gemstone rank.
- [ ]  **Draft the VIP Noble UI Components**:
    *   Design clean level banners inside `src/components/` utilizing custom color themes for givers (Diamond colors: Red, Blue, Pink, Orange), displaying current title shields.
- [ ]  **Draft the Streamer Gemstone UI Components**:
    *   Design a dedicated live badge component for host profiles displaying their gemstone rank (e.g., a fiery glowing **Crimson Ruby** for high-volume streams, or a deep shimmering **Royal Sapphire** for VIP partners).
- [ ]  **Update Profile & Creator Center**:
    *   Integrate both paths on the profile screen: show "VIP Noble Rank: Archduke (VIP 3)" for spending and "Streamer Status: Emerald Star" for receiving.
- [ ]  **Integrate with Firestore Rules & Database**:
    *   Reflect the fields `totalDiamondsSpent` (for gifters) and `totalBeansReceived` (for streamers) clearly.

---

## 5. Summary of Key Concepts Discussed So Far

1.  **Rarity Spectrum**: Givers = Diamonds (with Fancy Red at the top, down through custom colored diamonds to clear/white). Streamers = Rich Gemstones (Ruby, Sapphire, Emerald, Amethyst, Opal, Pearl) which visually distinguishes who the spending whales are vs. who the superstar streams are when looking at badges in a chat room.
2.  **No Confusion with Rubies/Sapphires**: By reserving the colored gemstones entirely for streamers and diamonds entirely for givers, the distinction is perfectly clear and highly rewarding for both groups of users.
