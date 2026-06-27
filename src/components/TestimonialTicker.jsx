import React from 'react';

const ROW1 = [
  { name: 'Ananya S.', college: 'VIT Vellore', text: 'Got placed at TCS Digital! The AI made my achievements sound 10x more professional.', stars: 5 },
  { name: 'Rahul P.', college: 'BITS Pilani', text: 'The LinkedIn rewrite boosted my profile views by 400%. Worth every single rupee.', stars: 5 },
  { name: 'Priya M.', college: 'NIT Trichy', text: 'Struggling with a blank page for weeks. Built a beautiful, ready resume in 5 minutes.', stars: 5 },
  { name: 'Kabir D.', college: 'Delhi University', text: 'Clean designs and highly ATS-optimized. Instantly got shortlists for 3 off-campus SDE roles.', stars: 5 },
];

const ROW2 = [
  { name: 'Sneha G.', college: 'SRM University', text: 'The watermarked trial convinced me to upgrade. The output quality is stellar.', stars: 5 },
  { name: 'Amit K.', college: 'IIT Bombay', text: 'Quantified bullets with metrics made all the difference. Highly recommend for freshers.', stars: 5 },
  { name: 'Rohan J.', college: 'RVCE Bangalore', text: 'Best ATS tool in India. Custom cover letters tailored to JDs saved me hours of manual writing.', stars: 5 },
  { name: 'Divya T.', college: 'Anna University', text: 'Simple checkout, instant credits, and clean professional layouts that recruiters love.', stars: 5 },
];

export default function TestimonialTicker() {
  const renderCard = (t, i) => (
    <div key={i} className="glass-card glow-hover" style={{
      width: 320, padding: '20px 24px', flexShrink: 0,
      background: 'rgba(19, 19, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: 14, cursor: 'pointer'
    }}>
      <div style={{ color: '#fbbf24', fontSize: 13, marginBottom: 8 }}>{'★'.repeat(t.stars)}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#e2e8f0', marginBottom: 12, fontStyle: 'italic' }}>
        "{t.text}"
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed 0%, #0566d9 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff'
        }}>
          {t.name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{t.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.college}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Row 1 - Scroll Left */}
      <div className="marquee-wrapper">
        <div className="marquee-row marquee-left">
          {/* Double content to ensure infinite seamless scrolling */}
          {[...ROW1, ...ROW1].map((t, i) => renderCard(t, i))}
        </div>
      </div>

      {/* Row 2 - Scroll Right */}
      <div className="marquee-wrapper">
        <div className="marquee-row marquee-right">
          {[...ROW2, ...ROW2].map((t, i) => renderCard(t, i))}
        </div>
      </div>
    </div>
  );
}
