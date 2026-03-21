# ðŸ§  Life Decision AI

<div align="center">

![Life Decision AI Banner](https://img.shields.io/badge/Life%20Decision%20AI-v6.0-blueviolet?style=for-the-badge&logo=artificial-intelligence)
![Live](https://img.shields.io/badge/Live-Production-brightgreen?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Insforge-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

# 🧠 Life Decision AI

<div align="center">

![Life Decision AI Banner](https://img.shields.io/badge/Life%20Decision%20AI-v6.0-blueviolet?style=for-the-badge&logo=artificial-intelligence)
![Live](https://img.shields.io/badge/Live-Production-brightgreen?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Insforge-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**An AI-powered career decision support system using Fuzzy Logic, Logistic Regression, and Genetic Algorithms.**

[🌐 Live App](https://life-decision-ai.vercel.app) • [📦 GitHub](https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-) • [🐛 Report Bug](https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-/issues)

</div>

---

## 📌 What Is This Project?

**Life Decision AI** is an intelligent career decision-making platform that uses three Soft Computing techniques — **Fuzzy Logic**, **Logistic Regression**, and **Genetic Algorithms** — to score how well a career path fits a user's profile.

Users enter their **skill level**, **interest level**, and **risk tolerance**, choose a **domain** (e.g., Engineering, Medicine, Technology), and the system returns:

- A **decision score** (0–100) with recommendation
- A **career simulation** showing salary growth over years
- An **AI Mentor** for personalized career guidance
- A **Roadmap** to achieve their career goal
- A **Comparison panel** to compare multiple career domains
- **Full history** of past decisions

---

## ❓ Why Does the World Need This?

> Every year, millions of students and professionals make critical career decisions based on incomplete information, peer pressure, or family opinions — not actual data.

**Life Decision AI** solves this by:

| Problem | Solution |
|---|---|
| No objective career guidance | Fuzzy logic scores real suitability |
| One-size-fits-all advice | Personalised AI-powered analysis |
| No career simulation tool | Year-by-year salary + role projections |
| Expensive career counsellors | Free AI mentor available 24/7 |
| Scattered career resources | All-in-one dashboard |

---

## ✨ Features

- 🤖 **AI Decision Engine** — Fuzzy Logic + Logistic Regression + Genetic Algorithm
- 📊 **Career Simulation** — Multi-year salary & role trajectory projections
- 🧭 **AI Mentor Chat** — Context-aware career coach available 24/7
- 🗺️ **Personalized Roadmap** — Step-by-step path to achieve your career goal
- ⚖️ **Career Comparison** — Compare up to 2 domains side-by-side
- 🔍 **XAI Panel** — Explainable AI: see WHY a score was given
- 📜 **Decision History** — Persistent record of all past decisions
- 💳 **Premium Plan** — Razorpay-powered payment gateway (serverless)
- 🔐 **Secure Auth** — JWT-based authentication via Insforge
- 📱 **Responsive UI** — Works on mobile, tablet, desktop

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                 │
│  React + Vite (SPA) — hosted on Vercel                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ InputForm│  │HistoryPnl│  │MentorChat│  │  Pricing │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       └─────────────┴──────────────┴──────────────┘            │
│                          │ insforgeApi.js                       │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTPS (REST)
┌──────────────────────────▼──────────────────────────────────────┐
│                  INSFORGE EDGE FUNCTIONS (Deno)                 │
│                                                                 │
│  /predict-decision    — Fuzzy + LR + GA scoring engine          │
│  /simulate-career     — Salary & role trajectory projection     │
│  /save-decision       — Persist decision to Postgres DB         │
│  /get-user-history    — Paginated decision history              │
│  /create-payment-order— Razorpay order creation                 │
│  /upgrade-user        — Verify payment + upgrade plan           │
│  /create-user-profile — Post-auth user profile setup            │
│                                                                 │
│  ┌────────────────┐        ┌──────────────────┐                │
│  │  Insforge Auth │        │ Insforge Postgres │                │
│  │  (JWT built-in)│        │  users/decisions  │                │
│  └────────────────┘        └──────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                           │ API Call
┌──────────────────────────▼──────────────────────────────────────┐
│                  EXTERNAL SERVICES                              │
│  Razorpay Payment Gateway — order creation & sig verification   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔬 How the AI Works

### 1. Fuzzy Logic Engine
Converts numerical inputs (0–10) into linguistic variables using **trapezoidal membership functions**:
- Skill: `Low | Medium | High`
- Interest: `Low | Medium | High`
- Risk Tolerance: `Low | Medium | High`

Then applies **IF-THEN rules** (e.g., *IF skill=High AND interest=High THEN score=Excellent*).

### 2. Logistic Regression
A pre-trained model with weights optimised for career dataset patterns:
```
z = 0.42 × skill + 0.38 × interest + 0.20 × risk − 3.5
probability = 1 / (1 + e^−z)
```

### 3. Genetic Algorithm
Optimises the **blending weights** between fuzzy and logistic scores by simulating a population of weight candidates, scoring each by fitness, and selecting the best combination.

### Final Score Formula
```
result_score = GA_optimised(0.6 × fuzzy_score + 0.4 × logistic_prob) × 100
```

### Score Interpretation
| Score | Recommendation |
|---|---|
| 70–100 | ✅ Highly Recommended |
| 50–69 | 🟡 Moderately Recommended |
| 30–49 | ⚠️ Proceed with Caution |
| 0–29 | ❌ Reconsider Carefully |

---

## 📁 File Structure

```
life-decision-ai/
│
├── frontend/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.jsx        # Main AI decision form
│   │   │   ├── HistoryPanel.jsx     # Decision history list
│   │   │   ├── MentorChat.jsx       # AI mentor chat UI
│   │   │   ├── RoadmapPanel.jsx     # Career roadmap viewer
│   │   │   ├── ComparePanel.jsx     # Career comparison tool
│   │   │   ├── XAIPanel.jsx         # Explainable AI panel
│   │   │   ├── ErrorBoundary.jsx    # Global error handler
│   │   │   ├── Toast.jsx            # Notification system
│   │   │   └── Skeleton.jsx         # Loading skeletons
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Signup.jsx           # Registration page
│   │   │   ├── UserDashboard.jsx    # User stats dashboard
│   │   │   └── Pricing.jsx          # Premium upgrade page
│   │   ├── insforgeApi.js           # ALL API calls (Insforge)
│   │   ├── App.jsx                  # Root app + routing
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── vercel.json                  # SPA routing config
│   ├── vite.config.js               # Vite bundler config
│   └── package.json
│
├── insforge/
│   ├── functions/                   # Serverless edge functions
│   │   ├── predict-decision.ts      # Core AI scoring engine
│   │   ├── simulate-career.ts       # Salary projection engine
│   │   ├── save-decision.ts         # Save decision to DB
│   │   ├── get-user-history.ts      # Fetch user history
│   │   ├── create-payment-order.ts  # Razorpay order creation
│   │   ├── upgrade-user.ts          # Payment verification
│   │   └── create-user-profile.ts   # User profile setup
│   └── schema.sql                   # Database schema
│
├── .env.example                     # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 Full Setup Guide

### Prerequisites
- Node.js v18+
- Git
- [Insforge Account](https://insforge.dev)
- [Razorpay Account](https://razorpay.com) (for payments)
- [Vercel Account](https://vercel.com) (for deployment)

### Step 1 — Clone the Repository
```bash
git clone https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-.git
cd Life-Decision-AI-
```

### Step 2 — Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3 — Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=your_secure_jwt_secret_here
```

### Step 4 — Run Locally (Development)
```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

### Step 5 — Deploy Edge Functions to Insforge
```bash
npx insforge login
npx insforge link

npx insforge functions deploy predict-decision --file insforge/functions/predict-decision.ts
npx insforge functions deploy simulate-career --file insforge/functions/simulate-career.ts
npx insforge functions deploy save-decision --file insforge/functions/save-decision.ts
npx insforge functions deploy get-user-history --file insforge/functions/get-user-history.ts
npx insforge functions deploy create-payment-order --file insforge/functions/create-payment-order.ts
npx insforge functions deploy upgrade-user --file insforge/functions/upgrade-user.ts
npx insforge functions deploy create-user-profile --file insforge/functions/create-user-profile.ts
```

### Step 6 — Deploy Frontend to Vercel
```bash
cd frontend
npm run build
npx vercel --prod --yes
```

### Step 7 — Set Up Database
Run `insforge/schema.sql` in the **Insforge SQL Editor** to create:
- `users` — user accounts and plan types
- `decisions` — AI decision records with scores
- `history` — decision history log

---

## 📊 Database Schema

```sql
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  plan_type  TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE decisions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id),
  skill_level    NUMERIC NOT NULL,
  interest_level NUMERIC NOT NULL,
  risk_tolerance NUMERIC NOT NULL,
  domain         TEXT NOT NULL,
  result_score   NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id),
  decision_id UUID REFERENCES decisions(id),
  timestamp   TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🌟 Advantages

| Advantage | Description |
|---|---|
| ✅ **Zero Server Cost** | Serverless edge functions — no always-on server |
| ✅ **24/7 Availability** | Fully cloud-native, never goes down |
| ✅ **Privacy First** | No third-party ML APIs — AI runs in-house |
| ✅ **Explainable AI** | XAI panel shows exactly why each score was given |
| ✅ **Lightning Fast** | Vite code-splitting + lazy loading + API caching |
| ✅ **Scalable** | Vercel + Insforge auto-scale with traffic |
| ✅ **Secure** | JWT auth, HMAC payment verification, no secrets in frontend |
| ✅ **Modern UI** | Dark glassmorphism, skeleton loaders, toast notifications |
| ✅ **Open Source** | Fork and adapt for any decision domain |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite |
| Styling | Vanilla CSS (Glassmorphism / Dark Theme) |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | Insforge Edge Functions (Deno) |
| Database | Insforge Postgres |
| Authentication | Insforge Built-in JWT Auth |
| Payments | Razorpay |
| Frontend Hosting | Vercel |
| AI Algorithms | Fuzzy Logic, Logistic Regression, Genetic Algorithm |

---

## 🔒 Security

- All API calls require a valid **Bearer token** (Insforge JWT)
- Razorpay payment signatures are **server-side verified** using HMAC-SHA256
- API keys stored as **Insforge secrets** — never exposed to the browser
- `.env` file is **gitignored** — secrets never committed

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Credits

<div align="center">

### Made with ❤️ by

# **Md Sakib Ahmad**

*AI Developer | Software Engineer | Open Source Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-MohammadSakibAhmad0874-black?style=for-the-badge&logo=github)](https://github.com/MohammadSakibAhmad0874)

---

> *"The best decision is an informed decision."*

**Life Decision AI** — Empowering careers through the power of Soft Computing and AI.

---

⭐ **If this project helped you, please give it a star on GitHub!** ⭐

</div>

