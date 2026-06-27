import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Confetti from '../components/Confetti';
import { useApp } from '../context/AppContext';
import { storage, KEYS, generateReferralCode } from '../utils/storage';
import { saveTestimonial, logEvent } from '../utils/db';

export default function SuccessScreen() {
  const navigate = useNavigate();
  const { resumeData, addToast, hasPlan, sessionId } = useApp();
  const [testimonial, setTestimonial] = useState({ name: '', college: '', text: '', stars: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const referralCode = storage.get(KEYS.REFERRAL_CODE) || generateReferralCode();
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      navigate('/preview');
    } finally { setDownloading(false); }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`${appUrl}?ref=${referralCode}`);
    addToast('🎉 Referral link copied!', 'success');
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`I just built my ATS-optimized resume using ResumeAI in 5 minutes! 🚀\nYou can too → ${appUrl}?ref=${referralCode}\nUse my code ${referralCode} for ₹20 off!`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const submitTestimonial = async () => {
    if (!testimonial.text.trim()) { addToast('Please write your experience first', 'warning'); return; }
    await saveTestimonial(sessionId, testimonial);
    logEvent(sessionId, 'testimonial_submitted', { stars: testimonial.stars });
    setSubmitted(true);
    addToast('🙏 Thank you for your feedback!', 'success');
  };

  return (
    <div>
      <Navbar />
      <Confetti trigger={true} />
      <div className="page-content" style={{ padding: '60px 20px 80px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: 640 }}>

          {/* Main success card */}
          <div className="success-card animate-fade-in-up">
            <div className="success-icon">🎉</div>
            <h1 className="headline-lg" style={{ marginBottom: 8 }}>Your Resume is Ready!</h1>
            <p className="body-md text-muted" style={{ marginBottom: 32 }}>
              Congratulations! Your AI-powered resume has been generated.
              You're one step closer to your dream job.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/preview')}>
                ⬇️ Download Resume
              </button>
              {hasPlan('pro') && (
                <button className="btn btn-secondary" onClick={() => navigate('/linkedin')}>
                  🔗 LinkedIn Rewrite
                </button>
              )}
              {hasPlan('premium') && (
                <button className="btn btn-ghost" onClick={() => navigate('/cover-letter')}>
                  📨 Cover Letter
                </button>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
              {[
                { emoji: '⚡', label: 'Generated in', value: '< 30s' },
                { emoji: '🎯', label: 'ATS Optimized', value: '100%' },
                { emoji: '📥', label: 'Ready to', value: 'Download' },
              ].map((s, i) => (
                <div key={i} className="glass-card" style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary)' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Referral Section */}
          <div className="referral-box animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎁</div>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>Share & Both Get ₹20 Off!</h3>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                Share your unique link. Every friend who uses it gets ₹20 off — and so do you next time.
              </p>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div className="label-sm text-muted" style={{ marginBottom: 4 }}>Your Referral Code</div>
              <div className="referral-code">{referralCode}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={shareWhatsApp}>
                📲 Share on WhatsApp
              </button>
              <button className="btn btn-ghost" onClick={copyReferral}>
                🔗 Copy Link
              </button>
            </div>
          </div>

          {/* Instagram CTA */}
          <div className="glass-card" style={{ textAlign: 'center', margin: '24px 0', border: '1px solid rgba(173,102,255,0.3)', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(255,0,119,0.05))' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📸</div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>Follow Us for Resume Tips</h3>
            <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
              Daily tips on how to crack placements, LinkedIn growth, and career advice for freshers.
            </p>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"
              className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
              📸 Follow @resumeai.in
            </a>
          </div>

          {/* Testimonial Form */}
          {!submitted ? (
            <div className="glass-card" style={{ margin: '24px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>💬 Share Your Experience</h3>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>Help other freshers discover ResumeAI</p>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">Your Name</label>
                  <input className="form-input" placeholder="Rahul K." value={testimonial.name}
                    onChange={e => setTestimonial(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label">College</label>
                  <input className="form-input" placeholder="VIT Vellore" value={testimonial.college}
                    onChange={e => setTestimonial(p => ({ ...p, college: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12, justifyContent: 'center' }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
                    filter: n <= testimonial.stars ? 'none' : 'grayscale(1) opacity(0.3)', transition: 'filter 0.15s' }}
                    onClick={() => setTestimonial(p => ({ ...p, stars: n }))}>⭐</button>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Your Review</label>
                <textarea className="form-textarea" placeholder="How did ResumeAI help you? What did you love?" style={{ minHeight: 80 }}
                  value={testimonial.text} onChange={e => setTestimonial(p => ({ ...p, text: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" onClick={submitTestimonial}>Submit Review</button>
            </div>
          ) : (
            <div className="glass-card" style={{ textAlign: 'center', margin: '24px 0', border: '1px solid rgba(78,222,163,0.3)' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🙏</div>
              <h3>Thank you for your review!</h3>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>Your feedback helps us help more students.</p>
            </div>
          )}

          {/* Back to start */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
}
