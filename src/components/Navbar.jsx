import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const loc = useLocation();
  const isLanding = loc.pathname === '/';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="navbar-logo-icon">✨</div>
        <span className="navbar-logo-text">ResumeAI</span>
      </Link>
      {isLanding && (
        <div className="flex gap-sm items-center" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="flex items-center gap-xs" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="glow-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#4edea3', boxShadow: '0 0 8px #4edea3', animation: 'pulse 2s ease infinite' }}></div>
            <span className="label-sm text-muted">2,400+ resumes built</span>
          </div>
          <Link to="/payment" className="btn btn-primary btn-sm">
            Build My Resume →
          </Link>
        </div>
      )}
    </nav>
  );
}
