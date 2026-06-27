import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import { SkillInput } from '../components/SkillChip';
import { useApp } from '../context/AppContext';
import { generateResume } from '../utils/claude';
import { saveResume, logEvent } from '../utils/db';
import { calculateATSScore } from '../utils/atsScore';

const STEP_LABELS = ['Personal Info', 'Education & Skills', 'Experience & Projects'];

export default function IntakeForm() {
  const navigate = useNavigate();
  const { formData, setFormData, setResumeData, sessionId, isPaid, showLoading, hideLoading, addToast } = useApp();
  const [step, setStep] = useState(0);
  const autosaveRef = useRef(null);

  // Autosave every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      addToast('Progress auto-saved', 'info', 1500);
    }, 30000);
    return () => clearInterval(autosaveRef.current);
  }, []);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // Projects helpers
  const updateProject = (i, field, val) => {
    const projects = [...(formData.projects || [])];
    projects[i] = { ...projects[i], [field]: val };
    update('projects', projects);
  };
  const addProject = () => {
    if ((formData.projects || []).length < 4)
      update('projects', [...(formData.projects || []), { title: '', description: '', techStack: '', liveLink: '' }]);
  };
  const removeProject = (i) => update('projects', formData.projects.filter((_, idx) => idx !== i));

  // Internships helpers
  const updateInternship = (i, field, val) => {
    const internships = [...(formData.internships || [])];
    internships[i] = { ...internships[i], [field]: val };
    update('internships', internships);
  };
  const addInternship = () => {
    if ((formData.internships || []).length < 2)
      update('internships', [...(formData.internships || []), { company: '', role: '', duration: '', achievements: '' }]);
  };
  const removeInternship = (i) => update('internships', formData.internships.filter((_, idx) => idx !== i));

  // Certifications
  const [certInput, setCertInput] = React.useState('');
  const addCert = () => {
    if (certInput.trim()) {
      update('certifications', [...(formData.certifications || []), certInput.trim()]);
      setCertInput('');
    }
  };

  const handleSubmit = async () => {
    showLoading('Crafting your career story...');
    try {
      const result = await generateResume({
        ...formData,
        skills: formData.skills || [],
      });
      // Merge form data (contact info) with AI output
      const merged = {
        ...result,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        targetRole: formData.targetRole,
      };
      setResumeData(merged);

      // Save to Supabase
      const { score } = calculateATSScore(merged);
      await saveResume(sessionId, formData, merged, 'Classic', score);
      logEvent(sessionId, 'resume_generated', { targetRole: formData.targetRole, atsScore: score });

      hideLoading();
      addToast('🎉 Resume generated successfully!', 'success');
      navigate('/preview');
    } catch (e) {
      hideLoading();
      addToast(`AI Error: ${e.message}. Please try again.`, 'error', 6000);
    }
  };

  const inp = (label, field, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} placeholder={placeholder}
        value={formData[field] || ''} onChange={e => update(field, e.target.value)} />
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="page-content" style={{ minHeight: '100vh', padding: '40px 0 80px' }}>
        <div className="container" style={{ maxWidth: 680 }}>

          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 className="headline-lg" style={{ marginBottom: 8 }}>Tell Us About Yourself</h1>
            <p className="body-md text-muted">Our AI will craft your resume from these details</p>
          </div>

          <ProgressBar step={step} totalSteps={3} labels={STEP_LABELS} />

          {/* ── Step 0: Personal Info ── */}
          {step === 0 && (
            <div className="animate-fade-in-up">
              <div className="form-section-card">
                <div className="form-section-title">👤 Personal Information</div>
                <div className="grid-2">
                  {inp('Full Name', 'fullName', 'text', 'Rahul Kumar')}
                  {inp('Email', 'email', 'email', 'rahul@gmail.com')}
                  {inp('Phone', 'phone', 'tel', '+91 9876543210')}
                  {inp('Target Job Role', 'targetRole', 'text', 'Software Engineer / Data Analyst')}
                </div>
                <div className="grid-2" style={{ marginTop: 'var(--space-sm)' }}>
                  {inp('LinkedIn URL', 'linkedinUrl', 'url', 'linkedin.com/in/yourname')}
                  {inp('GitHub URL', 'githubUrl', 'url', 'github.com/yourname')}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Education & Skills ── */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="form-section-card">
                <div className="form-section-title">🎓 Education</div>
                <div className="grid-2">
                  {inp('College Name', 'college', 'text', 'VIT Vellore')}
                  {inp('Degree', 'degree', 'text', 'B.Tech')}
                  {inp('Branch / Specialization', 'branch', 'text', 'Computer Science')}
                  {inp('Year of Graduation', 'graduationYear', 'text', '2025')}
                </div>
                {inp('CGPA / Percentage', 'cgpa', 'text', '8.5 / 10')}
              </div>

              <div className="form-section-card">
                <div className="form-section-title">💡 Technical Skills</div>
                <SkillInput skills={formData.skills || []} onChange={v => update('skills', v)} />
              </div>

              <div className="form-section-card">
                <div className="form-section-title">🏅 Certifications</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input className="form-input" placeholder="e.g. AWS Cloud Practitioner" value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCert()} style={{ flex: 1 }} />
                  <button className="btn btn-secondary btn-sm" type="button" onClick={addCert}>Add</button>
                </div>
                <div className="skill-chips-wrap">
                  {(formData.certifications || []).map((c, i) => (
                    <span key={i} className="skill-chip">
                      {c}
                      <button className="skill-chip-remove" onClick={() => update('certifications', formData.certifications.filter((_, j) => j !== i))}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Projects & Experience ── */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              {/* Projects */}
              <div className="form-section-card">
                <div className="form-section-title" style={{ justifyContent: 'space-between' }}>
                  <span>🔧 Projects (up to 4)</span>
                  {(formData.projects || []).length < 4 && (
                    <button className="btn btn-secondary btn-sm" onClick={addProject} type="button">+ Add Project</button>
                  )}
                </div>
                {(formData.projects || []).map((proj, i) => (
                  <div key={i} style={{ marginBottom: 20, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>Project {i + 1}</span>
                      {i > 0 && <button className="btn btn-ghost btn-sm" onClick={() => removeProject(i)} style={{ padding: '4px 10px', fontSize: 12 }}>Remove</button>}
                    </div>
                    <div className="grid-2" style={{ marginBottom: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input className="form-input" value={proj.title} onChange={e => updateProject(i, 'title', e.target.value)} placeholder="Portfolio Website" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Live Link (optional)</label>
                        <input className="form-input" value={proj.liveLink} onChange={e => updateProject(i, 'liveLink', e.target.value)} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Tech Stack</label>
                      <input className="form-input" value={proj.techStack} onChange={e => updateProject(i, 'techStack', e.target.value)} placeholder="React, Node.js, MongoDB" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} placeholder="Describe what you built, the problem it solves, and your impact..." style={{ minHeight: 80 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Internships */}
              <div className="form-section-card">
                <div className="form-section-title" style={{ justifyContent: 'space-between' }}>
                  <span>💼 Internships (optional, up to 2)</span>
                  {(formData.internships || []).length < 2 && (
                    <button className="btn btn-secondary btn-sm" onClick={addInternship} type="button">+ Add</button>
                  )}
                </div>
                {(formData.internships || []).map((intern, i) => (
                  <div key={i} style={{ marginBottom: 16, padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-secondary)' }}>Internship {i + 1}</span>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeInternship(i)} style={{ padding: '4px 10px', fontSize: 12 }}>Remove</button>
                    </div>
                    <div className="grid-2" style={{ marginBottom: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input className="form-input" value={intern.company} onChange={e => updateInternship(i, 'company', e.target.value)} placeholder="Infosys / TCS / Startup" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <input className="form-input" value={intern.role} onChange={e => updateInternship(i, 'role', e.target.value)} placeholder="Software Intern" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 12 }}>
                      <label className="form-label">Duration</label>
                      <input className="form-input" value={intern.duration} onChange={e => updateInternship(i, 'duration', e.target.value)} placeholder="May 2024 – Jul 2024" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Key Work Done</label>
                      <textarea className="form-textarea" value={intern.achievements} onChange={e => updateInternship(i, 'achievements', e.target.value)} placeholder="Describe your responsibilities and impact..." style={{ minHeight: 80 }} />
                    </div>
                  </div>
                ))}
                {(formData.internships || []).length === 0 && (
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No internships? No problem! Strong projects speak louder.</p>
                )}
              </div>

              {/* Achievements */}
              <div className="form-section-card">
                <div className="form-section-title">🏆 Achievements</div>
                <div className="form-group">
                  <label className="form-label">List your achievements (one per line)</label>
                  <textarea className="form-textarea" value={formData.achievements || ''} onChange={e => update('achievements', e.target.value)}
                    placeholder="Secured AIR 1234 in GATE 2024&#10;Won Smart India Hackathon 2024&#10;Published paper at IEEE conference" style={{ minHeight: 100 }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32, gap: 12 }}>
            {step > 0
              ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>← Back</button>
              : <div />
            }
            {step < 2
              ? <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Continue →</button>
              : <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                  ✨ Generate My Resume
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
