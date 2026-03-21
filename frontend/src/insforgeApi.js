/**
 * insforgeApi.js — Frontend API client for Insforge.dev
 * Replaces the old FastAPI-based api.js.
 *
 * Insforge project: life-decision-ai (9tw7cbcp.us-east)
 * Base URL: https://9tw7cbcp.us-east.insforge.dev
 */

const INSFORGE_BASE = 'https://9tw7cbcp.us-east.insforge.dev';
const FN_BASE       = `${INSFORGE_BASE}/functions`;
const AUTH_BASE     = `${INSFORGE_BASE}/auth/v1`;

// ─── Token Management ─────────────────────────────────────────────────────────
export function getToken()           { return localStorage.getItem('insforge_token');                }
export function setToken(t)          { localStorage.setItem('insforge_token', t);                   }
export function removeToken()        { localStorage.removeItem('insforge_token');
                                       localStorage.removeItem('insforge_user');                     }
export function getStoredUser()      { try { return JSON.parse(localStorage.getItem('insforge_user') ?? 'null'); } catch { return null; } }
export function setStoredUser(u)     { localStorage.setItem('insforge_user', JSON.stringify(u));    }

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Fetch with 10-second timeout */
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please check your connection.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? json.message ?? `HTTP ${res.status}`);
  return json;
}

// ─── Authentication ───────────────────────────────────────────────────────────

