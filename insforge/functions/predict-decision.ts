/**
 * predict-decision.ts — Insforge Edge Function
 * Replicates Python ML + Fuzzy logic in TypeScript (Option B).
 *
 * POST /functions/predict-decision
 * Body: { skill_level, interest_level, risk_tolerance, domain, experience_years, age }
 *
 * Auth: Bearer token required
 */

// ─── Types ────────────────────────────────────────────────────────────────────
interface Input {
  skill_level: number;      // 0–10
  interest_level: number;   // 0–10
  risk_tolerance: number;   // 0–10
  domain: string;
  experience_years?: number;
  age?: number;
}

interface FuzzyResult {
  score: number;
  label: string;
  membership: { low: number; medium: number; high: number };
}

// ─── Fuzzy Logic Engine ───────────────────────────────────────────────────────
function triangularMF(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x <= b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

function trapezoidalMF(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

function fuzzySkill(s: number): { low: number; medium: number; high: number } {
  return {
    low:    trapezoidalMF(s, 0, 0, 3, 5),
    medium: triangularMF(s, 3, 5, 7),
    high:   trapezoidalMF(s, 5, 7, 10, 10),
  };
}

function fuzzyInterest(i: number): { low: number; medium: number; high: number } {
  return {
    low:    trapezoidalMF(i, 0, 0, 3, 5),
    medium: triangularMF(i, 3, 5, 7),
    high:   trapezoidalMF(i, 5, 7, 10, 10),
  };
}

function fuzzyRisk(r: number): { conservative: number; moderate: number; aggressive: number } {
  return {
    conservative: trapezoidalMF(r, 0, 0, 3, 5),
    moderate:     triangularMF(r, 3, 5, 7),
    aggressive:   trapezoidalMF(r, 5, 7, 10, 10),
  };
}

function fuzzyInference(s: FuzzyResult["membership"], i: FuzzyResult["membership"], r: { conservative: number; moderate: number; aggressive: number }): number {
  // Mamdani-style rule base → defuzzification (centroid approx)
  const rules: Array<[number, number]> = [
    [Math.min(s.high, i.high, r.aggressive), 9.0],
    [Math.min(s.high, i.high, r.moderate),  8.0],
    [Math.min(s.high, i.medium, r.moderate), 7.5],
    [Math.min(s.medium, i.high, r.moderate), 7.0],
    [Math.min(s.high, i.low, r.aggressive),  6.5],
    [Math.min(s.medium, i.medium, r.moderate), 6.0],
    [Math.min(s.medium, i.medium, r.conservative), 5.0],
    [Math.min(s.low, i.high, r.aggressive),  5.5],
    [Math.min(s.low, i.medium, r.moderate),  4.0],
    [Math.min(s.low, i.low, r.conservative), 2.0],
  ];

  let numerator = 0, denominator = 0;
  for (const [mu, centroid] of rules) {
    numerator   += mu * centroid;
    denominator += mu;
  }
  return denominator === 0 ? 5 : numerator / denominator;
}

function runFuzzy(input: Input): FuzzyResult {
  const sm = fuzzySkill(input.skill_level);
  const im = fuzzyInterest(input.interest_level);
  const rm = fuzzyRisk(input.risk_tolerance);
  const score = fuzzyInference(sm, im, rm);
  const label = score >= 7 ? 'High Potential' : score >= 5 ? 'Moderate Potential' : 'Needs Development';
  return { score: parseFloat(score.toFixed(2)), label, membership: sm };
}

// ─── ML-style Logistic Regression (weights learned from domain expertise) ─────
const DOMAIN_WEIGHTS: Record<string, number> = {
  Tech:       0.35,
  Business:   0.28,
  Healthcare: 0.30,
  Arts:       0.22,
  Science:    0.32,
  Education:  0.25,
};

function mlPredict(input: Input): { probability: number; confidence: number; suggested_path: string } {
  const domainW  = DOMAIN_WEIGHTS[input.domain] ?? 0.25;
  const skillN   = input.skill_level / 10;
  const interestN = input.interest_level / 10;
  const riskN    = input.risk_tolerance / 10;
  const expN     = Math.min((input.experience_years ?? 0) / 20, 1);
  const ageBonus = input.age ? (input.age >= 22 && input.age <= 35 ? 0.05 : -0.02) : 0;

  const linearCombination =
    skillN    * 0.35 +
    interestN * 0.25 +
    domainW   * 0.20 +
    riskN     * 0.10 +
    expN      * 0.10 +
    ageBonus;

  // Sigmoid activation
  const probability = 1 / (1 + Math.exp(-8 * (linearCombination - 0.5)));
  const confidence  = Math.abs(probability - 0.5) * 2;

  const suggested_path = suggestPath(input.domain, probability, input.skill_level);
  return { probability: parseFloat(probability.toFixed(4)), confidence: parseFloat(confidence.toFixed(4)), suggested_path };
}

function suggestPath(domain: string, prob: number, skill: number): string {
  const paths: Record<string, [string, string, string]> = {
    Tech:       ['Junior Developer', 'Senior Developer', 'Tech Lead / Architect'],
    Business:   ['Business Analyst', 'Product Manager', 'VP / Director'],
    Healthcare: ['Healthcare Assistant', 'Clinical Specialist', 'Medical Director'],
    Arts:       ['Creative Junior', 'Creative Lead', 'Art Director'],
    Science:    ['Research Assistant', 'Research Scientist', 'Principal Researcher'],
    Education:  ['Teaching Assistant', 'Senior Educator', 'Department Head'],
  };
  const p = paths[domain] ?? ['Entry Level', 'Mid Level', 'Senior Level'];
  if (prob < 0.45 || skill < 4) return p[0];
  if (prob < 0.70 || skill < 7) return p[1];
  return p[2];
}

// ─── Genetic Algorithm: Optimize career factors ───────────────────────────────
function geneticOptimize(input: Input): { optimized_skill: number; optimized_interest: number; improvement: string } {
  // Single-generation simple optimizer for demonstration
  const target_skill    = Math.min(10, input.skill_level    + (10 - input.skill_level)    * 0.3);
  const target_interest = Math.min(10, input.interest_level + (10 - input.interest_level) * 0.2);
  return {
    optimized_skill:    parseFloat(target_skill.toFixed(1)),
    optimized_interest: parseFloat(target_interest.toFixed(1)),
    improvement: `Focus on improving skills from ${input.skill_level} → ${target_skill.toFixed(1)} to maximize success.`,
  };
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const { db, auth } = InsForge;

    // Verify token → get user
    const { data: sessionData, error: sessionError } = await auth.getUser(token);
    if (sessionError || !sessionData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }
    const authUserId = sessionData.user.id;

    // ── Get profile from DB ─────────────────────────────────────────────────
    const { data: userRows } = await db
      .from('users')
      .select('id, plan_type')
      .eq('auth_user_id', authUserId)
      .limit(1);

    const userProfile = userRows?.[0];
    if (!userProfile) return new Response(JSON.stringify({ error: 'User profile not found. Please sign up first.' }), { status: 404, headers });

    // ── Freemium check: free users max 3 predictions/day ───────────────────
    if (userProfile.plan_type === 'free') {
      const { data: countResult } = await db.rpc('count_today_predictions', { p_user_id: userProfile.id });
      const todayCount = countResult ?? 0;
      if (todayCount >= 3) {
        return new Response(JSON.stringify({
          error: 'Daily limit reached. Free users get 3 predictions/day. Upgrade to Premium for unlimited access.',
          limit_reached: true,
        }), { status: 429, headers });
      }
    }

    // ── Parse input ─────────────────────────────────────────────────────────
    const input: Input = await req.json();
    const { skill_level = 5, interest_level = 5, risk_tolerance = 5, domain = 'Tech' } = input;
    const validatedInput: Input = { ...input, skill_level, interest_level, risk_tolerance, domain };

    // ── Run models ──────────────────────────────────────────────────────────
    const fuzzy    = runFuzzy(validatedInput);
    const ml       = mlPredict(validatedInput);
    const genetic  = geneticOptimize(validatedInput);

    const result = {
      fuzzy: {
        score: fuzzy.score,
        label: fuzzy.label,
        membership: fuzzy.membership,
      },
      ml: {
        probability: ml.probability,
        confidence:  ml.confidence,
        prediction:  ml.probability >= 0.5 ? 'Success Likely' : 'Needs Improvement',
      },
      genetic: genetic,
      suggested_path: ml.suggested_path,
      domain,
      overall_score: parseFloat(((fuzzy.score / 10 * 0.4 + ml.probability * 0.6) * 10).toFixed(2)),
      recommendation: ml.probability >= 0.7
        ? `Strong fit for ${ml.suggested_path}. Continue building skills.`
        : ml.probability >= 0.5
          ? `Moderate fit. Focus on skill development.`
          : `Consider alternative paths or intensive skill building.`,
    };

    return new Response(JSON.stringify({ success: true, data: result }), { status: 200, headers });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});
