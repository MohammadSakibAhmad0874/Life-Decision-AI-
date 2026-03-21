/**
 * get-user-history.ts — Insforge Edge Function
 * Returns paginated decision history for the authenticated user.
 *
 * GET /functions/get-user-history?page=1&limit=10
 *
 * Auth: Bearer token required
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'GET, OPTIONS' } });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const { db, auth } = InsForge;
    const { data: sessionData, error } = await auth.getUser(token);
    if (error || !sessionData?.user) return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });

    const { data: userRows } = await db
      .from('users').select('id, plan_type').eq('auth_user_id', sessionData.user.id).limit(1);
    const userProfile = userRows?.[0];
    if (!userProfile) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers });

    // Pagination
    const url    = new URL(req.url);
    const page   = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const limit  = userProfile.plan_type === 'premium' ? parseInt(url.searchParams.get('limit') ?? '20') : 10;
    const offset = (page - 1) * limit;

    const { data: decisions, error: fetchError } = await db
      .from('decisions')
      .select('id, domain, skill_level, interest_level, risk_tolerance, result_score, suggested_path, fuzzy_score, ml_probability, created_at')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) return new Response(JSON.stringify({ error: fetchError.message }), { status: 500, headers });

    // Count total
    const { count } = await db
      .from('decisions').select('id', { count: 'exact', head: true })
      .eq('user_id', userProfile.id);

    return new Response(JSON.stringify({
      success: true,
      data: {
        decisions: decisions ?? [],
        pagination: { page, limit, total: count ?? 0, pages: Math.ceil((count ?? 0) / limit) },
        plan_type: userProfile.plan_type,
        note: userProfile.plan_type === 'free' ? 'Free users see last 10 decisions. Upgrade for full history.' : null,
      },
    }), { status: 200, headers });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500, headers });
  }
});
