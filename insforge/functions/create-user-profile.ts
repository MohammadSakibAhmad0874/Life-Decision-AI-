/**
 * create-user-profile.ts — Insforge Edge Function
 * Creates a row in the users table after Insforge signup.
 * Called immediately after auth.signUp() on the frontend.
 *
 * POST /functions/create-user-profile
 * Body: { name }  (email comes from JWT)
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

    const authUser = sessionData.user;
    const body = await req.json();
    const name  = body.name ?? authUser.email?.split('@')[0] ?? 'User';

    // Upsert — safe to call multiple times
    const { data: profile, error: upsertError } = await db
      .from('users')
      .upsert({
        auth_user_id: authUser.id,
        name,
        email:        authUser.email ?? '',
        plan_type:    'free',
      }, { onConflict: 'auth_user_id' })
      .select()
      .single();

    if (upsertError) return new Response(JSON.stringify({ error: upsertError.message }), { status: 500, headers });

    return new Response(JSON.stringify({ success: true, data: profile }), { status: 201, headers });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500, headers });
  }
});
