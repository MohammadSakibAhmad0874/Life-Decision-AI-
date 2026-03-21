/**
 * save-decision.ts — Insforge Edge Function
 * Saves a decision to the decisions table.
 *
 * POST /functions/save-decision
 * Body: { skill_level, interest_level, risk_tolerance, domain, result_score,
 *         suggested_path, fuzzy_score, ml_probability, result_json }
 *
 * Auth: Bearer token required
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const { db, auth } = InsForge;
    const { data: sessionData, error } = await auth.getUser(token);
    if (error || !sessionData?.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });

    const { data: userRows } = await db
      .from('users').select('id').eq('auth_user_id', sessionData.user.id).limit(1);
    const userId = userRows?.[0]?.id;
    if (!userId) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });

    const body = await req.json();
    const { data: decision, error: insertError } = await db.from('decisions').insert({
      user_id:        userId,
      skill_level:    body.skill_level,
      interest_level: body.interest_level,
      risk_tolerance: body.risk_tolerance,
      domain:         body.domain,
      result_score:   body.result_score,
      suggested_path: body.suggested_path,
      fuzzy_score:    body.fuzzy_score,
      ml_probability: body.ml_probability,
      result_json:    body.result_json ?? {},
    }).select().single();

    if (insertError) return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers });

    // Also log to history
    await db.from('history').insert({
      user_id:     userId,
      decision_id: decision.id,
      career:      body.suggested_path ?? body.domain,
      score:       Math.round((body.result_score ?? 5) * 10),
    });

    return new Response(JSON.stringify({ success: true, data: decision }), { status: 201, headers });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500, headers });
  }
});
