# 🚀 TikTok Live / Bigo-Level Gifting System Blueprint

This document outlines the end-to-end architecture and implementation plan for a real-time gifting engine and monetization system.

---

## 🧠 SYSTEM OVERVIEW
1. **🎞 Animated Gifts:** Support for GIFs and Lottie animations.
2. **💰 Coin System:** User wallet for purchasing and spending coins.
3. **🎯 Send Gift:** Real-time transaction and event triggering.
4. **🔴 Live Gift Popups:** TikTok-style UI overlays for active streams.
5. **📊 Admin Analytics:** Revenue tracking and engagement metrics.

---

## 🎬 1. ANIMATED GIF / LOTTIE GIFTS
- **Goal:** Move beyond static images to dynamic animations.
- **Data Structure (Firestore: `gifts`):**
  ```json
  {
    "name": "Rose",
    "price": 10,
    "type": "gif", 
    "image": "https://...", 
    "animationUrl": "https://...", 
    "createdAt": "timestamp"
  }
  ```
- **Admin Upload Upgrade:** Add a type selector (GIF vs. Lottie).
- **Rendering:** Use `lottie-react` for Lottie files and standard `<img>` for GIFs.

---

## 💰 2. COIN SYSTEM (WALLET)
- **Goal:** Manage user currency for gifting.
- **User Document (`users`):**
  ```json
  {
    "uid": "...",
    "coins": 1000,
    "username": "..."
  }
  ```
- **Operations:**
  - **Add Coins:** Admin/Payment trigger using `increment(value)`.
  - **Deduct Coins:** Triggered during gift send using `increment(-price)`.

---

## 🎯 3. SEND GIFT (REAL-TIME CORE)
- **Goal:** The heart of the interaction.
- **Event Document (`liveGifts`):**
  ```json
  {
    "senderId": "...",
    "senderName": "...",
    "receiverId": "...",
    "giftId": "...",
    "giftName": "...",
    "animationUrl": "...",
    "price": 50,
    "createdAt": "serverTimestamp()"
  }
  ```
- **Logic:** Atomic transaction to deduct coins and create the `liveGifts` record.

---

## 🔴 4. LIVE GIFT POPUPS (TikTok Style)
- **Goal:** Real-time UI feedback for streamers and viewers.
- **Implementation:**
  - `onSnapshot` listener on `liveGifts` filtered by `receiverId`.
  - Queue system for multiple gifts (display for ~4 seconds).
  - CSS animations for sliding up and fading out.

---

## 📊 5. ADMIN ANALYTICS DASHBOARD
- **Goal:** Track business performance.
- **Metrics:**
  - **Total Revenue:** Sum of all `price` fields in `liveGifts`.
  - **Top Gifts:** Frequency analysis of `giftName`.
  - **Top Senders:** Aggregation by `senderId`.

---

## ⚡ FINAL SYSTEM FLOW
1. Admin uploads animated gift 🎞
2. User buys coins 💰
3. User sends gift 🎯
4. Coins deducted 💸
5. Gift appears LIVE on stream 🔴
6. Stored in database 📦
7. Analytics updates 📊

---

## ⚠️ NEXT LEVEL UPGRADES
- 🔥 Combo gifts (x10, x100 spam effect)
- 🏆 Leaderboards (top sender of the day)
- 💳 Stripe / Crypto payments for coins
- 🎥 OBS stream overlay integration
- 🤖 Fake viewers + gift simulation (for testing)
