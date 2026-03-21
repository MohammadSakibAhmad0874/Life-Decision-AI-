/**
 * create-payment-order.ts — Insforge Edge Function
 * Creates a Razorpay order for premium plan checkout.
 * Replaces the old FastAPI POST /api/payment/create-order.
 *
 * POST /functions/create-payment-order
 * Body: { amount? }  (defaults to ₹999 × 100 paise)
 *
 * Auth: Bearer token required
 */

const RZP_KEY_ID     = Deno.env.get('RAZORPAY_KEY_ID')     ?? '';
const RZP_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const AMOUNT_PAISE   = 99900; // ₹999 in paise

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    // ── Auth check ───────────────────────────────────────────────────────────
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '').trim();
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });

    const { auth } = InsForge;
    const { data: sessionData, error: authError } = await auth.getUser(token);
    if (authError || !sessionData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers });
    }

    // ── Validate Razorpay credentials ────────────────────────────────────────
    if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured. Please contact support.' }),
        { status: 500, headers },
      );
    }

    // ── Create Razorpay order via REST API ───────────────────────────────────
    const credentials = btoa(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`);
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount:   AMOUNT_PAISE,
        currency: 'INR',
        receipt:  `receipt_${Date.now()}`,
        notes:    { plan: 'premium', user_id: sessionData.user.id },
      }),
    });

    if (!rzpRes.ok) {
      const errText = await rzpRes.text();
      return new Response(
        JSON.stringify({ error: `Razorpay error: ${errText}` }),
        { status: 502, headers },
      );
    }

    const order = await rzpRes.json();

    return new Response(
      JSON.stringify({
        success:    true,
        order_id:   order.id,
        amount:     order.amount,
        currency:   order.currency,
        key_id:     RZP_KEY_ID,
      }),
      { status: 200, headers },
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});
