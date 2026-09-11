# TripSplit ✈️💸

> A modern, mobile-first travel expense management and debt simplification web application built for group adventures.

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)

---

## 🌟 Highlights & Features

- **The 3-Second Rule Dashboard**: View total trip spending, your live net balance, "Who Owes Whom" simplified debts, and recent transactions at a glance.
- **Smart Splitting Engine**:
  - **Equal Split**: Check/uncheck participants with remainder paise/cents distributed evenly (zero rounding drift).
  - **Exact Amounts**: Custom amounts with live discrepancy validation.
  - **Percentage Split**: Custom percentages per member with 100% sum verification.
- **Min-Cash-Flow Debt Simplification**: Computes the minimal number of transactions required to settle all group balances.
- **One-Click Settle Up**: Record payments with celebratory confetti animation and detailed settlement history.
- **Email Invitations**: Invite friends by entering their email to automatically draft and dispatch personalized invitations with unique 6-character trip codes and direct join links (`?join=CODE`).
- **Admin Member Management**: Admins can manage travelers; members with outstanding debts or credits cannot be removed until fully settled to preserve 100% financial tally accuracy.
- **Analytics & Insights**: Responsive SVG donut chart for category spending and bar charts for member contributions.
- **Activity Timeline**: Full audit feed of expenses, settlements, and member joins.
- **Multi-User Simulation**: Header switcher to instantly test and experience the app from any traveler's perspective.
- **Dark & Light Mode**: Curated fintech palette with smooth theme toggling.
- **Vercel Deployment**: Includes `vercel.json` for SPA rewrites and edge caching.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/Dharshantfs/trip.git
cd trip

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🛠️ Build & Deployment

To generate an optimized production bundle:
```bash
npm run build
```

The output will be created in `dist/`.

### Deploy to Vercel
1. Import this repository into [Vercel](https://vercel.com).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy!

---

## 📄 License
MIT License.
