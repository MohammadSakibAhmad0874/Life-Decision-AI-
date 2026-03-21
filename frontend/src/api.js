/**
 * api.js — all Axios calls for Life Decision AI v5.0
 * Automatically attaches JWT token from localStorage.
 */
import axios from 'axios';
import { getToken } from './utils/auth';

const BASE = 'http://localhost:8000';

const api = axios.create({ baseURL: BASE });

// ─── Auth interceptor: attach Bearer token if available ─────────────────────
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth endpoints ──────────────────────────────────────────────────────────
export const loginUser      = (email, password)        => api.post('/api/login',   { email, password });
export const signupUser     = (name, email, password)  => api.post('/api/signup',  { name, email, password });
export const getCurrentUser = ()                       => api.get('/api/me');
export const upgradeUser    = ()                       => api.post('/api/upgrade');

// ─── History endpoints ───────────────────────────────────────────────────────
export const getDecisionHistory = (limit = 20)                   => api.get(`/api/decision/history?limit=${limit}`);
export const getUserHistory     = (limit = 10)                   => api.get(`/api/history?limit=${limit}`);
export const saveUserDecision   = (inputs, result, score, career) => api.post('/api/save-decision', { inputs, result, score, career });

// ─── AI endpoints ────────────────────────────────────────────────────────────
export const getDecision       = (payload)            => api.post('/api/decision', payload);
export const getSimulation     = (career, domain)     => api.post('/api/simulation', { career_path: career, domain });
export const getMentorReply    = (message, context)   => api.post('/api/mentor/chat', { message, context });
export const trainModel        = (rebuild = false)    => api.post('/api/train-model', { rebuild_data: rebuild });
export const compareCareer     = (payload)            => api.post('/api/compare', payload);
export const getCareers        = ()                   => api.get('/api/careers');
export const getRoadmap        = (payload)            => api.post('/api/roadmap', payload);
export const getExplanation    = ()                   => api.get('/api/explain');
export const explainPrediction = (payload)            => api.post('/api/explain/prediction', payload);

// ─── Backward-compat aliases (used by existing components) ───────────────────
export const getHistory        = getDecisionHistory; // HistoryPanel.jsx — uses /api/decision/history
export const sendMentorMessage = getMentorReply;   // MentorChat.jsx
export const listCareers       = getCareers;       // ComparePanel.jsx

// ─── Payment endpoints (Razorpay) ────────────────────────────────────────────
export const createPaymentOrder = ()       => api.post('/api/payment/create-order');
export const verifyPayment      = (body)   => api.post('/api/payment/verify', body);
export const demoUpgrade        = ()       => api.post('/api/payment/demo-upgrade');
