import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { PLANS, initiatePayment } from '../utils/razorpay';
import { savePayment, logEvent } from '../utils/db';

export default function Payment() {
  const navigate = useNavigate();
  const { plan, setPlan, setPayment, setCredits, sessionId, addToast, showLoading, hideLoading } = useApp();
  const [paying, setPaying] = useState(false);

  // Fallback to value plan if no valid plan in context
  const selectedPlan = PLANS[plan] || PLANS.value || PLANS.pro;

  const handlePayment = async () => {
    setPaying(true);
    showLoading('Opening payment gateway...');
    try {
      await initiatePayment(selectedPlan, sessionId, {
        onSuccess: async (response) => {
          hideLoading();
          const paymentRecord = {
            plan: selectedPlan.id,
            planName: selectedPlan.name,
            amount: selectedPlan.price,
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            paidAt: new Date().toISOString(),
            demo: response.demo || false,
          };
          setPayment(paymentRecord);
          setPlan(selectedPlan.id);

          // Add credits locally (database verifier will handle this on the backend)
          let addedCredits = 0;
          if (selectedPlan.id === 'starter') addedCredits = 1;
          else if (selectedPlan.id === 'value') addedCredits = 5;
          else if (selectedPlan.id === 'pro') addedCredits = 10;
          setCredits(prev => prev + addedCredits);

          // Save to Supabase + localStorage
          await savePayment(sessionId, paymentRecord);
          logEvent(sessionId, 'payment_success', { plan: selectedPlan.id, amount: selectedPlan.price });
          addToast(`✅ Payment successful! Welcome to ${selectedPlan.name} plan.`, 'success', 4000);
          setTimeout(() => navigate('/form'), 500);
        },
        onFailure: (msg) => {
          hideLoading();
          logEvent(sessionId, 'payment_failed', { reason: msg });
          addToast(`❌ ${msg}`, 'error', 5000);
          setPaying(false);
        },
      });
    } catch (e) {
      hideLoading();
      addToast('Payment failed. Please try again.', 'error');
      setPaying(false);
    }
  };

  return (
    <div style={{ background: '#0A0A0F', color: '#e5e2e1', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 80px' }}>
        <div style={{ maxWidth: 480, width: '100%' }}>

          {/* Back */}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 24 }}>
            ← Back to Plans
          </button>

          {/* Plan Summary Card */}
          <div className="glass-card" style={{
            marginBottom: 20, border: '1px solid rgba(124,58,237,0.4)', position: 'relative', overflow: 'hidden',
            background: 'rgba(19, 19, 26, 0.8)', boxShadow: '0 10px 40px rgba(124, 58, 237, 0.15)'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top left, rgba(124,58,237,0.1), transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 40 }}>{selectedPlan.emoji}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Selected Plan</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{selectedPlan.name}</div>
                </div>
                {selectedPlan.featured && <span className="badge badge-primary" style={{ marginLeft: 'auto', background: '#7c3aed', color: '#fff' }}>Popular</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontSize: 48, fontWeight: 800, color: '#fff' }}>₹{selectedPlan.price}</span>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>one-time payment</span>
              </div>

              <div className="divider" style={{ margin: '0 0 20px' }} />

              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedPlan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 14, color: '#94a3b8' }}>
                    <span style={{ color: '#4edea3' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Switch Plan */}
          <div style={{ marginBottom: 24 }}>
            <div className="label-sm text-muted" style={{ marginBottom: 8, color: '#94a3b8' }}>Switch plan:</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {Object.values(PLANS).map(p => (
                <button key={p.id}
                  className={`btn btn-sm ${selectedPlan.id === p.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPlan(p.id)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 20 }}>
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Pay Button */}
          <button
            className="btn btn-primary btn-full btn-lg glow-hover btn-shimmer"
            onClick={handlePayment}
            disabled={paying}
            style={{ marginBottom: 16, padding: '14px 20px', borderRadius: 24 }}>
            {paying ? (
              <><div className="spinner" style={{ width: 20, height: 20 }}></div> Processing...</>
            ) : (
              <>🔒 Pay ₹{selectedPlan.price} Securely</>
            )}
          </button>

          {/* Trust */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🔒 Razorpay Secured', '📱 UPI / Cards / Net Banking', '🚫 No Refunds*'].map((t, i) => (
              <span key={i} style={{ fontSize: 12, color: '#64748b' }}>{t}</span>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#475569', marginTop: 12, lineHeight: 1.4 }}>
            *As service delivery is instant and includes premium AI tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
