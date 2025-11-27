# CREATURES: TAP TO RISE 🐉  
_(Telegram Mini Idle Tapper – working title “MoneyMaker”)_

This is a Telegram Mini App built with **Vite + React + TypeScript + Tailwind**, where players tap to earn money, unlock suits, pets, cards, and conquer the world.

The repo name is still **TelegramMoneyMaker**, but the in-game brand is evolving toward **CREATURES: TAP TO RISE**.

---

## 🎮 Core Features

- **Idle Tapper Core**
  - Main banknote tap button with combo system & crits
  - Balance, total earnings, APS (auto per second), global multipliers

- **Suits & Pets**
  - Multiple premium suits (Starter, Emerald, Velvet, Millionaire, Crypto)
  - Pets that boost tap income
  - Suit + pet multipliers wired into central income math

- **Cards & Coupons**
  - Rarity-based card system (Common → Ultimate)
  - Chests, collection view, rarity progress, coupon bonuses
  - Coupons spent tracked and used for title / achievement unlocks

- **World Map: Conquer the World**
  - 197 countries split into regions (NA, SA, EU, AS, OC, MENA, AF)
  - Country purchase scaling, APS & coupon bonuses per country
  - Region unlock graph and global “world rank” bonuses

- **Casino Mini-Game**
  - Separate tab under **Games**
  - Chips currency and casino rewards (WIP / expanding over time)

- **Profile, Achievements & Titles**
  - Profile with name, country, avatar, Google sign-in
  - Achievements with rewards (and title unlock hooks)
  - Title system:
    - Title definitions in `src/data/titles.ts`
    - Title logic in `src/lib/titleLogic.ts`
    - Title state in `src/lib/storageTitles.ts`
    - Titles shown & managed on the Profile page

---

## 🧱 Tech Stack

- **Frontend:** React + TypeScript
- **Build:** Vite
- **Styling:** TailwindCSS
- **Runtime target:** Telegram WebApp (Mini App)
- **Hosting:** Vercel

---

## 🚀 Local Development

```bash
# install deps
npm install

# run dev server
npm run dev
