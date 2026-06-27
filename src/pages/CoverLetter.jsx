import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { generateCoverLetter } from '../utils/claude';
import { exportToPDF } from '../utils/pdfExport';

export default function CoverLetter() {
  const navigate = useNavigate();
  const { resumeData, coverLetter, setCoverLetter, hasPlan, formData, showLoading, hideLoading, addToast } = useApp();
  const [jobDesc, setJobDesc] = useState('');
  const [company, setCompany] = useState('');
  const [generated, setGenerated] = useState(coverLetter?.coverLetter || '');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [downloading, setDownloading] = useState(false);

  if (!hasPlan('premium')) {
    return (
      <div><Navbar />
        <div className="page-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2>👑 Premium Plan Required</h2>
          <p className="text-muted" style={{ margin: '16px 0' }}>Upgrade to Premium (₹349) to generate tailored cover letters.</p>
          <button className="btn btn-primary" onClick={() => navigate('/payment')}>Upgrade to Premium →</button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!jobDesc.trim()) { addToast('Please paste the job description first', 'warning'); return; }
    showLoading('Writing your cover letter...');
    try {
      const result = await generateCoverLetter(resumeData, jobDesc, company || 'the company', formData?.targetRole || 'Software Engineer');
      setGenerated(result.coverLetter);
      setCoverLetter(result);
      hideLoading();
      addToast('📝 Cover letter generated!', 'success');
      setEditContent(result.coverLetter);
    } catch (e) {
      hideLoading();
      addToast(`Error: ${e.message}`, 'error', 6000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editing ? editContent : generated);
    addToast('📋 Copied to clipboard!', 'success', 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportToPDF('cover-letter-pdf', `${resumeData?.fullName || 'cover'}_letter.pdf`);
      addToast('📥 Cover letter downloaded!', 'success');
    } catch { addToast('Download failed', 'error'); }
    finally { setDownloading(false); }
  };

  const wordCount = (editing ? editContent : generated).split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <Navbar />
      <div className="page-content" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 800 }}>

          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/linkedin')} style={{ marginBottom: 20 }}>← Back</button>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1 className="headline-lg">Cover Letter Generator 📨</h1>
              <span className="badge badge-primary">👑 Premium</span>
            </div>
            <p className="body-md text-muted">Tailored to the job description. Under 250 words. Confident and concise.</p>
          </div>

          {/* Input Section */}
          <div className="glass-card" style={{ marginBottom: 24 }}>
            <div className="form-section-title">📋 Job Details</div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Company Name</label>
              <input className="form-input" placeholder="Google / Infosys / Any Company"
                value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Paste Job Description *</label>
              <textarea className="form-textarea" style={{ minHeight: 140 }}
                placeholder="Paste the full job description here. The AI will tailor your cover letter to it..."
                value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={handleGenerate}>
              ✨ Generate Cover Letter
            </button>
          </div>

          {/* Generated Output */}
          {generated && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div className="label-sm text-muted">GENERATED COVER LETTER</div>
                  <div style={{ fontSize: 13, color: 'var(--color-tertiary)', marginTop: 2 }}>{wordCount} words</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(!editing); setEditContent(generated); }}>
                    {editing ? '💾 Save' : '✏️ Edit'}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={handleCopy}>📋 Copy</button>
                  <button className="btn btn-secondary btn-sm" onClick={handleDownload} disabled={downloading}>
                    {downloading ? '...' : '⬇️ PDF'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleGenerate}>🔄 Regenerate</button>
                </div>
              </div>

              {editing ? (
                <textarea className="form-textarea" style={{ minHeight: 300, fontSize: 15, lineHeight: 1.7 }}
                  value={editContent} onChange={e => setEditContent(e.target.value)} />
              ) : (
                <div id="cover-letter-pdf" style={{
                  background: '#fff', color: '#1a1a1a', padding: '32px',
                  borderRadius: 8, fontSize: 15, lineHeight: 1.8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'pre-wrap'
                }}>
                  {generated}
                </div>
              )}

              {coverLetter?.highlights?.length > 0 && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(78,222,163,0.06)', borderRadius: 8, border: '1px solid rgba(78,222,163,0.2)' }}>
                  <div className="label-sm" style={{ color: 'var(--color-tertiary)', marginBottom: 8 }}>✅ KEY POINTS EMPHASIZED</div>
                  {coverLetter.highlights.map((h, i) => <div key={i} style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>• {h}</div>)}
                </div>
              )}

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/success')}>
                  🎉 All Done! View Success Screen →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
