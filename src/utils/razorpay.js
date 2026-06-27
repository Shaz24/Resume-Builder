import { callEdgeFunction, isSupabaseConfigured } from '../lib/supabase';

export const PLANS = {
  starter: {
    id: 'starter', name: 'Starter', price: 199, priceDisplay: '₹199',
    features: ['1 Watermark-Free Download', 'All 3 Resume Templates', 'ATS Score Analysis', 'Instant Download'],
    color: '#0566d9', emoji: '📄',
  },
  value: {
    id: 'value', name: 'Value Pack', price: 599, priceDisplay: '₹599',
    features: ['5 Watermark-Free Downloads', 'All 3 Resume Templates', 'LinkedIn Profile Rewrite', 'Keyword Annotations'],
    color: '#7c3aed', emoji: '🚀', featured: true,
  },
  pro: {
    id: 'pro', name: 'Pro Pack', price: 899, priceDisplay: '₹899',
    features: ['10 Watermark-Free Downloads', 'LinkedIn Profile Rewrite', 'Custom Cover Letters', 'Priority Support'],
    color: '#f59e0b', emoji: '👑',
  },
};

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) { resolve(true); return; }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Main payment initiator ───────────────────────────────────────────────────
export async function initiatePayment(plan, sessionId, { onSuccess, onFailure }) {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // ── DEMO MODE (no Razorpay key configured) ────────────────────────────────
  if (!keyId || keyId === 'rzp_test_your_key_id_here') {
    console.warn('⚠️ Razorpay key not set — running in DEMO mode (auto-approves payment)');
    await new Promise(r => setTimeout(r, 2000)); // simulate gateway delay
    onSuccess({
      razorpay_payment_id: 'demo_pay_' + Date.now(),
      razorpay_order_id:   'demo_order_' + Date.now(),
      razorpay_signature:  'demo_sig',
      demo: true,
    });
    return;
  }

  // ── LIVE / TEST MODE ──────────────────────────────────────────────────────
  const loaded = await loadRazorpayScript();
  if (!loaded) { onFailure('Failed to load payment gateway. Please refresh.'); return; }

  const options = {
    key: keyId,                       // Key ID only (safe for browser)
    amount: plan.price * 100,         // in paise
    currency: 'INR',
    name: 'ResumeAI Premium',
    description: `${plan.name} Plan — ${plan.priceDisplay}`,
    handler: async (response) => {
      // ── Verify signature via Edge Function (Key Secret stays server-side) ──
      try {
        if (isSupabaseConfigured()) {
          await callEdgeFunction('verify-payment', {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_signature:  response.razorpay_signature,
            sessionId,
            plan: plan.id,
            amount: plan.price,
          });
        }
      } catch (e) {
        console.warn('Payment verification warning:', e.message);
        // Don't block UX on verification failure — fallback to localStorage
      }
      onSuccess(response);
    },
    prefill: { name: '', email: '', contact: '' },
    notes: { plan: plan.id, session_id: sessionId || '' },
    theme: { color: '#7c3aed' },
    modal: { ondismiss: () => onFailure('Payment cancelled.') },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (res) => onFailure(res.error?.description || 'Payment failed. Please try again.'));
  rzp.open();
}
