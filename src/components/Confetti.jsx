import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ trigger = true }) {
  useEffect(() => {
    if (!trigger) return;
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7c3aed', '#d2bbff', '#4edea3', '#adc6ff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7c3aed', '#d2bbff', '#4edea3', '#adc6ff'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [trigger]);

  return null;
}
