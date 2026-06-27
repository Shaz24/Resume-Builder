import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { rewriteLinkedIn } from '../utils/claude';

export default function LinkedInRewriter() {
  const navigate = useNavigate();
  const { resumeData, linkedInData, setLinkedInData, hasPlan, formData, showLoading, hideLoading, addToast } = useApp();
  const [currentLinkedIn, setCurrentLinkedIn] = useState({ headline: '', about: '', experience: '' });
  const [generated, setGenerated] = useState(linkedInData);
  const [view, setView] = useState('after'); // 'before' | 'after'

  // Guard
  if (!hasPlan('pro')) {
    return (
      <div><Navbar />
        <div className="page-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2>🔒 Pro Plan Required</h2>
          <p className="text-muted" style={{ margin: '16px 0' }}>Upgrade to Pro or Premium to access LinkedIn Rewrite.</p>
          <button className="btn btn-primary" onClick={() => navigate('/payment')}>Upgrade Now →</button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    showLoading('Rewriting your LinkedIn profile...');
    try {
      const result = await rewriteLinkedIn(resumeData, formData?.targetRole || 'Software Engineer');
      setGenerated(result);
      setLinkedInData(result);
      hideLoading();
      addToast('✅ LinkedIn profile rewritten!', 'success');
      setView('after');
    } catch (e) {
      hideLoading();
      addToast(`Error: ${e.message}`, 'error', 6000);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`📋 ${label} copied!`, 'success', 2000);
  };

  return (
    <div>
      <Navbar />
      <div className="page-content" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 900 }}>

          <div style={{ marginBottom: 32 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/preview')} style={{ marginBottom: 16 }}>← Back to Resume</button>
            <h1 className="headline-lg" style={{ marginBottom: 6 }}>LinkedIn Profile Rewrite 🔗</h1>
            <p className="body-md text-muted">AI rewrites your headline, About section, and experience to attract more recruiters.</p>
          </div>

          {/* Current LinkedIn Input */}
          {!generated && (
            <div className="glass-card" style={{ marginBottom: 24 }}>
              <div className="form-section-title">📝 Your Current LinkedIn (optional)</div>
              <p style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 16 }}>
                Paste your existing LinkedIn content below, or leave blank — we'll create one from your resume.
              </p>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Current Headline</label>
                <input className="form-input" placeholder="e.g. B.Tech CSE Student | Aspiring SDE"
                  value={currentLinkedIn.headline} onChange={e => setCurrentLinkedIn(p => ({ ...p, headline: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Current About Section</label>
                <textarea className="form-textarea" style={{ minHeight: 100 }} placeholder="Paste your current About section..."
                  value={currentLinkedIn.about} onChange={e => setCurrentLinkedIn(p => ({ ...p, about: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }} onClick={handleGenerate}>
                ✨ Rewrite with AI
              </button>
            </div>
          )}

          {/* Generated Output */}
          {generated && (
            <>
              {/* Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="template-tabs">
                  <button className={`template-tab ${view === 'before' ? 'active' : ''}`} onClick={() => setView('before')}>Before</button>
                  <button className={`template-tab ${view === 'after' ? 'active' : ''}`} onClick={() => setView('after')}>After (AI)</button>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleGenerate}>🔄 Regenerate</button>
              </div>

              {/* Headline */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div className="label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>HEADLINE</div>
                    <p style={{ fontSize: 16, fontWeight: 600 }}>
                      {view === 'after' ? generated.headline : (currentLinkedIn.headline || 'No previous headline entered')}
                    </p>
                  </div>
                  {view === 'after' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(generated.headline, 'Headline')}>📋 Copy</button>
                  )}
                </div>
                {view === 'after' && generated.annotations?.headline && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(78,222,163,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--color-tertiary)', border: '1px solid rgba(78,222,163,0.2)' }}>
                    💡 {generated.annotations.headline}
                  </div>
                )}
              </div>

              {/* About */}
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <div className="label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>ABOUT SECTION</div>
                  {view === 'after' && (
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(generated.about, 'About section')}>📋 Copy</button>
                  )}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-on-surface)', whiteSpace: 'pre-wrap' }}>
                  {view === 'after' ? generated.about : (currentLinkedIn.about || 'No previous About entered')}
                </p>
                {view === 'after' && generated.annotations?.about && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(78,222,163,0.08)', borderRadius: 8, fontSize: 13, color: 'var(--color-tertiary)', border: '1px solid rgba(78,222,163,0.2)' }}>
                    💡 {generated.annotations.about}
                  </div>
                )}
              </div>

              {/* Experience bullets */}
              {generated.experience?.length > 0 && view === 'after' && (
                <div className="glass-card" style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div className="label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>EXPERIENCE BULLETS</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => copyToClipboard(
                      generated.experience.map(e => `${e.role} @ ${e.company}\n${e.bullets?.join('\n')}`).join('\n\n'), 'Experience')}>
                      📋 Copy All
                    </button>
                  </div>
                  {generated.experience.map((exp, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{exp.role} — {exp.company}</div>
                      {exp.bullets?.map((b, j) => <div key={j} style={{ fontSize: 14, color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>• {b}</div>)}
                    </div>
                  ))}
                </div>
              )}

              {/* Keywords */}
              {generated.annotations?.keywords?.length > 0 && view === 'after' && (
                <div className="glass-card">
                  <div className="label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 10 }}>KEY TERMS ADDED FOR ATS</div>
                  <div className="skill-chips-wrap">
                    {generated.annotations.keywords.map((k, i) => <span key={i} className="skill-chip">{k}</span>)}
                  </div>
                </div>
              )}

              {/* Next for Premium */}
              {hasPlan('premium') && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/cover-letter')}>
                    Next: Generate Cover Letter →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
