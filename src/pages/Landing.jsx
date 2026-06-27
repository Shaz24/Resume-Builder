import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FAQAccordion from '../components/FAQAccordion';
import TestimonialTicker from '../components/TestimonialTicker';
import { PLANS } from '../utils/razorpay';
import { useApp } from '../context/AppContext';

// Simple typewriter strings
const TYPE_STRINGS = ['The Perfect Resume.', 'An ATS-Ready CV.', 'A Job-Winning Profile.'];

export default function Landing() {
  const navigate = useNavigate();
  const { setPlan } = useApp();

  // Typewriter effect state
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const fullText = TYPE_STRINGS[typewriterIndex];

    const type = () => {
      if (!isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length + 1));
        if (currentText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), 1500); // Wait before delete
        } else {
          timer = setTimeout(type, 100);
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setTypewriterIndex((prev) => (prev + 1) % TYPE_STRINGS.length);
        } else {
          timer = setTimeout(type, 50);
        }
      }
    };

    timer = setTimeout(type, isDeleting ? 50 : 150);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, typewriterIndex]);

  const choosePlan = (planId) => {
    setPlan(planId);
    navigate('/payment');
  };

  const handleFreeTrial = () => {
    setPlan('free_trial'); // Trial mode
    navigate('/form');
  };

  return (
    <div style={{ background: '#0A0A0F', color: '#e5e2e1', overflowX: 'hidden' }}>
      <Navbar />

      <div className="page-content" style={{ paddingTop: 80 }}>
        
        {/* ── SECTION 2: HERO SECTION ── */}
        <section style={{
          minHeight: '90vh', position: 'relative', display: 'flex', alignItems: 'center',
          background: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.15), transparent 50%), radial-gradient(circle at 90% 80%, rgba(5, 102, 217, 0.12), transparent 50%)',
          padding: '80px 0 60px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div className="container" style={{
            display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 40, alignItems: 'center'
          }}>
            {/* Left side content */}
            <div style={{ zIndex: 2 }}>
              <div className="pill-badge" style={{ marginBottom: 20 }}>
                <span>✨</span> AI-Powered • ATS-Optimized • Made for India
              </div>
              
              <h1 className="display-lg" style={{ marginBottom: 20, lineHeight: 1.15, fontSize: 'clamp(2.5rem, 5vw, 3.8rem)' }}>
                Your Dream Job Starts With <br />
                <span className="text-gradient" style={{ display: 'inline-block', minHeight: '60px' }}>
                  {currentText}
                  <span className="typewriter-cursor">|</span>
                </span>
              </h1>

              <p className="body-lg" style={{ color: '#94a3b8', marginBottom: 36, maxWidth: 540, fontSize: 18, lineHeight: 1.6 }}>
                Build an ATS-optimized, recruiter-ready resume in 5 minutes with Claude AI. Try free — no credit card or signup required.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 40 }}>
                <button onClick={handleFreeTrial} className="btn btn-primary btn-lg glow-hover btn-shimmer" style={{ padding: '16px 36px', borderRadius: 28 }}>
                  🚀 Try for Free
                </button>
                <button onClick={() => document.getElementById('templates').scrollIntoView({ behavior: 'smooth' })} 
                  className="btn btn-secondary btn-lg" style={{ padding: '16px 36px', borderRadius: 28, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  See Templates →
                </button>
              </div>

              {/* Trust signals */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: '🔒', text: 'No signup' },
                  { icon: '⚡', text: '5 min build' },
                  { icon: '🎯', text: 'ATS-optimized' },
                  { icon: '🇮🇳', text: 'Designed for India' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#94a3b8', fontWeight: 500 }}>
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: floating CSS resume mockup */}
            <div className="floating-card" style={{ display: 'flex', justifyContent: 'center', zIndex: 1 }}>
              <div style={{
                width: '100%', maxWidth: 360, height: 460, background: '#fff', borderRadius: 12,
                boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 50px rgba(124,58,237,0.25)',
                padding: '24px 20px', color: '#1a1a1a', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden'
              }}>
                {/* Mock header */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid #7c3aed', paddingBottom: 10 }}>
                  <div style={{ width: 140, height: 16, background: '#1a1a1a', borderRadius: 3, margin: '0 auto 6px' }}></div>
                  <div style={{ width: 80, height: 10, background: '#7c3aed', borderRadius: 2, margin: '0 auto 8px' }}></div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <div style={{ width: 50, height: 6, background: '#888', borderRadius: 1 }}></div>
                    <div style={{ width: 60, height: 6, background: '#888', borderRadius: 1 }}></div>
                  </div>
                </div>
                {/* Mock summary */}
                <div>
                  <div style={{ width: 100, height: 10, background: '#7c3aed', borderRadius: 2, marginBottom: 8 }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ width: '100%', height: 6, background: '#ddd', borderRadius: 1 }}></div>
                    <div style={{ width: '90%', height: 6, background: '#ddd', borderRadius: 1 }}></div>
                  </div>
                </div>
                {/* Mock Education */}
                <div>
                  <div style={{ width: 80, height: 10, background: '#7c3aed', borderRadius: 2, marginBottom: 8 }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ width: 110, height: 8, background: '#1a1a1a', borderRadius: 2 }}></div>
                    <div style={{ width: 40, height: 8, background: '#888', borderRadius: 2 }}></div>
                  </div>
                  <div style={{ width: 160, height: 6, background: '#ddd', borderRadius: 1 }}></div>
                </div>
                {/* Mock Projects */}
                <div>
                  <div style={{ width: 70, height: 10, background: '#7c3aed', borderRadius: 2, marginBottom: 8 }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                    <div style={{ width: 120, height: 8, background: '#1a1a1a', borderRadius: 2 }}></div>
                    <div style={{ width: '100%', height: 6, background: '#ddd', borderRadius: 1 }}></div>
                    <div style={{ width: '95%', height: 6, background: '#ddd', borderRadius: 1 }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ width: 100, height: 8, background: '#1a1a1a', borderRadius: 2 }}></div>
                    <div style={{ width: '98%', height: 6, background: '#ddd', borderRadius: 1 }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 3: CHOOSE YOUR STYLE (Templates) ── */}
        <section id="templates" className="section-breathing" style={{ background: '#0E0E12' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>🎨 Curated Designs</div>
              <h2 className="headline-lg">Choose Your Style</h2>
              <div style={{ width: 60, height: 3, background: '#7c3aed', margin: '12px auto 0', borderRadius: 2 }}></div>
              <p className="body-md text-muted" style={{ marginTop: 12 }}>ATS-tested templates to unlock recruiter shortlists</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30 }}>
              
              {/* Classic Card */}
              <div className="glass-card glow-hover" style={{ padding: 24, background: 'rgba(25, 25, 35, 0.5)' }}>
                <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#d2bbff', marginBottom: 16 }}>Classic</span>
                {/* CSS Resume Mini-Preview */}
                <div style={{ height: 160, background: '#fff', borderRadius: 6, padding: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ textAlign: 'center', borderBottom: '1px solid #7c3aed', paddingBottom: 4 }}>
                    <div style={{ width: 60, height: 8, background: '#000', margin: '0 auto 2px' }}></div>
                    <div style={{ width: 40, height: 4, background: '#888', margin: '0 auto' }}></div>
                  </div>
                  <div style={{ width: 35, height: 5, background: '#7c3aed' }}></div>
                  <div style={{ width: '100%', height: 3, background: '#eee' }}></div>
                  <div style={{ width: '90%', height: 3, background: '#eee' }}></div>
                  <div style={{ width: 40, height: 5, background: '#7c3aed' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 50, height: 4, background: '#000' }}></div>
                    <div style={{ width: 20, height: 4, background: '#888' }}></div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Classic Corporate</h3>
                <p className="body-md text-muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>Traditional single-column layout. Clean and clean-cut — preferred by financial & tech companies.</p>
              </div>

              {/* Modern Card (MOST POPULAR) */}
              <div className="glass-card glow-hover" style={{
                padding: 24, background: 'rgba(25, 25, 35, 0.5)', border: '1px solid rgba(124, 58, 237, 0.3)', position: 'relative'
              }}>
                <span className="badge" style={{ background: '#7c3aed', color: '#fff', position: 'absolute', top: 12, right: 12 }}>Most Popular</span>
                <span className="badge" style={{ background: 'rgba(5, 102, 217, 0.1)', color: '#adc6ff', marginBottom: 16 }}>Modern</span>
                {/* CSS Resume Mini-Preview */}
                <div style={{ height: 160, background: '#fff', borderRadius: 6, marginBottom: 16, display: 'flex' }}>
                  <div style={{ width: '35%', background: '#1e1b4b', borderRadius: '6px 0 0 6px', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 30, height: 6, background: '#fff' }}></div>
                    <div style={{ width: 40, height: 3, background: '#a78bfa' }}></div>
                    <div style={{ width: 40, height: 3, background: '#a78bfa' }}></div>
                  </div>
                  <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ width: 50, height: 6, background: '#7c3aed' }}></div>
                    <div style={{ width: '100%', height: 3, background: '#eee' }}></div>
                    <div style={{ width: '90%', height: 3, background: '#eee' }}></div>
                    <div style={{ width: '95%', height: 3, background: '#eee' }}></div>
                  </div>
                </div>
                <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Modern Creative</h3>
                <p className="body-md text-muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>Two-column design with a distinct visual identity. Highlights skills and contact details efficiently.</p>
              </div>

              {/* Minimal Card */}
              <div className="glass-card glow-hover" style={{ padding: 24, background: 'rgba(25, 25, 35, 0.5)' }}>
                <span className="badge" style={{ background: 'rgba(78, 222, 163, 0.1)', color: '#4edea3', marginBottom: 16 }}>Minimal</span>
                {/* CSS Resume Mini-Preview */}
                <div style={{ height: 160, background: '#fff', borderRadius: 6, padding: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ width: 50, height: 8, background: '#000' }}></div>
                    <div style={{ width: 40, height: 3, background: '#888', marginTop: 2 }}></div>
                  </div>
                  <div>
                    <div style={{ width: '100%', height: 3, background: '#eee' }}></div>
                    <div style={{ width: '98%', height: 3, background: '#eee' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: 40, height: 4, background: '#000' }}></div>
                    <div style={{ width: 25, height: 4, background: '#888' }}></div>
                  </div>
                  <div style={{ width: '100%', height: 3, background: '#eee' }}></div>
                </div>
                <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Minimal Professional</h3>
                <p className="body-md text-muted" style={{ fontSize: 13.5, lineHeight: 1.5 }}>Whitespace-focused design for maximum readability. Extremely high parse rate in ATS systems.</p>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 4: HOW IT WORKS ── */}
        <section id="features" className="section-breathing">
          <div className="container" style={{ maxWidth: 900 }}>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>⚡ Simple Flow</div>
              <h2 className="headline-lg">How It Works</h2>
              <p className="body-md text-muted" style={{ marginTop: 10 }}>Get your job-winning resume in four quick steps</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 60 }}>
              
              {/* Step 1 */}
              <div className="zigzag-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 72, fontWeight: 800, color: 'rgba(124, 58, 237, 0.1)', lineHeight: 0.8, marginBottom: 10 }}>01</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Build For Free</h3>
                  <p className="body-md text-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
                    Fill out our structured, 3-step builder form with your qualifications, projects, and skills. No registration required.
                  </p>
                </div>
                <div style={{ textAlign: 'center', fontSize: 54 }}>📝</div>
              </div>

              {/* Step 2 */}
              <div className="zigzag-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', fontSize: 54, order: window.innerWidth > 768 ? 0 : 1 }}>📄</div>
                <div style={{ order: window.innerWidth > 768 ? 1 : 0 }}>
                  <div style={{ fontSize: 72, fontWeight: 800, color: 'rgba(124, 58, 237, 0.1)', lineHeight: 0.8, marginBottom: 10 }}>02</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Preview & Download</h3>
                  <p className="body-md text-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
                    Generate your formatted resume instantly. Download a free watermarked PDF to evaluate spacing, quality, and content.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="zigzag-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 72, fontWeight: 800, color: 'rgba(124, 58, 237, 0.1)', lineHeight: 0.8, marginBottom: 10 }}>03</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Love It? Upgrade</h3>
                  <p className="body-md text-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
                    Buy a download credit pack starting at only ₹199 to remove the watermark and get full access to the AI writeups.
                  </p>
                </div>
                <div style={{ textAlign: 'center', fontSize: 54 }}>💳</div>
              </div>

              {/* Step 4 */}
              <div className="zigzag-step" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div style={{ textAlign: 'center', fontSize: 54, order: window.innerWidth > 768 ? 0 : 1 }}>💼</div>
                <div style={{ order: window.innerWidth > 768 ? 1 : 0 }}>
                  <div style={{ fontSize: 72, fontWeight: 800, color: 'rgba(124, 58, 237, 0.1)', lineHeight: 0.8, marginBottom: 10 }}>04</div>
                  <h3 style={{ fontSize: 20, color: '#fff', marginBottom: 8 }}>Apply & Get Placed</h3>
                  <p className="body-md text-muted" style={{ fontSize: 15, lineHeight: 1.6 }}>
                    Export a clean PDF. Share your optimized summary on LinkedIn, apply to placements, and grab those interviews!
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SECTION 5: PRICING SECTION (New credit model) ── */}
        <section id="pricing" className="section-breathing" style={{ background: '#0E0E12', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>💳 Simple Credit Pricing</div>
              <h2 className="headline-lg">Pay Only For What You Need</h2>
              <p className="body-md text-muted" style={{ marginTop: 10 }}>No subscriptions. Credits never expire.</p>
            </div>

            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, maxWidth: 1000, margin: '0 auto' }}>
              
              {/* Starter */}
              <div className="pricing-card glass-card glow-hover" style={{ padding: 32, display: 'flex', flexDirection: 'column', background: 'rgba(25, 25, 35, 0.4)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Starter</div>
                <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 16 }}>1 Resume Download</h3>
                <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 6 }}>₹199</div>
                <div style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 24 }}>₹199 per resume</div>
                <div className="divider" style={{ margin: '0 0 20px' }}></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>✓ No watermark PDF</li>
                  <li>✓ All 3 templates</li>
                  <li>✓ ATS Score report</li>
                  <li>✓ Instant download</li>
                </ul>
                <button onClick={() => choosePlan('starter')} className="btn btn-secondary btn-full" style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                  Get Started →
                </button>
              </div>

              {/* Value Pack */}
              <div className="pricing-card glass-card glow-hover" style={{
                padding: 32, display: 'flex', flexDirection: 'column', background: 'rgba(25, 25, 35, 0.7)',
                border: '2px solid #7c3aed', position: 'relative', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.15)'
              }}>
                <span className="badge" style={{ background: '#7c3aed', color: '#fff', position: 'absolute', top: 12, right: 12, fontSize: 11 }}>Most Popular</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#d2bbff', textTransform: 'uppercase', marginBottom: 10 }}>Value Pack</div>
                <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 16 }}>5 Resume Downloads</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>₹599</span>
                  <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: 16 }}>₹995</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#4edea3', fontWeight: 600, marginBottom: 24 }}>₹119 per resume • Save 40%</div>
                <div className="divider" style={{ margin: '0 0 20px' }}></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>✓ Everything in Starter</li>
                  <li>✓ **LinkedIn Profile Rewrite**</li>
                  <li>✓ Before/After profile compare</li>
                  <li>✓ Keywords annotations</li>
                </ul>
                <button onClick={() => choosePlan('value')} className="btn btn-primary btn-full btn-shimmer" style={{ marginTop: 'auto' }}>
                  Get Value Pack →
                </button>
              </div>

              {/* Pro Pack */}
              <div className="pricing-card glass-card glow-hover" style={{ padding: 32, display: 'flex', flexDirection: 'column', background: 'rgba(25, 25, 35, 0.4)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 10 }}>Pro Pack</div>
                <h3 style={{ fontSize: 22, color: '#fff', marginBottom: 16 }}>10 Resume Downloads</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>₹899</span>
                  <span style={{ textDecoration: 'line-through', color: '#64748b', fontSize: 16 }}>₹1990</span>
                </div>
                <div style={{ fontSize: 12.5, color: '#4edea3', fontWeight: 600, marginBottom: 24 }}>₹89 per resume • Save 55%</div>
                <div className="divider" style={{ margin: '0 0 20px' }}></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px', display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13.5 }}>
                  <li>✓ Everything in Value Pack</li>
                  <li>✓ **Custom Cover Letter**</li>
                  <li>✓ Job Description tailoring</li>
                  <li>✓ Priority customer support</li>
                </ul>
                <button onClick={() => choosePlan('pro')} className="btn btn-secondary btn-full" style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                  Get Pro Pack →
                </button>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13.5, color: '#94a3b8' }}>
              🔒 Secured by Razorpay • Instant access • Credits never expire
            </div>

            {/* Reminder box */}
            <div className="glass-card" style={{
              maxWidth: 600, margin: '40px auto 0', padding: '20px 24px', textAlign: 'center',
              border: '1px dashed rgba(124, 58, 237, 0.25)', background: 'rgba(124, 58, 237, 0.03)'
            }}>
              <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 600 }}>Not sure yet? </span>
              <button onClick={handleFreeTrial} style={{
                background: 'none', border: 'none', color: '#d2bbff', fontWeight: 700, cursor: 'pointer',
                fontSize: 14.5, textDecoration: 'underline', padding: 0
              }}>
                Try completely free with watermark →
              </button>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: TESTIMONIAL TICKER ── */}
        <section className="section-breathing" style={{ overflow: 'hidden' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>⭐ Reviews</div>
              <h2 className="headline-lg">What Freshers Say</h2>
              <p className="body-md text-muted" style={{ marginTop: 10 }}>Join thousands of graduates placing at top Indian tech firms</p>
            </div>
          </div>
          <TestimonialTicker />
        </section>

        {/* ── SECTION 7: FAQ ── */}
        <section id="faq" className="section-breathing" style={{ background: '#0E0E12', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 50 }}>
              <div className="pill-badge" style={{ marginBottom: 12 }}>❓ Help</div>
              <h2 className="headline-lg">Frequently Asked Questions</h2>
            </div>
            
            <div className="faq-two-column" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
              <div>
                <FAQAccordion />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Additional custom Qs */}
                <div className="faq-item" style={{ background: 'rgba(25, 25, 35, 0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, color: '#fff', marginBottom: 8, fontWeight: 700 }}>What happens to my watermarked resume?</h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5 }}>
                    You keep it! If you choose to upgrade to a credit plan later, you can instantly download a clean, high-resolution PDF without watermarks. Your form data is saved securely in your browser's session history for 30 days.
                  </p>
                </div>
                <div className="faq-item" style={{ background: 'rgba(25, 25, 35, 0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20 }}>
                  <h4 style={{ fontSize: 15, color: '#fff', marginBottom: 8, fontWeight: 700 }}>Can I edit my resume after downloading?</h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5 }}>
                    Yes! You can revisit the site anytime within 30 days to edit details or change template styles. Each watermark-free download deducts 1 credit from your balance. Watermarked previews remain completely free.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 8: FINAL CTA BANNER ── */}
        <section className="section-breathing" style={{ paddingBottom: 100 }}>
          <div className="container">
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #082f49 100%)',
              border: '1px solid rgba(124, 58, 237, 0.3)', padding: '60px 40px',
              borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(124,58,237,0.1), transparent 70%)', pointerEvents: 'none' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>
                  Your Resume. Watermark-Free. Forever.
                </h2>
                <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
                  Start for free, preview your profile layout, and upgrade to clean downloads only when you love it.
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={handleFreeTrial} className="btn btn-primary btn-lg glow-hover btn-shimmer" style={{ background: '#fff', color: '#0f0f0f', padding: '14px 32px' }}>
                    Try Free Now →
                  </button>
                  <button onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                    className="btn btn-ghost btn-lg" style={{ border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 32px' }}>
                    See Pricing ↓
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <style>{`
        .faq-two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        @media (max-width: 768px) {
          .faq-two-column {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
