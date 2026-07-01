# Bigo Live Integration & Feature To-Do List

This file tracks unimplemented and researched architectural concepts within the Bigo Live ecosystem, helping structure future features precisely according to the platform's actual mechanics.

---

## 📅 Upcoming Features & Todo Checklist

### 1. [COMPLETED] Bigo Signed "IDOL" Badges
*   **Status**: Done ✅
*   **Changes**: Added "👑 IDOL" badges and visual indicators to signed contracted hosts in both layout modes (`grid` & `list`) within `RoomCard`, live rooms, and `UserDiscoveryPopup`.

### 2. [UPCOMING] Moderator & Admin Access System
*   **Status**: Pending Review / Todo 📋
*   **Goal**: Implement robust, dual-layered administration and moderator capabilities across live rooms and main dashboards.
*   **Key Tasks & Specifications**:
    *   **Verified Admin Identification**: Ensure the administrative red desk/badge is visible only to a verified top admin account. Currently, this top admin is mapped to the user email `rogershep101@gmail.com`.
    *   **Admin Access Protection & Credentials (Secret Code)**: Implement a secondary, secure sign-in framework down the line where admins must provide both their verified email address and a secret authorization code to gain administrative privileges.
    *   **Moderator Promotion & Blue Badges**: Introduce dedicated "Moderator" roles working directly under the Admin. When a moderator logs in, they should see a customized, distinct **blue moderator badge** instead of the red administrator badge.
    *   **Moderator Dashboard Entrance**: This blue badge will lead directly to a specialized Moderator Dashboard tailored with features to manage live rooms, view flags, mute users, and operate platform bouncer channels.
*   **Reference Research**: (See detailed research below on how room admins gain access and operate on Bigo Live).

### 3. [UPCOMING] Family Creation Criteria & Per-Region Refinement
*   **Status**: Pending Review / Todo 📋
*   **Goal**: Refine and localize the criteria for starting a new Family in our application.
*   **Key Tasks**:
    *   **Per-Region Rules**: Make sure family creation eligibility (user level, monthly USD recharge, gift diamond volume, etc.) can be checked and enforced selectively based on the user's region (Africa, Europe, North America, Caribbean).
    *   **BIGO Reference Refinement**: Remove/replace any mislabeled references (such as auto-transcribed typos like "big toe") to clearly refer to official **BIGO ID / BIGO Live Official ID** parameters (e.g., Africa Official BIGO ID: 80015).
    *   **Dynamic Requirements Engine**: Hook up the criteria page dynamically with Firestore/Auth state so users are only allowed to finalize family registration once their real-time levels and wallets meet regional thresholds.

### 4. [UPCOMING] Billboard Ads Relocation (AdPlayer Campaign Portal)
*   **Status**: Pending Review / Todo 📋
*   **Goal**: Find a more appropriate placement for the Live AdPlayer campaign billboard.
*   **Key Tasks**:
    *   **Remove from Stream**: Successfully removed the live billboard banner overlay from the room's direct visual stream to prevent clutter.
    *   **New Native Integration**: Relocate sponsor-related promotional slots (Google Cloud, NVIDIA Stream, Vesper Racing, etc.) into native, less-intrusive zones like the profile, info modals, or custom sidebar tabs where users expect to interact with promotional portals.

### 5. [UPCOMING] Creator Dashboard Category & Talent Tag Integration
*   **Status**: Completed UI & Core Popups, Pending Dashboard Connection 📋
*   **Goal**: Connect Category Tags (e.g. Singing, Dancing, Certified Broadcaster) directly to user schema structures and streamer dashboards.
*   **Key Tasks & Database Mapping**:
    *   **Creator Profile Center Settings**: Implement a "Talent Certification Registry" tab inside `/src/pages/CreatorCenterPage.tsx` where broadcasters can review verification rules, select tags, and track progress towards obtaining labels.
    *   **Automated Verification Audit**: Build backend conditions based on minimum live talent hours or verified streamer-agency records inside Firestore.
    *   **Firestore Mapping**: Bind chosen verified labels directly to the `users` database schema under a new field parameter: `verifiedCategoryTags: string[]` (e.g. `['singing', 'dancing']`).
    *   **Dynamic UI Rendering**: Update `UserDiscoveryPopup.tsx` and `PublicPortfolio.tsx` to read values from `user.verifiedCategoryTags` dynamically, fallback to standard tags if undefined.

