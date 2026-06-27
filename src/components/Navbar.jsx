import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { credits, isPaid } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = loc.pathname === '/';

  // Handle scroll to add background and shrink
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isLanding) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTryFree = () => {
    localStorage.setItem('trialMode', 'true');
    setMobileMenuOpen(false);
    navigate('/form');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'rgba(10, 10, 15, 0.4)',
      backdropFilter: 'blur(16px)', transition: 'all 0.3s ease',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
      padding: scrolled ? '12px 24px' : '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      {/* Left side: Logo */}
      <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
        <div className="navbar-logo-icon" style={{
          fontSize: 20, filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.8))',
          animation: 'pulse 2s ease infinite'
        }}>✨</div>
        <span className="navbar-logo-text" style={{
          fontSize: 20, fontWeight: 800, color: '#fff',
          letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>ResumeAI</span>
      </Link>

      {/* Center: Navigation Links */}
      <div className="nav-links-desktop" style={{ display: 'flex', gap: 24 }}>
        {['features', 'templates', 'pricing', 'faq'].map((section) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Right: Stat + Credits + CTA */}
      <div className="nav-actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="glow-dot"></div>
          <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>2,400+ built</span>
        </div>

        {/* Credit Indicator */}
        {isPaid && (
          <div style={{
            padding: '6px 12px', background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)', borderRadius: 20,
            fontSize: 12.5, fontWeight: 700, color: '#d2bbff', display: 'flex', gap: 4
          }}>
            <span>⚡</span>
            <span>{credits} {credits === 1 ? 'credit' : 'credits'} remaining</span>
          </div>
        )}

        <button onClick={handleTryFree} className="btn btn-primary btn-shimmer glow-hover" style={{
          padding: '8px 18px', fontSize: 13.5, borderRadius: 20, cursor: 'pointer', border: 'none'
        }}>
          Try for Free →
        </button>
      </div>

      {/* Mobile Hamburger toggle */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="mobile-hamburger"
        style={{
          background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', display: 'none'
        }}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer animate-fade-in-up" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(19, 19, 26, 0.96)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16, zIndex: 999
        }}>
          {['features', 'templates', 'pricing', 'faq'].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                fontSize: 16, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                textTransform: 'capitalize', padding: '8px 0'
              }}
            >
              {section}
            </button>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>2,400+ built</span>
            {isPaid && (
              <span style={{ fontSize: 13, color: '#d2bbff', fontWeight: 600 }}>⚡ {credits} credits left</span>
            )}
          </div>
          <button onClick={handleTryFree} className="btn btn-primary btn-full text-center" style={{ border: 'none', cursor: 'pointer' }}>
            Try for Free →
          </button>
        </div>
      )}

      {/* Embedded CSS for desktop/mobile display rules */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop, .nav-actions-desktop { display: none !important; }
          .mobile-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
