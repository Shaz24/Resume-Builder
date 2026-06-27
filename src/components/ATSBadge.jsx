import React from 'react';
import { calculateATSScore } from '../utils/atsScore';

export default function ATSBadge({ resumeData }) {
  const { score, grade, color } = calculateATSScore(resumeData);
  const circumference = 2 * Math.PI * 16;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className="ats-badge">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3"/>
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 4px ${color})` }}
        />
        <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill={color} fontFamily="Plus Jakarta Sans">
          {score}
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{grade}</div>
        <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>ATS Score</div>
      </div>
    </div>
  );
}
