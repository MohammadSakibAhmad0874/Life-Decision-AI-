/**
 * simulate-career.ts — Insforge Edge Function
 * Returns 1yr / 3yr / 5yr salary projections in ₹ INR.
 *
 * POST /functions/simulate-career
 * Body: { domain, skill_level, experience_years?, role? }
 *
 * Auth: Bearer token required
 */

interface SimInput {
  domain: string;
  skill_level: number;
  experience_years?: number;
  role?: string;
}

// Base salaries (₹ INR / year) by domain, indexed by tier (0=entry, 1=mid, 2=senior)
const BASE_SALARIES: Record<string, [number, number, number]> = {
  Tech:       [480000,  900000, 1800000],
  Business:   [420000,  780000, 1400000],
  Healthcare: [360000,  720000, 1200000],
  Arts:       [300000,  540000,  900000],
  Science:    [500000,  960000, 1600000],
  Education:  [320000,  580000,  960000],
};

const GROWTH_RATES: Record<string, number> = {
  Tech:       0.18,
  Business:   0.15,
  Healthcare: 0.12,
  Arts:       0.10,
  Science:    0.16,
  Education:  0.08,
};

function getTier(skill: number, exp: number): 0 | 1 | 2 {
  if (skill >= 7 || exp >= 5) return 2;
  if (skill >= 4 || exp >= 2) return 1;
  return 0;
}

function project(base: number, rate: number, years: number): number {
  return Math.round(base * Math.pow(1 + rate, years));
}

function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const { auth } = InsForge;
    const { data: sessionData, error } = await auth.getUser(token);
    if (error || !sessionData?.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });

    const input: SimInput = await req.json();
    const { domain = 'Tech', skill_level = 5, experience_years = 0 } = input;

    const bases = BASE_SALARIES[domain] ?? BASE_SALARIES['Tech'];
    const rate   = GROWTH_RATES[domain]  ?? 0.12;
    const tier   = getTier(skill_level, experience_years);
    const base   = bases[tier];

    const yr1 = project(base, rate, 1);
    const yr3 = project(base, rate, 3);
    const yr5 = project(base, rate, 5);

    return new Response(JSON.stringify({
      success: true,
      data: {
        domain,
        skill_level,
        experience_years,
        career_tier: ['Entry Level', 'Mid Level', 'Senior Level'][tier],
        projections: {
          year_1: { amount: yr1, formatted: formatINR(yr1) },
          year_3: { amount: yr3, formatted: formatINR(yr3) },
          year_5: { amount: yr5, formatted: formatINR(yr5) },
        },
        growth_rate:     `${(rate * 100).toFixed(0)}% per year`,
        note: 'Salary projections based on INR market data (2024–2025).',
      },
    }), { status: 200, headers });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});