### 6. [UPCOMING] Non-Contract Payout Model & Digital Agency Agreements
*   **Status**: Pending User Research / Todo 📋
*   **Goal**: Model precise mechanics for creators who stream without active agency contracts, and build an in-app digital signature experience to easily transition casual writers into official hosts.
*   **Key Tasks & Concept Mapping**:
    *   **Casual Fallbacks**: Confirm final calculations for non-contract users—given Bigo pays non-contract hosts **$0 base salaries** (meaning casual streamers get no target bonuses and can only rely on direct diamond-to-bean wallet balance cashout conversions at the 210 Peg).
    *   **In-App Agency Registration**: Map out a seamless, legally styled digital contract template inside the app's Creator Center. Streamers looking to join professional agencies can interactively review and digitally sign agreements, locking in official host status right from their device.
    *   **Automated Contract Delivery Flow**: Set up step-by-step guidance on how a casual streamer transitions, contract distribution notifications, and automatic update to user roles (signed host statuses and agency bindings) once the agreement is signed on both ends.

### 7. [PENDING DECISION] Multi-Stream PK Chat Merging Mechanics
*   **Status**: Pending User Confirmation 📋
*   **Goal**: Track the potential PK battle chat merger capability on the roadmap as requested by the user, waiting for final user decision.
*   **Exact User Specification**:
    *   "When you are on PK, there's a possibility that both chats from both places could be merged into one."
    *   "Messages from followers of both streamers could run into the same chat."
    *   "I've not decided on that yet. I will try to decide that and then we're going to know later."
*   **Key Tasks**:
    *   Await final user approval and green light on merged PK socket structure.
    *   Prepare live mutual message sync pools for dual live feed streaming.

### 8. [PENDING DECISION] Custom Star Goal Targets & Gift Conversion Mechanics
*   **Status**: Pending User Information & Target Business Logic 📋
*   **Goal**: Track and refine how Star Goal phases, challenge bars, and progress are calculated based on streamer-defined targets.
*   **Exact User Specification**:
    *   The current calculations are example placeholders; the actual system is based on custom targets.
    *   Streamers set their own targets. When a target is completed, they can go ahead and set another one (e.g. daily/hourly targets).
    *   Rough exchange rate rule under consideration: Roughly **50 diamonds or 50 beans** amounts to 1 Star/point increments in the progression.
    *   Example: A streamer sets a target of 200, and when accumulated, they complete stars (such as achieving 4 out of 4 stars).
*   **Key Tasks & Research Needed**:
    *   Keep track of user's business rules on how stars, diamonds, and progress bars increment.
    *   Confirm whether 50 diamonds/beans equals 1 Star, and how target levels scale progression.
    *   Create a setup flow where hosts can customize/reset their live room goals.

### 9. [COMPLETED] Live Room Follow Sequence & Contribution Mechanics
*   **Status**: Done ✅
*   **Changes**: Fully implemented:
    *   **Follow Button Morph**: Clicking the `+` follow button transitions with a green pulse checkmark (✔️) and details a heart badge.
    *   **Side Contribution Card**: Added a sliding floating card on the right-middle zone showing: `[User Name] Followed the anchor` and `🔥 +160`.
    *   **Interactive Chat Logs**: Added custom-styled message widgets for both contribution `Following the anchor contributed 🔥 +160` and clickable fan group link `💗 You followed the host! Click to join the fan group to gain more attention! >` which opens the Fan Club join drawer interactively when clicked.

### 10. [PENDING] Interactive Stream Heat & Daily Midnight Reset Mechanics
*   **Status**: Pending Implementation 📋
*   **Goal**: Integrate dynamic heat scoring from chat interactions, passive viewing duration, and implement the automatic global midnight reset sequence.
*   **Aesthetics & Scoring Mechanics**:
    *   **First Text Daily Heat**: When a viewer sends their very first message in a streamer's room for the day, a custom popularity/heat score bonus is unlocked and added instantly to the stream's active heat/popularity pool.
    *   **Passive Viewing Heat**: Watching a stream for sustained intervals (e.g. every 5 or 10 minutes of active staying power) injects progressive heat increments to incentivize attendance.
    *   **Midnight Reset Clock (11:50 PM - 12:00 AM)**: 
        *   At **11:50 PM heading into midnight** local timezone, all active daily targets and live room diamond progress bars are hard-reset back to zero.
        *   The reset happens automatically regardless of whether the streamer reached their daily target or not.
        *   **On-Screen Target Wipe**: The active daily target progression count on the live stream screen and outer room lobby listings gets wiped completely clean to 0.
        *   **Permanent Wallet Accumulation**: Despite the visible daily targets hitting 0 on the streaming screen and outer lists, the actual host wallet (Beans/Diamonds profile balance) remains untouched and continually accumulates everything earned yesterday and previously. The wallet always accurately displays the true total of what they made so far.
        *   **Backend Settlement**: Yesterday's earnings are safely aggregated, settled, and deposited securely into the host's permanent profile wallets/beans before the clock resets.
        *   The next cycle immediately begins from empty progression bars and 0 diamonds, allowing clean daily target grinds.


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
