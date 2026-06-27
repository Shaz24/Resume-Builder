import React from 'react';

export default function ProgressBar({ step, totalSteps, labels }) {
  return (
    <div className="steps-progress">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className={`step-item ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
          <div className="step-circle">
            {i < step ? '✓' : i + 1}
          </div>
          {labels && <span className="step-label">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
