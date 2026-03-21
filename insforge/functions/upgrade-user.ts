/**
 * upgrade-user.ts — Insforge Edge Function
 * Called after successful Razorpay payment to upgrade user to premium.
 *
 * POST /functions/upgrade-user
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *
 * Auth: Bearer token required
 */

import { createHmac } from 'node:crypto';

const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

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

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Verify Razorpay HMAC signature
    if (!RZP_KEY_SECRET) {
      return new Response(JSON.stringify({ error: 'Payment verification not configured.' }), { status: 500, headers });
    }

    const expectedSignature = createHmac('sha256', RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Invalid payment signature. Payment not verified.' }), { status: 400, headers });
    }

    // Upgrade user plan in DB
    const { data: updated, error: updateError } = await db
      .from('users')
      .update({ plan_type: 'premium' })
      .eq('auth_user_id', sessionData.user.id)
      .select('id, name, email, plan_type')
      .single();

    if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers });

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified. You are now a Premium member! ⭐',
      user: updated,
    }), { status: 200, headers });

  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), { status: 500, headers });
  }
});
