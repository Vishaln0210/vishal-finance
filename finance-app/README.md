# Vishal's Finance Tracker

A personal finance tracker — Transactions, Dashboard, Monthly Comparison, and a Money Lent tracker for friends who owe you money. Built with Next.js, Tailwind, and Firebase (Firestore) for real-time data sync across your devices.

## Features

- **Dashboard** — KPIs (income, expenses, net savings, savings rate, account balances), charts (income vs expense, expense breakdown pie, savings trend)
- **Transactions** — add/edit/delete income & expense entries, filter by type/account, search
- **Monthly Comparison** — month-by-month income/expense table with MoM % change, full category-by-month breakdown table
- **Money Lent** — track money lent to friends; mark Unpaid/Partial/Paid; when marked Paid/Partial, the repaid amount automatically flows into your IOB/HDFC balance on the Dashboard
- **Categories** — reference list with per-category totals

All data lives in Firestore and updates in real time — no save button needed.

---

## 1. Set up Firebase (5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it anything (e.g. `vishal-finance`) → finish creation (you can disable Google Analytics).
2. In the project, click the **web icon (`</>`)** to add a web app → register it (no need for Firebase Hosting).
3. Copy the `firebaseConfig` values shown — you'll paste these into `.env.local`.
4. In the left sidebar go to **Build → Firestore Database → Create database** → start in **production mode** → choose any region close to you.
5. Once created, go to the **Rules** tab and paste the contents of `firestore.rules` (included in this repo), then **Publish**.

> Note: These rules allow open read/write with no login, which is fine since this is a personal app and the Vercel URL won't be shared. If you ever want to share the link publicly, add Firebase Authentication and update the rules to check `request.auth.uid`.

## 2. Run locally

```bash
npm install
cp .env.local.example .env.local
# paste your firebaseConfig values into .env.local
npm run dev
```

Visit `http://localhost:3000`.

## 3. Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the prompts. When asked about environment variables, add all 6 `NEXT_PUBLIC_FIREBASE_*` values from your `.env.local`.

### Option B — GitHub + Vercel dashboard
1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Before deploying, expand **Environment Variables** and add all 6 keys from `.env.local.example` with your actual Firebase values.
4. Click **Deploy**.

Every time you push to GitHub, Vercel auto-redeploys.

## 4. Add your existing data

Use the **Add Transaction** and **Add Entry** buttons in the UI — your 3 existing transactions and any lending entries from the spreadsheet can be re-entered in a couple of minutes. (If you'd like a one-time bulk import script instead, just ask.)

---

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Firebase Firestore (real-time database)
- Recharts (charts)
- lucide-react (icons)
