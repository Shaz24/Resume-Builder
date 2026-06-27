import React, { useState } from 'react';

const FAQS = [
  {
    q: 'Is my resume actually ATS-friendly?',
    a: 'Yes! Our Claude-powered AI is trained on ATS requirements. We use proper section headers, avoid tables and graphics, include keyword-rich content, and structure each section exactly how major ATS platforms like Workday, Taleo, and Greenhouse expect.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed! Everything is session-based and stored locally in your browser. Just pay, fill in your details, and download your resume instantly. We respect your privacy.',
  },
  {
    q: 'What if I am not satisfied with the result?',
    a: 'You can edit every single section of your resume inline directly on the preview page. If the AI output does not match your expectations, you can regenerate or manually adjust any content before downloading.',
  },
  {
    q: 'How is ResumeAI different from Canva or Zety?',
    a: 'Unlike templates, our AI actually writes your resume content using Claude — one of the most advanced AI models available. We do not just format your input; we enhance it with action verbs, quantified achievements, and ATS-optimized language tailored for Indian freshers.',
  },
  {
    q: 'Can I use the resume for off-campus placements and internships?',
    a: 'Absolutely. Our resumes are optimized for all Indian fresher use cases — campus placements, off-campus applications, internship applications on LinkedIn, Internshala, and direct company portals.',
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState(null);

  return (
    <div>
      {FAQS.map((faq, i) => (
        <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
          <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
            <span>{faq.q}</span>
            <span className="faq-icon">+</span>
          </button>
          <div className="faq-answer">{faq.a}</div>
        </div>
      ))}
    </div>
  );
}
