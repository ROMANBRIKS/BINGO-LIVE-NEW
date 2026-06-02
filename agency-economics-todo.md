# Bigo Live & Agency Core Economic Split Engine
**Analytical Blueprint & Refinement To-Do List**

This document details the exact flow of funds, margins, and commissions of Bigo Live's economy, followed by our current implementations and a persistent task roadmap for future adjustments.

---

## 📊 Part 1: How Bigo Live Makes Their Money (The Raw Math)

Bigo Live operates a highly effective "asymmetric double-conversion" economic engine. They collect 100% of cash up-front when users purchase **Diamonds**, then pay out only a fraction of that currency in **Beans** when streamers cash out.

### 1. The Gifter’s Purchase (Diamond Buy-in)
* **Standard Cost:** $1.00 USD buys approximately **40 Diamonds** on average (effectively **$0.025 USD per Diamond**; bulk purchases may offer minor variations).
* **Up-front Flow:** Bigo instantly collects **100% of the cash ($1.00 USD)** and holds it in reserve.

### 2. The Gifting Stage
* **Action:** The Gifter sends a gift worth 40 Diamonds.
* **Conversion:** This is processed on a **1:1 basis**—the streamer receives exactly **40 Beans** in their creator wallet. No money has left Bigo's bank accounts yet.

### 3. Streamer Standard Cash-out (The 210 Peg)
If a casual streamer decides to cash out without belonging to an Official Agency or hitting a target, the conversion peg is highly asymmetric:
* **The Peg:** **210 Beans = $1.00 USD** (effectively **$0.00476 USD per Bean**).
* **Payout Math:** The streamer cashes out those 40 Beans. Bigo pays them:
  $$\text{Payout} = \frac{40}{210} = \$0.19\text{ USD}$$
* **Humble Profitability Margin on Standard Cashout:**
  $$\text{Bigo Retention} = \$1.00 \text{ (Collected)} - \$0.19 \text{ (Paid out)} = \$0.81\text{ USD (81\% Margin)}$$
  *Bigo pockets a massive **81% of the money** spent by gifters on standard casual cash-outs!*

---

## 🏆 Part 2: The Official Host Program (The 46% - 48% Revenue Split)

To incentivize official talent to stream consistently (requiring **30+ broadcast hours** spread across **15+ distinct active days**), Bigo offers a guaranteed **Base Salary**.

**CRITICAL RULE:** Streamers do **not** get both the standard cash-out value AND the base salary. To unlock the guaranteed base salary, Bigo reclaims and wipes the target beans from the host's wallet. 

The salary is paid **in place** of cashing out standard beans. Here is the true math:

### Tier 1: 10,000 Beans Target
* **Bigo Collects:** **$250.00 USD** up-front from gifters purchasing 10,000 Diamonds (approx. $1 for 40 Diamonds).
* **Host Payout (Base Salary):** **$120.00 USD**
* **The Exact Revenue Split:**
  * **Streamer Gets:** **48%** ($120.00 USD)
  * **Bigo Retains (Gross Profit):** **52%** ($130.00 USD)

### Tier 2: 30,000 Beans Target
* **Bigo Collects:** **$750.00 USD** up-front from gifters purchasing 30,000 Diamonds.
* **Host Payout (Base Salary):** **$350.00 USD**
* **The Exact Revenue Split:**
  * **Streamer Gets:** **46.7%** ($350.00 USD)
  * **Bigo Retains (Gross Profit):** **53.3%** ($400.00 USD)

*This is where the user's correct 46% to 47% streamer payout ratio comes from! Bigo walks away with roughly 52% to 54% of all gross diamond revenue on target accounts, and a massive 81% on casual, non-target channels.*

---

## 💼 Part 3: Interconnected Agency Commission

Official signed hosts do not negotiate directly with Bigo; they sign with an **Agency**.
1. **The Source of Agency Payout:** Bigo pays agencies **out of their own retained 52% - 53% cut**, never from the streamer's base salary bonus.
2. **The Agency Cut:** Agency handles regional management, receiving between **10% to 15%** of the host's total target earnings.
3. **The Risk:** If a host fails to meet their target or hours, **Bigo pays $0 bonus and $0 Agency commission**. The streamer falls back to the low-tier standard cash-out ($47.61 for 10k beans, or cannot cash out due to the high $100 baseline threshold if unverified).

---

## 📝 Part 4: Implemented Changes & Code Alignments
Under the hood, we have successfully replaced all mock or inaccurate elements with the exact math explained above:
- [x] **Earnings Center:** Replaced the hardcoded/unrealistic `beans / 1000` exchange module in `EarningsDashboardPage.tsx` with the official standard conversion: `const beansToDollar = (beans) => (beans / 210)`.
- [x] **My Wallet UI:** Mapped the user profile's dynamic Firestore bean balance state to replace the hardcoded "0 Beans" indicator.
- [x] **Estimated Balance Math:** Configured the dynamic estimated dollars preview in the wallet card to update in real-time at the 210 peg.
- [x] **Host Tiers Matrix:** Standardized the exchange rules table to show the genuine step targets: 10K, 30K, 50K, 150K, and 1M+ Bean tiers with proper bonus math.

---

## 🎯 Part 5: To-Do List & Future Refinements (Our Sandbox Roadmap)

We will refine the following policies in our custom platform rules logic:

### 🌟 Project Task List:
- [ ] **Task 1: The "Grace/Safety Net" Failed Target Policy**
  * *Option A (Default Bigo Rules):* If the host streaming hours are met but they fell short on beans (e.g. 8,500 instead of 10,000), they get **$0 base salary** and are reverted to standard $47.61 cash-out.
  * *Option B (Our Proposed Grace Rate):* Introduce a "Pro-Rata" tier. If they hit **80%+ of the target**, they still receive **50% of the guaranteed base salary bonus** to prevent complete discouragement.
  * *Option C (The Basic Safety Payout):* Allow low-tier accounts to exchange beans for small gift codes or props with no minimum payout barrier if they are active 10+ days.
- [ ] **Task 2: Region-Specific Adjustments (UK vs other areas)**
  * *Payout Thresholds:* Establish custom threshold scales (e.g. higher cash-out requirements for UK hosts but with lower tax-deduction rates).
  * *Agency Commission Rebate:* Model regional bonuses for the signing agency (increasing contract rates dynamically based on the region's overall Monthly Gifting volume).
- [ ] **Task 3: Custom In-House "Platform Fee" Optimization**
  * Decide if we will retain standard Bigo margins (80% standard, 53% official target) or introduce our own lighter platform fee (e.g., standard cashout peg of 150 Beans = $1 USD to make our creators earn more than Bigo hosts do!).
- [ ] **Task 4: Platform-Provided Agency-Streamer Standard Contract Formulation**
  * *Revisit Topic:* Revisit the specific fees that must be paid, contractual lock-ins, and standard cancellation/buyout formulas.
  * *The System-Enforced Structure:* Formulate an exact standard digital contract provided on our application that regulates relations between **The Agency** and **The Streamer (us)**, removing the need for creators to create or import external agreements.

