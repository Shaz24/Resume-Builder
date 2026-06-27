import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ATSBadge from '../components/ATSBadge';
import ClassicTemplate from '../components/resume-templates/ClassicTemplate';
import ModernTemplate from '../components/resume-templates/ModernTemplate';
import MinimalTemplate from '../components/resume-templates/MinimalTemplate';
import { useApp } from '../context/AppContext';
import { exportToPDF } from '../utils/pdfExport';
import { saveResume, updateResumeTemplate, logEvent } from '../utils/db';
import { calculateATSScore } from '../utils/atsScore';

const TEMPLATES = ['Classic', 'Modern', 'Minimal'];
const TemplateMap = { Classic: ClassicTemplate, Modern: ModernTemplate, Minimal: MinimalTemplate };

export default function ResumePreview() {
  const navigate = useNavigate();
  const { resumeData, setResumeData, formData, sessionId, plan, hasPlan, addToast } = useApp();
  const [template, setTemplate] = useState('Classic');
  const [downloading, setDownloading] = useState(false);
  const [editable, setEditable] = useState(false);

  const TemplateComponent = TemplateMap[template];
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;

  if (!resumeData) {
    return (
      <div>
        <Navbar />
        <div className="page-content" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2 style={{ marginBottom: 16 }}>No resume found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/form')}>← Go Back to Form</button>
        </div>
      </div>
    );
  }

  const handleEdit = async (field, value) => {
    const updated = { ...resumeData, [field]: value };
    setResumeData(updated);
    const { score } = calculateATSScore(updated);
    await saveResume(sessionId, formData, updated, template, score);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportToPDF('resume-paper', `${resumeData.fullName || 'resume'}_resume.pdf`);
      addToast('📥 Resume downloaded successfully!', 'success');
      setTimeout(() => navigate('/success'), 1000);
    } catch (e) {
      addToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Check out my AI-built resume! 🚀 Built at ${appUrl} — get yours in 5 minutes!`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    addToast('📋 Link copied to clipboard!', 'success');
  };

  return (
    <div>
      <Navbar />
      <div className="page-content" style={{ padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 900 }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            <div>
              <h1 className="headline-lg" style={{ marginBottom: 4 }}>Your Resume is Ready! 🎉</h1>
              <p className="body-md text-muted">Switch templates, edit inline, then download.</p>
            </div>
            <ATSBadge resumeData={resumeData} />
          </div>

          {/* Template Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <span className="label-sm text-muted">Template:</span>
            <div className="template-tabs">
              {TEMPLATES.map(t => (
                <button key={t} className={`template-tab ${template === t ? 'active' : ''}`} onClick={() => {
                  setTemplate(t);
                  updateResumeTemplate(sessionId, t);
                  logEvent(sessionId, 'template_changed', { template: t });
                }}>{t}</button>
              ))}
            </div>
            <button
              className={`btn btn-sm ${editable ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setEditable(!editable); addToast(editable ? 'Edit mode OFF' : '✏️ Click any text to edit', 'info', 2000); }}
            >
              {editable ? '💾 Done Editing' : '✏️ Edit Inline'}
            </button>
          </div>

          {/* Resume Preview */}
          <div className="resume-preview-wrap" style={{ marginBottom: 24 }}>
            <div id="resume-paper">
              <TemplateComponent data={resumeData} editable={editable} onEdit={handleEdit} />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            <button className="btn btn-primary btn-lg" onClick={handleDownload} disabled={downloading} style={{ flex: 1, minWidth: 200 }}>
              {downloading ? <><div className="spinner" style={{ width: 20, height: 20 }}></div> Downloading...</> : '⬇️ Download PDF'}
            </button>
            <button className="btn btn-ghost" onClick={handleWhatsApp} title="Share on WhatsApp">
              📲 Share on WhatsApp
            </button>
            <button className="btn btn-ghost" onClick={handleCopyLink} title="Copy link">
              🔗 Copy Link
            </button>
          </div>

          {/* Next Steps / Upsell */}
          {hasPlan('pro') ? (
            <div className="glass-card" style={{ border: '1px solid rgba(78,222,163,0.3)', background: 'rgba(78,222,163,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>🚀 Next: LinkedIn Profile Rewrite</div>
                  <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                    {hasPlan('premium') ? 'Pro + Premium: LinkedIn & Cover Letter unlocked' : 'Pro plan: LinkedIn rewrite included'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" onClick={() => navigate('/linkedin')}>
                    Rewrite LinkedIn →
                  </button>
                  {hasPlan('premium') && (
                    <button className="btn btn-secondary" onClick={() => navigate('/cover-letter')}>
                      Cover Letter →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="upsell-banner">
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>🚀 Unlock LinkedIn Rewrite + Cover Letter</div>
                <div style={{ fontSize: 14, color: 'var(--color-on-surface-variant)' }}>
                  Upgrade to Pro (₹199) or Premium (₹349) to maximize your chances.
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/payment')}>
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
