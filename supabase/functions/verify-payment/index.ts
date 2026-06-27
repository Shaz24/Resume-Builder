// Supabase Edge Function: verify-payment
// Uses Razorpay Key Secret (server-side only) to verify payment signatures
// Deploy: supabase functions deploy verify-payment

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, sessionId, plan, amount } = await req.json();

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ── Signature Verification ──────────────────────────────────────────────
    let isValid = false;

    if (keySecret && razorpay_signature && razorpay_order_id) {
      // Production: verify HMAC SHA256 signature
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', encoder.encode(keySecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false, ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      const expectedSig = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      isValid = expectedSig === razorpay_signature;
    } else {
      // Demo mode (no secret set) — accept all payments
      isValid = true;
    }

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Payment signature verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Save to Database ────────────────────────────────────────────────────
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        session_id: sessionId || null,
        plan,
        amount: amount * 100, // store in paise
        razorpay_payment_id,
        razorpay_order_id,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update session plan
    if (sessionId) {
      await supabase.from('sessions').update({ plan }).eq('id', sessionId);
    }

    return new Response(JSON.stringify({ data: { payment, verified: true } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
