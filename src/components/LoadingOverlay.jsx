import React from 'react';
import { useApp } from '../context/AppContext';

const MESSAGES = [
  'Crafting your career story...',
  'Adding power words...',
  'Making recruiters notice you...',
  'Optimizing for ATS systems...',
  'Polishing every bullet point...',
  'Injecting confidence into your resume...',
  'Analyzing top-performing resumes...',
];

export default function LoadingOverlay() {
  const { isLoading, loadingMessage } = useApp();
  const [msgIndex, setMsgIndex] = React.useState(0);

  React.useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(() => setMsgIndex(i => (i + 1) % MESSAGES.length), 2200);
    return () => clearInterval(iv);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner-ring"></div>
      <div>
        <p className="loading-message">{loadingMessage || MESSAGES[msgIndex]}</p>
        <p className="loading-submessage mt-sm">Powered by Claude AI · Please wait</p>
      </div>
      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--color-primary-container)',
            animation: `pulse 1.4s ease ${i * 0.2}s infinite`
          }}/>
        ))}
      </div>
    </div>
  );
}
