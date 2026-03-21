# ðŸ§  Life Decision AI

<div align="center">

![Life Decision AI Banner](https://img.shields.io/badge/Life%20Decision%20AI-v6.0-blueviolet?style=for-the-badge&logo=artificial-intelligence)
![Live](https://img.shields.io/badge/Live-Production-brightgreen?style=for-the-badge&logo=vercel)
![Backend](https://img.shields.io/badge/Backend-Insforge-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**An AI-powered career decision support system using Fuzzy Logic, Logistic Regression, and Genetic Algorithms.**

[ðŸŒ Live App](https://life-decision-ai.vercel.app) â€¢ [ðŸ“¦ GitHub](https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-) â€¢ [ðŸ› Report Bug](https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-/issues)

</div>

---

## ðŸ“Œ What Is This Project?

**Life Decision AI** is an intelligent career decision-making platform that uses three Soft Computing techniques â€” **Fuzzy Logic**, **Logistic Regression**, and **Genetic Algorithms** â€” to score how well a career path fits a user's profile.

Users enter their **skill level**, **interest level**, and **risk tolerance**, choose a **domain** (e.g., Engineering, Medicine, Technology), and the system returns:

- A **decision score** (0â€“100) with recommendation
- A **career simulation** showing salary growth over years
- An **AI Mentor** for personalized career guidance
- A **Roadmap** to achieve their career goal
- A **Comparison panel** to compare multiple career domains
- **Full history** of past decisions

---

## â“ Why Does the World Need This?

> Every year, millions of students and professionals make critical career decisions based on incomplete information, peer pressure, or family opinions â€” not actual data.

**Life Decision AI** solves this by:

| Problem | Solution |
|---|---|
| No objective career guidance | Fuzzy logic scores real suitability |
| One-size-fits-all advice | Personalised AI-powered analysis |
| No career simulation tool | Year-by-year salary + role projections |
| Expensive career counsellors | Free AI mentor available 24/7 |
| Scattered career resources | All-in-one dashboard |

---

## âœ¨ Features

- ðŸ¤– **AI Decision Engine** â€” Fuzzy Logic + Logistic Regression + Genetic Algorithm
- ðŸ“Š **Career Simulation** â€” Multi-year salary & role trajectory projections
- ðŸ§­ **AI Mentor Chat** â€” Context-aware career coach available 24/7
- ðŸ—ºï¸ **Personalized Roadmap** â€” Step-by-step path to achieve your career goal
- âš–ï¸ **Career Comparison** â€” Compare up to 2 domains side-by-side
- ðŸ” **XAI Panel** â€” Explainable AI: see WHY a score was given
- ðŸ“œ **Decision History** â€” Persistent record of all past decisions
- ðŸ’³ **Premium Plan** â€” Razorpay-powered payment gateway (serverless)
- ðŸ” **Secure Auth** â€” JWT-based authentication via Insforge
- ðŸ“± **Responsive UI** â€” Works on mobile, tablet, desktop

---

## ðŸ—ï¸ System Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        USER BROWSER                             â”‚
â”‚                                                                 â”‚
â”‚  React + Vite (SPA) â€” hosted on Vercel                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  â”‚ InputFormâ”‚  â”‚HistoryPnlâ”‚  â”‚MentorChatâ”‚  â”‚  Pricing â”‚      â”‚
â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜      â”‚
â”‚       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                          â”‚ insforgeApi.js                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚ HTTPS (REST)
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  INSFORGE EDGE FUNCTIONS (Deno)                 â”‚
â”‚                                                                 â”‚
â”‚  /predict-decision    â€” Fuzzy + LR + GA scoring engine          â”‚
â”‚  /simulate-career     â€” Salary & role trajectory projection     â”‚
â”‚  /save-decision       â€” Persist decision to Postgres DB         â”‚
â”‚  /get-user-history    â€” Paginated decision history              â”‚
â”‚  /create-payment-orderâ€” Razorpay order creation                 â”‚
â”‚  /upgrade-user        â€” Verify payment + upgrade plan           â”‚
â”‚  /create-user-profile â€” Post-auth user profile setup            â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                â”‚
â”‚  â”‚  Insforge Auth â”‚        â”‚ Insforge Postgres â”‚                â”‚
â”‚  â”‚  (JWT built-in)â”‚        â”‚  users/decisions  â”‚                â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                           â”‚ API Call
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  EXTERNAL SERVICES                              â”‚
â”‚  Razorpay Payment Gateway â€” order creation & sig verification   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”¬ How the AI Works

### 1. Fuzzy Logic Engine
Converts numerical inputs (0â€“10) into linguistic variables using **trapezoidal membership functions**:
- Skill: `Low | Medium | High`
- Interest: `Low | Medium | High`
- Risk Tolerance: `Low | Medium | High`

Then applies **IF-THEN rules** (e.g., *IF skill=High AND interest=High THEN score=Excellent*).

### 2. Logistic Regression
A pre-trained model with weights optimised for career dataset patterns:
```
z = 0.42 Ã— skill + 0.38 Ã— interest + 0.20 Ã— risk âˆ’ 3.5
probability = 1 / (1 + e^âˆ’z)
```

### 3. Genetic Algorithm
Optimises the **blending weights** between fuzzy and logistic scores by simulating a population of weight candidates, scoring each by fitness, and selecting the best combination.

### Final Score Formula
```
result_score = GA_optimised(0.6 Ã— fuzzy_score + 0.4 Ã— logistic_prob) Ã— 100
```

### Score Interpretation
| Score | Recommendation |
|---|---|
| 70â€“100 | âœ… Highly Recommended |
| 50â€“69 | ðŸŸ¡ Moderately Recommended |
| 30â€“49 | âš ï¸ Proceed with Caution |
| 0â€“29 | âŒ Reconsider Carefully |

---

## ðŸ“ File Structure

```
life-decision-ai/
â”‚
â”œâ”€â”€ frontend/                        # React + Vite frontend
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ InputForm.jsx        # Main AI decision form
â”‚   â”‚   â”‚   â”œâ”€â”€ HistoryPanel.jsx     # Decision history list
â”‚   â”‚   â”‚   â”œâ”€â”€ MentorChat.jsx       # AI mentor chat UI
â”‚   â”‚   â”‚   â”œâ”€â”€ RoadmapPanel.jsx     # Career roadmap viewer
â”‚   â”‚   â”‚   â”œâ”€â”€ ComparePanel.jsx     # Career comparison tool
â”‚   â”‚   â”‚   â”œâ”€â”€ XAIPanel.jsx         # Explainable AI panel
â”‚   â”‚   â”‚   â”œâ”€â”€ ErrorBoundary.jsx    # Global error handler
â”‚   â”‚   â”‚   â”œâ”€â”€ Toast.jsx            # Notification system
â”‚   â”‚   â”‚   â””â”€â”€ Skeleton.jsx         # Loading skeletons
â”‚   â”‚   â”œâ”€â”€ context/
â”‚   â”‚   â”‚   â””â”€â”€ AuthContext.jsx      # Global auth state
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ Login.jsx            # Login page
â”‚   â”‚   â”‚   â”œâ”€â”€ Signup.jsx           # Registration page
â”‚   â”‚   â”‚   â”œâ”€â”€ UserDashboard.jsx    # User stats dashboard
â”‚   â”‚   â”‚   â””â”€â”€ Pricing.jsx          # Premium upgrade page
â”‚   â”‚   â”œâ”€â”€ insforgeApi.js           # ALL API calls (Insforge)
â”‚   â”‚   â”œâ”€â”€ App.jsx                  # Root app + routing
â”‚   â”‚   â”œâ”€â”€ main.jsx                 # Entry point
â”‚   â”‚   â””â”€â”€ index.css                # Global styles
â”‚   â”œâ”€â”€ vercel.json                  # SPA routing config
â”‚   â”œâ”€â”€ vite.config.js               # Vite bundler config
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ insforge/
â”‚   â”œâ”€â”€ functions/                   # Serverless edge functions
â”‚   â”‚   â”œâ”€â”€ predict-decision.ts      # Core AI scoring engine
â”‚   â”‚   â”œâ”€â”€ simulate-career.ts       # Salary projection engine
â”‚   â”‚   â”œâ”€â”€ save-decision.ts         # Save decision to DB
â”‚   â”‚   â”œâ”€â”€ get-user-history.ts      # Fetch user history
â”‚   â”‚   â”œâ”€â”€ create-payment-order.ts  # Razorpay order creation
â”‚   â”‚   â”œâ”€â”€ upgrade-user.ts          # Payment verification
â”‚   â”‚   â””â”€â”€ create-user-profile.ts   # User profile setup
â”‚   â””â”€â”€ schema.sql                   # Database schema
â”‚
â”œâ”€â”€ .env.example                     # Environment variable template
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

---

## ðŸš€ Full Setup Guide

### Prerequisites
- Node.js v18+
- Git
- [Insforge Account](https://insforge.dev)
- [Razorpay Account](https://razorpay.com) (for payments)
- [Vercel Account](https://vercel.com) (for deployment)

### Step 1 â€” Clone the Repository
```bash
git clone https://github.com/MohammadSakibAhmad0874/Life-Decision-AI-.git
cd Life-Decision-AI-
```

### Step 2 â€” Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 3 â€” Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` with your values:
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
SECRET_KEY=your_secure_jwt_secret_here
```

### Step 4 â€” Run Locally (Development)
```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

### Step 5 â€” Deploy Edge Functions to Insforge
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

### Step 6 â€” Deploy Frontend to Vercel
```bash
cd frontend
npm run build
npx vercel --prod --yes
```

### Step 7 â€” Set Up Database
Run `insforge/schema.sql` in the **Insforge SQL Editor** to create:
- `users` â€” user accounts and plan types
- `decisions` â€” AI decision records with scores
- `history` â€” decision history log

---

## ðŸ“Š Database Schema

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

## ðŸŒŸ Advantages

| Advantage | Description |
|---|---|
| âœ… **Zero Server Cost** | Serverless edge functions â€” no always-on server |
| âœ… **24/7 Availability** | Fully cloud-native, never goes down |
| âœ… **Privacy First** | No third-party ML APIs â€” AI runs in-house |
| âœ… **Explainable AI** | XAI panel shows exactly why each score was given |
| âœ… **Lightning Fast** | Vite code-splitting + lazy loading + API caching |
| âœ… **Scalable** | Vercel + Insforge auto-scale with traffic |
| âœ… **Secure** | JWT auth, HMAC payment verification, no secrets in frontend |
| âœ… **Modern UI** | Dark glassmorphism, skeleton loaders, toast notifications |
| âœ… **Open Source** | Fork and adapt for any decision domain |

---

## ðŸ› ï¸ Tech Stack

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

## ðŸ”’ Security

- All API calls require a valid **Bearer token** (Insforge JWT)
- Razorpay payment signatures are **server-side verified** using HMAC-SHA256
- API keys stored as **Insforge secrets** â€” never exposed to the browser
- `.env` file is **gitignored** â€” secrets never committed

---

## ðŸ¤ Contributing

Pull requests are welcome!

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## ðŸ“„ License

This project is licensed under the **MIT License**.

---

## ðŸ‘¨â€ðŸ’» Credits

<div align="center">

### Made with â¤ï¸ by

# **Md Sakib Ahmad**

*AI Developer | Software Engineer | Open Source Enthusiast*

[![GitHub](https://img.shields.io/badge/GitHub-MohammadSakibAhmad0874-black?style=for-the-badge&logo=github)](https://github.com/MohammadSakibAhmad0874)

---

> *"The best decision is an informed decision."*

**Life Decision AI** â€” Empowering careers through the power of Soft Computing and AI.

---

â­ **If this project helped you, please give it a star on GitHub!** â­

</div>
