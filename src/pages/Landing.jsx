import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FAQAccordion from '../components/FAQAccordion';
import { PLANS } from '../utils/razorpay';
import { useApp } from '../context/AppContext';

export default function Landing() {
  const navigate = useNavigate();
  const { setPlan } = useApp();

  const choosePlan = (planId) => {
    setPlan(planId);
    navigate('/payment');
  };

  return (
    <div>
      <Navbar />
      <div className="page-content">

        {/* ── Hero ── */}
        <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 60px' }}>
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-orb hero-orb-3"></div>
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>

            {/* Social proof pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 999, marginBottom: 28, fontSize: 13, fontWeight: 600 }}>
              <span>⭐</span>
              <span style={{ color: 'var(--color-primary)' }}>2,400+ resumes built · 4.9 stars</span>
              <span className="glow-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4edea3', boxShadow: '0 0 8px #4edea3' }}></span>
            </div>

            <h1 className="display-lg" style={{ marginBottom: 20, maxWidth: 720, margin: '0 auto 20px' }}>
              Your AI-Powered Resume,<br />
              <span className="text-gradient">Built in 5 Minutes.</span>
            </h1>

            <p className="body-lg text-muted" style={{ maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
              Stop struggling with Word templates. Get an ATS-optimized, recruiter-ready resume written by Claude AI — the same model used by top companies worldwide.
            </p>

            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => choosePlan('pro')}
                style={{ minWidth: 220 }}>
                🚀 Build My Resume — ₹199
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}>
                View All Plans ↓
              </button>
            </div>

            {/* Trust signals */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
              {[
                { icon: '🔒', text: 'No signup required' },
                { icon: '⚡', text: 'Ready in 5 minutes' },
                { icon: '🎯', text: 'ATS-optimized' },
                { icon: '🇮🇳', text: 'Made for Indian freshers' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14,
                  color: 'var(--color-on-surface-variant)', fontWeight: 500 }}>
                  <span>{item.icon}</span><span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sample Resume Preview ── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="headline-lg" style={{ marginBottom: 8 }}>What You'll Get</h2>
              <p className="body-md text-muted">Professional, ATS-beating resumes that get you noticed</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { title: 'Classic Template', desc: 'Clean, professional — loved by FAANG recruiters', emoji: '📄', color: '#7c3aed' },
                { title: 'Modern Template', desc: 'Two-column design with a bold visual identity', emoji: '✨', color: '#0566d9' },
                { title: 'Minimal Template', desc: 'Distraction-free layout for maximum ATS score', emoji: '🎯', color: '#4edea3' },
              ].map((t, i) => (
                <div key={i} className="glass-card glass-card-hover" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12, filter: `drop-shadow(0 0 12px ${t.color})`, animation: 'float 3s ease-in-out infinite', animationDelay: `${i * 0.5}s` }}>{t.emoji}</div>
                  <h3 style={{ fontSize: 18, marginBottom: 6, color: t.color }}>{t.title}</h3>
                  <p className="body-md text-muted">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="section" style={{ background: 'rgba(124,58,237,0.04)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 className="headline-lg" style={{ marginBottom: 8 }}>How It Works</h2>
              <p className="body-md text-muted">Three simple steps to your dream resume</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
              {[
                { step: '01', icon: '💳', title: 'Choose a Plan', desc: 'Pick Basic, Pro, or Premium. Pay once, download forever.' },
                { step: '02', icon: '📝', title: 'Fill Your Details', desc: 'Answer our guided 3-step form. Takes less than 10 minutes.' },
                { step: '03', icon: '🤖', title: 'AI Generates Resume', desc: 'Claude AI writes your resume with action verbs and keywords.' },
                { step: '04', icon: '⬇️', title: 'Download & Apply', desc: 'Export as PDF. Share on LinkedIn or apply directly.' },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ position: 'relative' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-container)', letterSpacing: '0.1em', marginBottom: 8 }}>STEP {s.step}</div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                  <h3 style={{ fontSize: 16, marginBottom: 6 }}>{s.title}</h3>
                  <p className="body-md text-muted" style={{ fontSize: 14 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="section" id="pricing">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <span className="badge badge-primary" style={{ marginBottom: 12 }}>💰 Transparent Pricing</span>
              <h2 className="headline-lg" style={{ marginBottom: 8 }}>One-Time Payment. Yours Forever.</h2>
              <p className="body-md text-muted">No subscriptions. No hidden fees. Pay once, get your resume.</p>
            </div>
            <div className="pricing-grid">
              {Object.values(PLANS).map((plan) => (
                <div key={plan.id} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{plan.emoji}</div>
                    <div className="label-md text-muted" style={{ marginBottom: 4 }}>{plan.name}</div>
                    <div className="pricing-price">
                      <span className="pricing-currency">₹</span>
                      {plan.price}
                    </div>
                    <div className="label-sm text-muted" style={{ marginTop: 4 }}>One-time · Instant access</div>
                  </div>
                  <ul className="pricing-features" style={{ marginBottom: 24 }}>
                    {plan.features.map((f, i) => (
                      <li key={i}><span className="check">✓</span>{f}</li>
                    ))}
                  </ul>
                  <button
                    className={`btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-full`}
                    onClick={() => choosePlan(plan.id)}>
                    Get {plan.name} Plan →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof / Testimonials ── */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="headline-lg" style={{ marginBottom: 8 }}>What Students Say</h2>
              <p className="body-md text-muted">Join thousands of freshers who landed their first tech job</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
              {[
                { name: 'Ananya S.', college: 'VIT Vellore', text: 'Got placed at TCS Digital within a week of using this! The AI made my resume sound 10x better.', stars: 5, role: 'SDE Fresher' },
                { name: 'Rahul P.', college: 'BITS Pilani', text: 'The LinkedIn rewrite was incredible. My profile views went up 400% in one month. Worth every rupee!', stars: 5, role: 'Data Analyst' },
                { name: 'Priya M.', college: 'NIT Trichy', text: 'I was struggling with a blank page for weeks. This tool built a professional resume in 5 minutes. Shocked!', stars: 5, role: 'Backend Dev' },
              ].map((t, i) => (
                <div key={i} className="glass-card">
                  <div style={{ color: '#fbbf24', fontSize: 14, marginBottom: 10 }}>{'★'.repeat(t.stars)}</div>
                  <p style={{ color: 'var(--color-on-surface)', fontSize: 14, lineHeight: 1.6, marginBottom: 14, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{t.role} · {t.college}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="section" style={{ background: 'rgba(124,58,237,0.03)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="headline-lg" style={{ marginBottom: 8 }}>Frequently Asked Questions</h2>
            </div>
            <FAQAccordion />
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <section className="section" style={{ textAlign: 'center', paddingBottom: 80 }}>
          <div className="container">
            <h2 className="headline-lg" style={{ marginBottom: 12 }}>Ready to Land Your Dream Job?</h2>
            <p className="body-lg text-muted" style={{ marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
              Your first tech job starts with a great resume. Let AI write it for you.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => choosePlan('pro')}>
              ✨ Build My Resume Now — Starting ₹99
            </button>
          </div>
        </section>

        {/* ── Mobile Sticky CTA ── */}
        <div className="mobile-sticky-cta">
          <button className="btn btn-primary btn-full btn-lg" onClick={() => choosePlan('pro')}>
            🚀 Build My Resume — ₹199
          </button>
        </div>
      </div>
    </div>
  );
}
