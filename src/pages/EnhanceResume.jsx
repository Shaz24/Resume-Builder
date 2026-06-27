import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useApp } from '../context/AppContext';
import { enhanceResume } from '../utils/claude';
import { saveResume, logEvent } from '../utils/db';
import { exportToPDF } from '../utils/pdfExport';
import ClassicTemplate from '../components/resume-templates/ClassicTemplate';
import ModernTemplate from '../components/resume-templates/ModernTemplate';
import MinimalTemplate from '../components/resume-templates/MinimalTemplate';
import mammoth from 'mammoth';

const TemplateMap = { Classic: ClassicTemplate, Modern: ModernTemplate, Minimal: MinimalTemplate };
const TEMPLATES = ['Classic', 'Modern', 'Minimal'];

const CYCLING_MESSAGES = [
  'Reading your resume...',
  'Identifying weak sections...',
  'Rewriting with power words...',
  'Adding ATS keywords for your target role...',
  'Calculating your ATS score improvement...',
  'Almost done — polishing the final version...',
];

export default function EnhanceResume() {
  const navigate = useNavigate();
  const { sessionId, credits, deductCredit, setResumeData, setPlan, formData, addToast } = useApp();

  const [step, setStep] = useState(1); // 1 = Upload, 2 = Processing, 3 = Output
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  // Parsing outputs
  const [extractedText, setExtractedText] = useState('');
  
  // AI output states
  const [aiResult, setAiResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('Classic');
  const [downloading, setDownloading] = useState(false);
  const [showReenhanceModal, setShowReenhanceModal] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);
  const [forceWatermark, setForceWatermark] = useState(false);

  // Dynamic PDF.js Loader
  const loadPDFJS = async () => {
    if (window.pdfjsLib) return window.pdfjsLib;
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Cycling message timer
  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(prev => (prev + 1) % CYCLING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [step]);

  // File parsing routers
  const handleFileParse = async (fileToParse) => {
    if (fileToParse.size > 5 * 1024 * 1024) {
      addToast('File is too large! Maximum allowed size is 5MB.', 'error');
      return;
    }

    const extension = fileToParse.name.split('.').pop().toLowerCase();
    
    try {
      if (extension === 'txt') {
        const text = await parseTxt(fileToParse);
        setExtractedText(text);
        addToast('✅ TXT parsed successfully!', 'success');
      } else if (extension === 'docx') {
        const text = await parseDocx(fileToParse);
        setExtractedText(text);
        addToast('✅ DOCX parsed successfully!', 'success');
      } else if (extension === 'pdf') {
        const text = await parsePdf(fileToParse);
        setExtractedText(text);
        addToast('✅ PDF parsed successfully!', 'success');
      } else {
        addToast('Unsupported file type! Upload PDF, DOCX, or TXT.', 'warning');
      }
    } catch (e) {
      addToast("We couldn't read your file. Try copy-pasting your resume text instead.", 'error', 5000);
    }
  };

  const parseTxt = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const parseDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const parsePdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjs = await loadPDFJS();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    
    if (!text.trim()) {
      throw new Error('Scanned PDF or password protected');
    }
    return text;
  };

  const handleStartEnhance = async () => {
    const textToEnhance = extractedText || pastedText;
    if (!textToEnhance.trim()) {
      addToast('Please upload a file or paste your resume text first.', 'warning');
      return;
    }
    if (!targetRole.trim()) {
      addToast('Please enter your target job role.', 'warning');
      return;
    }

    setStep(2); // Go to loader
    try {
      const result = await enhanceResume(textToEnhance, targetRole);
      setAiResult(result);
      
      // Sync generated structure to app state
      const mappedResume = {
        ...result.enhanced_resume,
        fullName: result.enhanced_resume.name || formData?.fullName,
        email: formData?.email || '',
        phone: formData?.phone || '',
      };
      setResumeData(mappedResume);

      // Save to Supabase DB if linked
      await saveResume(sessionId, { type: 'enhance', targetRole }, mappedResume, 'Classic', result.enhanced_ats_score);
      logEvent(sessionId, 'resume_enhanced', { targetRole, improvement: result.enhanced_ats_score - result.original_ats_score });

      setStep(3); // Show results
    } catch (e) {
      addToast(`Enhancement failed: ${e.message}`, 'error', 6000);
      setStep(1);
    }
  };

  // Watermark PDF Download Handler
  const handleDownload = async () => {
    const isFree = credits <= 0 || localStorage.getItem('trialMode') === 'true';
    setDownloading(true);

    try {
      if (isFree && !forceWatermark) {
        setForceWatermark(true);
        await new Promise(r => setTimeout(r, 200));

        await exportToPDF('enhanced-resume-paper', `${aiResult.enhanced_resume.name || 'resume'}_enhanced_watermarked.pdf`);
        addToast('📥 Free watermarked PDF downloaded!', 'success');
        setShowWatermarkModal(true);
        setForceWatermark(false);
      } else {
        const confirmDownload = window.confirm(`Deduct 1 credit to download a clean, watermark-free PDF?`);
        if (!confirmDownload) {
          setDownloading(false);
          return;
        }

        const success = await deductCredit();
        if (success) {
          setForceWatermark(false);
          await new Promise(r => setTimeout(r, 200));

          await exportToPDF('enhanced-resume-paper', `${aiResult.enhanced_resume.name || 'resume'}_enhanced.pdf`);
          addToast('📥 Clean PDF downloaded!', 'success');
          setTimeout(() => navigate('/success'), 1000);
        } else {
          addToast('Out of credits! Please upgrade to download.', 'error');
          navigate('/payment');
        }
      }
    } catch (e) {
      addToast('Download failed. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const copyEnhancedText = () => {
    if (!aiResult) return;
    const { name, summary, skills, experience, projects, education } = aiResult.enhanced_resume;
    const plainText = `${name}\n\nSUMMARY\n${summary}\n\nSKILLS\n${skills.join(', ')}\n\nEXPERIENCE\n${experience.map(e => `${e.role} at ${e.company}\n${e.bullets.join('\n')}`).join('\n\n')}\n\nPROJECTS\n${projects.map(p => `${p.title} (${p.tech})\n${p.description}`).join('\n\n')}`;
    
    navigator.clipboard.writeText(plainText);
    addToast('📋 Enhanced text copied to clipboard!', 'success');
  };

  const TemplateComponent = TemplateMap[selectedTemplate];

  return (
    <div style={{ background: '#0A0A0F', color: '#e5e2e1', minHeight: '100vh', paddingBottom: 80 }}>
      <Navbar />

      <div className="page-content" style={{ paddingTop: 100 }}>
        
        {/* ── STEP 1: UPLOAD SCREEN ── */}
        {step === 1 && (
          <div className="container animate-fade-in-up" style={{ maxWidth: 720 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>🚀 Fast Optimization</div>
              <h1 className="headline-lg">Enhance Your Resume</h1>
              <p className="body-md text-muted" style={{ marginTop: 8 }}>Upload your CV, enter your target role, and let AI optimize it for placements.</p>
            </div>

            <div className="glass-card" style={{ padding: 32, background: 'rgba(19,19,26,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              
              {/* Drag/Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) {
                    setFile(droppedFile);
                    handleFileParse(droppedFile);
                  }
                }}
                onClick={() => document.getElementById('file-upload-input').click()}
                style={{
                  border: isDragOver ? '2px dashed #7c3aed' : '2px dashed rgba(255,255,255,0.15)',
                  background: isDragOver ? 'rgba(124,58,237,0.06)' : 'rgba(0,0,0,0.2)',
                  borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s ease', marginBottom: 20
                }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const selectedFile = e.target.files[0];
                    if (selectedFile) {
                      setFile(selectedFile);
                      handleFileParse(selectedFile);
                    }
                  }}
                />
                <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 6 }}>
                  {file ? file.name : 'Drop your resume here or click to upload'}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Supports PDF, DOCX, TXT (Max 5MB)</div>
              </div>

              {/* Paste Box Alternative */}
              {!file && (
                <div style={{ marginBottom: 24 }}>
                  <div className="label-sm text-muted" style={{ marginBottom: 8 }}>Or paste your resume text directly:</div>
                  <textarea
                    className="form-textarea"
                    rows={12}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the full text of your current CV here..."
                  />
                </div>
              )}

              {/* Target Job Role */}
              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#fff' }}>What job role are you targeting? *</label>
                <input
                  className="form-input"
                  placeholder="e.g. SDE Intern at a product startup / Graduate Engineer Trainee"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button onClick={handleStartEnhance} className="btn btn-primary btn-full btn-lg glow-hover btn-shimmer" style={{ borderRadius: 24, padding: '14px 20px' }}>
                ✨ Enhance My Resume →
              </button>

              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#64748b' }}>
                🔒 Your data is processed securely and is never stored or shared.
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: PROCESSING SCREEN ── */}
        {step === 2 && (
          <div className="container" style={{
            maxWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', textAlign: 'center'
          }}>
            <div className="loading-spinner-ring" style={{ marginBottom: 30 }}></div>
            <h2 style={{ color: '#fff', marginBottom: 12 }}>Optimizing with AI</h2>
            <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 15, minHeight: 24 }}>
              {CYCLING_MESSAGES[loadingMsgIdx]}
            </p>
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', marginTop: 24 }}>
              <div style={{
                height: '100%', width: `${((loadingMsgIdx + 1) / CYCLING_MESSAGES.length) * 100}%`,
                background: 'linear-gradient(90deg, #7c3aed 0%, #4edea3 100%)', borderRadius: 10,
                transition: 'width 0.5s ease'
              }}></div>
            </div>
          </div>
        )}

        {/* ── STEP 3: BEFORE / AFTER SCREEN ── */}
        {step === 3 && aiResult && (
          <div className="container-fluid animate-fade-in-up" style={{ padding: '0 30px' }}>
            
            {/* Header / Score banner */}
            <div className="glass-card" style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center',
              padding: '24px 32px', marginBottom: 30, background: 'rgba(19, 19, 26, 0.8)', border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: 16
            }}>
              <div>
                <h1 style={{ fontSize: 22, color: '#fff', fontWeight: 800, marginBottom: 4 }}>Resume Enhancement Complete! 🚀</h1>
                <p style={{ fontSize: 14, color: '#94a3b8' }}>Review the layout, choose a template, and download your optimized resume.</p>
              </div>

              {/* Scores display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(248, 113, 113, 0.08)', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '10px 16px', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>ORIGINAL ATS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>{aiResult.original_ats_score}/100</div>
                </div>

                <div style={{ background: 'rgba(78, 222, 163, 0.1)', border: '1px solid rgba(78, 222, 163, 0.2)', padding: '10px 16px', borderRadius: 10, textAlign: 'center', position: 'relative' }}>
                  <div style={{ fontSize: 11, color: '#4edea3', fontWeight: 700 }}>ENHANCED ATS</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#4edea3' }}>{aiResult.enhanced_ats_score}/100</div>
                </div>

                <div style={{ background: '#7c3aed', color: '#fff', fontWeight: 800, padding: '8px 12px', borderRadius: 20, fontSize: 13 }}>
                  +{aiResult.enhanced_ats_score - aiResult.original_ats_score} Points Improvement
                </div>
              </div>
            </div>

            {/* Split layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: 24 }}>
              
              {/* Left Column: Original */}
              <div className="glass-card" style={{ height: 500, display: 'flex', flexDirection: 'column', background: 'rgba(19, 19, 26, 0.5)' }}>
                <div style={{ padding: '14px 20px', background: 'rgba(248, 113, 113, 0.1)', borderBottom: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#f87171' }}>🔴 Original Resume Text</span>
                </div>
                <div style={{ padding: 20, overflowY: 'auto', flex: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.6, color: '#94a3b8' }}>
                  {extractedText || pastedText}
                </div>
              </div>

              {/* Middle Column: AI Enhanced Preview */}
              <div className="glass-card" style={{ height: 500, display: 'flex', flexDirection: 'column', background: '#fff', color: '#000', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', background: 'rgba(78, 222, 163, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', color: '#1a1a1a' }}>
                  <span style={{ fontWeight: 700, color: '#007650' }}>🟢 Enhanced Resume Preview</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {TEMPLATES.map(t => (
                      <button key={t} onClick={() => setSelectedTemplate(t)} style={{
                        background: selectedTemplate === t ? '#7c3aed' : 'rgba(0,0,0,0.05)',
                        color: selectedTemplate === t ? '#fff' : '#000', border: 'none', borderRadius: 4,
                        padding: '2px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 600
                      }}>{t}</button>
                    ))}
                  </div>
                </div>
                
                {/* Paper PDF content */}
                <div style={{ overflowY: 'auto', flex: 1 }} className="watermark-container">
                  {(credits <= 0 || forceWatermark) && (
                    <div className="watermark-overlay">
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <span key={idx} className="watermark-text" style={{ padding: 60 }}>ResumeAI — Upgrade to Remove Watermark</span>
                      ))}
                    </div>
                  )}
                  <div id="enhanced-resume-paper">
                    <TemplateComponent data={{
                      ...aiResult.enhanced_resume,
                      fullName: aiResult.enhanced_resume.name,
                      email: formData?.email || 'email@example.com',
                      phone: formData?.phone || '+91 9999999999',
                    }} editable={false} />
                  </div>
                </div>
              </div>

              {/* Right Column: Changes Sidebar */}
              <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', background: 'rgba(19, 19, 26, 0.6)' }}>
                <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6 }}>📋 Optimizations Made</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                  {aiResult.changes_made.map((ch, i) => (
                    <li key={i} style={{ color: '#e2e8f0', display: 'flex', gap: 6, lineHeight: 1.4 }}>
                      <span style={{ color: '#4edea3' }}>✅</span>
                      <span>{ch}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 30, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleDownload} disabled={downloading} className="btn btn-primary glow-hover btn-shimmer" style={{ padding: '12px 28px' }}>
                  {downloading ? 'Exporting...' : (credits <= 0 ? '⬇️ Download Watermarked PDF' : '⬇️ Download Clean PDF (1 Credit)')}
                </button>
                <button onClick={copyEnhancedText} className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                  📋 Copy Enhanced Text
                </button>
              </div>

              <button onClick={() => setShowReenhanceModal(true)} className="btn btn-ghost" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                🔄 Re-enhance with different focus
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ── MODAL: RE-ENHANCE DIALOG ── */}
      {showReenhanceModal && (
        <div className="watermark-dialog">
          <div className="watermark-dialog-card" style={{ maxWidth: 460 }}>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 16 }}>Re-optimize Resume</h3>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
              <label className="form-label">New Target Role</label>
              <input
                className="form-input"
                placeholder="e.g. Backend SDE or Product Analyst"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowReenhanceModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { setShowReenhanceModal(false); handleStartEnhance(); }}>
                Optimize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: WATERMARK UPSELL DIALOG ── */}
      {showWatermarkModal && (
        <div className="watermark-dialog">
          <div className="watermark-dialog-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 12 }}>Your resume is optimized!</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
              This free version has a watermark. Upgrade to Starter or Value Pack to download a clean, professional PDF recruiters will actually read.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn btn-primary glow-hover btn-shimmer" onClick={() => navigate('/payment')} style={{ padding: '12px 24px' }}>
                Remove Watermark — ₹199
              </button>
              <button className="btn btn-ghost" onClick={() => setShowWatermarkModal(false)} style={{ color: '#64748b', fontSize: 13.5 }}>
                Keep free version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
