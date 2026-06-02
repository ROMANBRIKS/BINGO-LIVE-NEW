# Bigo Live Integration & Feature To-Do List

This file tracks unimplemented and researched architectural concepts within the Bigo Live ecosystem, helping structure future features precisely according to the platform's actual mechanics.

---

## 📅 Upcoming Features & Todo Checklist

### 1. [COMPLETED] Bigo Signed "IDOL" Badges
*   **Status**: Done ✅
*   **Changes**: Added "👑 IDOL" badges and visual indicators to signed contracted hosts in both layout modes (`grid` & `list`) within `RoomCard`, live rooms, and `UserDiscoveryPopup`.

### 2. [UPCOMING] Moderator & Admin Access System
*   **Status**: Pending Review / Todo 📋
*   **Goal**: Implement interactive administration/moderator capabilities within live rooms.
*   **Reference Research**: (See detailed research below on how room admins gain access and operate on Bigo Live).

---

## 🔍 Deep-Dive Research Reports

### Report A: The Bigo "IDOL" (Official Signed Host) Ecosystem

#### 1. What does "Idol" stand for?
On Bigo Live, an **Idol** stands for an **Official Signed Contract Host**. Unlike amateur or casual live-streamers who broadcast recreationally, an Idol is a professional creator recruited by, signed under, and represented by an authorized Bigo Talent Agency Partner. 

#### 2. What are the key host contracts, targets, and grades?
To maintain their official contract active and unlock monthly salary payouts, Idols must meet strict monthly quotas:
*   **Live Broadcast Hours**: Usually **30 to 60 hours** total per calendar month, distributed over at least **15 active days** (days with at least 1-2 hours of streaming).
*   **Beans Targets (The Gifting Quota)**: The absolute threshold of contract grades depends on the volume of virtual gifts (measured in Beans) received from audience members.
*   **Host Grades & Salary Tiers**:
    *   **Class S (Elite / VIP Idol)**: 1,000,000+ Beans target. Generates thousands of dollars in fixed USD base salaries plus premium commissions.
    *   **Class A (Premier Idol)**: 500,000 to 999,999 Beans target. High-tier payout with platform promotion banners.
    *   **Class B (Professional Idol)**: 150,000 to 499,999 Beans target.
    *   **Class C (Standard Idol)**: 50,000 to 149,999 Beans target.
    *   **Class D (Entry-Level Idol)**: 10,000 to 49,999 Beans target. Meeting this is the base milestone for official contract hosts.

#### 3. What privileges do IDOL hosts receive?
*   **Algorithmic Boost**: Their live rooms are ranked with extreme priority, appearing under the "Popular" and "Featured" tabs.
*   **Verification Badge**: They display a stylized Golden/Orange crown or "Idol" badge which signifies official status, increasing trust and gifting potential.
*   **Official Matchups (PK)**: Idols gain exclusive entry to join platform-sponsored PK Battles, global events, and leaderboard tournaments which skyrocket their bean counts.
*   **Agency Resource Buffs**: Help with account bans, administrative support, custom profile frame rewards, and direct feedback from platform managers.

---

### Report B: Room Moderator & Admin Roles

#### 1. How does a user become an Admin/Moderator in a room?
Administrators of live rooms gain power through **explicit design pathways** on Bigo Live. Here is how access is strictly governed:
*   **The Invitation (Direct Room Flow)**: Inside a live stream room, the host (or existing administrators) taps on a viewer's avatar or chat name. This opens their profile pop-up. The host taps the **Settings/Manage** gear icon and selects **"Set Admin"** (or Set Moderator).
*   **Offline/ID-Search Flow (The Bigo ID Setup)**: A host does not have to wait for the user to join their stream to make them an admin. They can assign them permanently using their unique **Bigo ID (User ID)**:
    1. Go to the **"Me" (Profile) Tab** in the application menu.
    2. Select **"Admin Settings"** (or "Room Settings" depending on client version).
    3. Tap **"Add Admin"** and type/search the target user's custom or system-assigned **Bigo ID (User ID)**.
    4. Save/Confirm to bind them as a permanent administrator.
*   **Capacity Limits**: To prevent admin overcrowding, Bigo Live restricts the total active room admins a host can possess (typically ranging from **5 to 10 admins** total based on the host's level and wealth grade).

#### 2. Does the Agency or Agency Head have power to assign admins?
*   **Strict Host Sovereignty**: In Bigo Live, being in the same agency **does NOT** automatically make someone an admin of another agency member's room. 
*   **No Forced Agency Assignment**: The head of an agency (Agency Boss) **cannot** unilaterally force-assign admins into a host's live room through any external agency management panel. 
*   **No Automatic Host Group Admins**: Even if two users are signed under the exact same agency and one is the primary recruiter/sponsor, they do not get admin rights. 
*   **Mechanism Summary**: The privilege is **always given by the host** themselves (either in the live room menu or via ID-search in the host's profile settings). The host holds 100% creative control over who holds admin keys in their private broadcasting sandbox.

#### 3. What powers do Room Admins hold?
Selected room administrators have specific features to manage noise, filter spammers, and secure the room:
*   **Mute Users**: Silence users making inappropriate comments or spamming chats. Muted users can watch but cannot type.
*   **Kick Out of Room**: Instantly eject a viewer from the room. Ejected users are banned from re-entering the stream for the entire active session.
*   **Mic & Guest Seat Management**: Admins can coordinate guest seat assignments, lock seats to keep them empty, and mute noisy mics.
*   **Pin Messages**: Fix a chat message (like targets, links, or alerts) to the top of the timeline.
*   **Shield Controls on PK**: While they cannot gift on behalf of others, they help track incoming enemy attacks and coordinate defenders during PK battles.
