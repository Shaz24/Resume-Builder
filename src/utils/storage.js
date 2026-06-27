// ─── Storage helpers ───────────────────────────────────────────────────────

const PREFIX = 'resumeai_';

export const storage = {
  get: (key) => {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch {}
  },
  remove: (key) => localStorage.removeItem(PREFIX + key),
  clear: () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};

// Keys
export const KEYS = {
  PLAN: 'plan',
  PAYMENT: 'payment',
  FORM_DATA: 'form_data',
  RESUME_DATA: 'resume_data',
  LINKEDIN_DATA: 'linkedin_data',
  COVER_LETTER: 'cover_letter',
  REFERRAL_CODE: 'referral_code',
  TESTIMONIALS: 'testimonials',
  ANALYTICS: 'analytics',
};

// Analytics
export const logAnalytics = (event, data = {}) => {
  const log = storage.get(KEYS.ANALYTICS) || [];
  log.push({ event, data, timestamp: new Date().toISOString() });
  storage.set(KEYS.ANALYTICS, log);
};

// Generate referral code
export const generateReferralCode = () => {
  const code = 'RESUME' + Math.random().toString(36).substring(2, 7).toUpperCase();
  storage.set(KEYS.REFERRAL_CODE, code);
  return code;
};