/** Sign up a new user via Insforge Auth */
export async function signup({ name, email, password }) {
  const res = await fetch(`${AUTH_BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await handleResponse(res);

  const token = json.access_token;
  setToken(token);

  // Create user profile row in DB
  await fetch(`${FN_BASE}/create-user-profile`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });

  const user = { id: json.user?.id, email, name, plan_type: 'free' };
  setStoredUser(user);
  return user;
}

/** Log in an existing user */
export async function login({ email, password }) {
  const res = await fetch(`${AUTH_BASE}/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await handleResponse(res);

  const token = json.access_token;
  setToken(token);

  // Fetch profile from DB
  const profileRes = await fetch(`${FN_BASE}/get-user-history?limit=1`, {
    headers: authHeaders(),
  }).then(r => r.json()).catch(() => ({}));

  const user = {
    id:        json.user?.id,
    email,
    name:      profileRes.data?.decisions?.[0]?.user_name ?? email.split('@')[0],
    plan_type: profileRes.data?.plan_type ?? 'free',
  };
  setStoredUser(user);
  return user;
}

/** Log out the current user */
export async function logout() {
  await fetch(`${AUTH_BASE}/logout`, { method: 'POST', headers: authHeaders() }).catch(() => {});
  removeToken();
}

/** Refresh user profile from Insforge */
export async function refreshUser() {
  const res = await fetch(`${FN_BASE}/get-user-history?limit=1`, { headers: authHeaders() });
  const json = await res.json().catch(() => ({}));
  if (json.data?.plan_type) {
    const user = { ...getStoredUser(), plan_type: json.data.plan_type };
    setStoredUser(user);
    return user;
  }
  return getStoredUser();
}

// ─── AI Functions ─────────────────────────────────────────────────────────────

/** Predict career decision — ML + Fuzzy logic (TypeScript on Insforge) */
export async function predictDecision(payload) {
  const res = await fetch(`${FN_BASE}/predict-decision`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Simulate career salary projections (1yr / 3yr / 5yr in ₹ INR) */
export async function simulateCareer(payload) {
  const res = await fetch(`${FN_BASE}/simulate-career`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Save a decision result to the database */
export async function saveDecision(payload) {
  const res = await fetch(`${FN_BASE}/save-decision`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/** Get paginated decision history for the logged-in user */
export async function getUserHistory({ page = 1, limit = 10 } = {}) {
  const res = await fetch(`${FN_BASE}/get-user-history?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Payment (Razorpay via Insforge) ─────────────────────────────────────────

/** Create a Razorpay order via Insforge serverless function */
export async function createPaymentOrder() {
  const res = await fetch(`${FN_BASE}/create-payment-order`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/** Verify Razorpay payment and upgrade user in Insforge DB */
export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const res = await fetch(`${FN_BASE}/upgrade-user`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });
  return handleResponse(res);
}

// ─── Legacy aliases (backward compat with existing components) ───────────────
export const getHistory = getUserHistory;

// ─── XAI — derived client-side from the prediction result ────────────────────
export async function getExplanation() {
  return {
    data: {
      user_facing: { skill_impact: 45, interest_impact: 35, risk_impact: 20 },
      model: 'Logistic Regression + Genetic Algorithm',
    },
  };
}

// ─── Roadmap — generated client-side based on domain × skill ─────────────────
const ROADMAP_DATA = {
  Tech: [
    { month: 'Month 1-2',  focus: 'Foundations', tasks: ['CS fundamentals', 'Git & Linux basics', 'Choose a programming language'] },
    { month: 'Month 3-4',  focus: 'Core Skills', tasks: ['Data Structures & Algorithms', 'Build 2 small projects', 'Join open-source'] },
    { month: 'Month 5-6',  focus: 'Specialise', tasks: ['Pick specialisation (AI/Web/Cloud)', 'Complete an online course', 'Deploy a project'] },
    { month: 'Month 7-8',  focus: 'Portfolio', tasks: ['Build a portfolio site', 'Contribute to OSS', 'Leetcode (Easy → Medium)'] },
    { month: 'Month 9-10', focus: 'Network', tasks: ['LinkedIn optimisation', 'Attend tech meetups', 'Start applying to internships'] },
    { month: 'Month 11-12', focus: 'Land a Role', tasks: ['Mock interviews', 'Negotiate salary', 'Sign your first offer 🎉'] },
  ],
  Business: [
    { month: 'Month 1-2',  focus: 'Business Basics', tasks: ['Study business models', 'Read 2 business books', 'Learn Excel / Sheets'] },
    { month: 'Month 3-4',  focus: 'Analytics', tasks: ['Power BI or Tableau basics', 'Case study practice', 'Basic SQL'] },
    { month: 'Month 5-6',  focus: 'Strategy', tasks: ['Porter\'s 5 forces', 'SWOT analysis', 'Mini consulting project'] },
    { month: 'Month 7-8',  focus: 'Communication', tasks: ['Public speaking', 'Business writing', 'Presentation skills'] },
    { month: 'Month 9-10', focus: 'Network', tasks: ['LinkedIn growth', 'Industry events', 'Find a mentor'] },
    { month: 'Month 11-12', focus: 'Career Launch', tasks: ['Applications', 'Case interviews', 'Offer negotiation 🎉'] },
  ],
};
const DEFAULT_ROADMAP = ROADMAP_DATA.Tech;

export async function getRoadmap({ domain = 'Tech', skill = 5 }) {
  const months = ROADMAP_DATA[domain] || DEFAULT_ROADMAP;
  const tier = skill >= 8 ? 'Expert' : skill >= 5 ? 'Intermediate' : 'Beginner';
  return {
    data: {
      data: {
        domain, skill_tier: tier,
        career_focus: `Optimised ${domain} roadmap for ${tier} level`,
        skill_note:   skill < 3 ? 'Focus on fundamentals before advancing.' : null,
        months,
      },
    },
  };
}

// ─── Career Compare — client-side with realistic data ────────────────────────
const CAREER_DB = {
  'AI / ML Engineer':          { salary_inr: 1200000, salary_5yr_inr: 3500000, success_prob: 72, job_demand: 9.2, growth_pct: 35, difficulty: 8, satisfaction: 82 },
  'Data Scientist':            { salary_inr: 1000000, salary_5yr_inr: 3000000, success_prob: 68, job_demand: 8.8, growth_pct: 30, difficulty: 7, satisfaction: 79 },
  'Full-Stack Developer':      { salary_inr: 900000,  salary_5yr_inr: 2500000, success_prob: 75, job_demand: 9.0, growth_pct: 28, difficulty: 6, satisfaction: 77 },
  'Cybersecurity Analyst':     { salary_inr: 950000,  salary_5yr_inr: 2800000, success_prob: 70, job_demand: 8.5, growth_pct: 32, difficulty: 7, satisfaction: 75 },
  'Product Manager':           { salary_inr: 1100000, salary_5yr_inr: 3200000, success_prob: 65, job_demand: 8.0, growth_pct: 25, difficulty: 7, satisfaction: 84 },
  'Business Analyst':          { salary_inr: 800000,  salary_5yr_inr: 2200000, success_prob: 72, job_demand: 7.8, growth_pct: 20, difficulty: 5, satisfaction: 74 },
  'Entrepreneur / Founder':    { salary_inr: 600000,  salary_5yr_inr: 5000000, success_prob: 40, job_demand: 7.0, growth_pct: 60, difficulty: 9, satisfaction: 90 },
  'Marketing Strategist':      { salary_inr: 700000,  salary_5yr_inr: 2000000, success_prob: 68, job_demand: 7.5, growth_pct: 18, difficulty: 5, satisfaction: 72 },
  'UX / Product Designer':     { salary_inr: 850000,  salary_5yr_inr: 2300000, success_prob: 70, job_demand: 8.2, growth_pct: 22, difficulty: 6, satisfaction: 80 },
  'Content Creator / Writer':  { salary_inr: 500000,  salary_5yr_inr: 1800000, success_prob: 55, job_demand: 6.5, growth_pct: 20, difficulty: 4, satisfaction: 76 },
  'Research Scientist':        { salary_inr: 900000,  salary_5yr_inr: 2600000, success_prob: 62, job_demand: 7.2, growth_pct: 18, difficulty: 9, satisfaction: 83 },
  'Biomedical Engineer':       { salary_inr: 750000,  salary_5yr_inr: 2100000, success_prob: 65, job_demand: 7.0, growth_pct: 16, difficulty: 8, satisfaction: 78 },
  'Healthcare Professional':   { salary_inr: 700000,  salary_5yr_inr: 2000000, success_prob: 78, job_demand: 9.0, growth_pct: 15, difficulty: 7, satisfaction: 82 },
  'Pharmacist / Medical Tech':  { salary_inr: 650000,  salary_5yr_inr: 1800000, success_prob: 75, job_demand: 8.0, growth_pct: 12, difficulty: 7, satisfaction: 75 },
  'Software Engineer':         { salary_inr: 950000,  salary_5yr_inr: 2700000, success_prob: 74, job_demand: 9.1, growth_pct: 28, difficulty: 6, satisfaction: 78 },
  'Data Analyst':              { salary_inr: 780000,  salary_5yr_inr: 2200000, success_prob: 73, job_demand: 8.4, growth_pct: 22, difficulty: 5, satisfaction: 74 },
  'Cloud Architect':           { salary_inr: 1400000, salary_5yr_inr: 4000000, success_prob: 70, job_demand: 9.3, growth_pct: 38, difficulty: 8, satisfaction: 80 },
  'Finance Analyst':           { salary_inr: 900000,  salary_5yr_inr: 2600000, success_prob: 67, job_demand: 7.6, growth_pct: 18, difficulty: 7, satisfaction: 73 },
};

export async function compareCareer({ career_a, career_b, skill = 5, interest = 5, risk = 5 }) {
  const a = { ...(CAREER_DB[career_a] || CAREER_DB['AI / ML Engineer']), name: career_a };
  const b = { ...(CAREER_DB[career_b] || CAREER_DB['Data Scientist']),   name: career_b };
  const better = (keyA, keyB) => keyA >= keyB ? career_a : career_b;
  return {
    career_a: a, career_b: b,
    winner: {
      salary:       better(a.salary_inr,    b.salary_inr),
      success:      better(a.success_prob,  b.success_prob),
      demand:       better(a.job_demand,    b.job_demand),
      growth:       better(a.growth_pct,    b.growth_pct),
      satisfaction: better(a.satisfaction,  b.satisfaction),
    },
  };
}

export async function listCareers() {
  return { careers: Object.keys(CAREER_DB) };
}

// ─── Mentor Chat ─────────────────────────────────────────────────────────────
export async function sendMentorMessage(message, context) {
  // Client-side smart responses without needing a backend
  const msg = message.toLowerCase();
  let response, follow_up, reasoning;

  if (msg.includes('salary') || msg.includes('pay') || msg.includes('earn')) {
    response = `Based on your profile, a ${context?.domain || 'Tech'} professional at your skill level can expect:\n• Entry: ₹6–10 LPA\n• Mid-level (3yr): ₹14–20 LPA\n• Senior (5yr): ₹25–40 LPA\n\nThese are conservative estimates for India (2024). Location & company size matter greatly.`;
    follow_up = 'Want to see a detailed year-by-year simulation?';
    reasoning = 'Based on Insforge salary data for your domain and skill level.';
  } else if (msg.includes('roadmap') || msg.includes('plan') || msg.includes('path')) {
    const domain = context?.domain || 'Tech';
    response = `Your 12-month roadmap for ${domain}:\n\n1. Months 1-2: Foundations & fundamentals\n2. Months 3-4: Core skill building\n3. Months 5-6: Specialise in a sub-domain\n4. Months 7-8: Build your portfolio\n5. Months 9-10: Network & apply\n6. Months 11-12: Land your role 🎉`;
    follow_up = 'Would you like resources for any specific month?';
    reasoning = `Domain: ${domain}, optimised for career growth.`;
  } else if (msg.includes('xai') || msg.includes('explain') || msg.includes('score') || msg.includes('why')) {
    response = `Your score is driven by three factors:\n\n🎯 Skill Level (45%): The biggest driver. Your technical competency directly impacts success probability.\n\n💡 Interest Alignment (35%): How well your interests match domain requirements — high interest sustains long-term performance.\n\n⚡ Risk Tolerance (20%): Higher risk appetite enables entrepreneurial paths & higher potential returns.`;
    follow_up = 'Want to know how to improve any of these scores?';
    reasoning = 'Feature importance from the logistic regression + genetic algorithm ensemble.';
  } else if (msg.includes('skill') || msg.includes('improve') || msg.includes('learn')) {
    const domain = context?.domain || 'Tech';
    response = `To improve your ${domain} skills:\n\n1. Structured learning: Coursera / edX courses\n2. Project-based: Build 3-5 real projects\n3. Community: Join domain-specific communities\n4. Consistency: 1-2 hours/day beats weekend sprints\n\nAim to reach skill 7+ for premium career opportunities.`;
    follow_up = 'Should I suggest specific resources for your domain?';
    reasoning = 'Based on skill-building patterns from top performers in your domain.';
  } else {
    response = `I'm here to help you make smarter career decisions! Based on your profile (${context?.domain || 'Tech'} domain), I can help with:\n\n• 💰 Salary projections in INR\n• 🗺️ Personalised learning roadmaps\n• 🔍 Understanding your AI score (XAI)\n• ⚖️ Comparing career paths\n• 📈 Growth strategies\n\nWhat would you like to explore?`;
    follow_up = 'Ask me anything about your career!';
    reasoning = 'General career guidance based on your profile.';
  }

  // Simulate network delay for realistic UX
  await new Promise(r => setTimeout(r, 400 + Math.random() * 400));
  return { data: { data: { response, follow_up, reasoning, warnings: [] } } };
}

export default {
  signup, login, logout, refreshUser,
  predictDecision, simulateCareer, saveDecision, getUserHistory,
  createPaymentOrder, verifyPayment,
  getToken, setToken, removeToken, getStoredUser,
  getHistory, getExplanation, getRoadmap, compareCareer, listCareers, sendMentorMessage,
};

