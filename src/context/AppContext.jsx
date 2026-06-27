import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage, KEYS } from '../utils/storage';
import { createSession, logEvent, getSession, updateSessionCredits } from '../utils/db';
import { generateReferralCode } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [plan, setPlan]             = useState(() => storage.get(KEYS.PLAN));
  const [payment, setPayment]       = useState(() => storage.get(KEYS.PAYMENT));
  const [formData, setFormData]     = useState(() => storage.get(KEYS.FORM_DATA) || defaultFormData());
  const [resumeData, setResumeData] = useState(() => storage.get(KEYS.RESUME_DATA));
  const [linkedInData, setLinkedInData] = useState(() => storage.get(KEYS.LINKEDIN_DATA));
  const [coverLetter, setCoverLetter]   = useState(() => storage.get(KEYS.COVER_LETTER));
  const [sessionId, setSessionId]       = useState(() => storage.get('session_id'));
  const [credits, setCredits]           = useState(() => Number(storage.get('credits') || 0));
  const [toasts, setToasts]         = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // ── Initialize anonymous Supabase session ─────────────────────────────────
  useEffect(() => {
    const init = async () => {
      let currentSessionId = sessionId;
      try {
        let refCode = storage.get(KEYS.REFERRAL_CODE);
        if (!refCode) {
          refCode = generateReferralCode();
          storage.set(KEYS.REFERRAL_CODE, refCode);
        }
        if (!currentSessionId) {
          let session = await createSession(refCode);
          if (!session) {
            // Collision or duplicate code retry
            const freshCode = generateReferralCode();
            storage.set(KEYS.REFERRAL_CODE, freshCode);
            session = await createSession(freshCode);
          }
          if (session?.id) {
            storage.set('session_id', session.id);
            setSessionId(session.id);
            currentSessionId = session.id;
            logEvent(session.id, 'session_created', { plan: null });
          }
        }
        
        // If we have a session, fetch latest credits/plan from database
        if (currentSessionId) {
          const sessionData = await getSession(currentSessionId);
          if (sessionData) {
            if (sessionData.plan) setPlan(sessionData.plan);
            if (typeof sessionData.credits === 'number') {
              setCredits(sessionData.credits);
              storage.set('credits', sessionData.credits);
            }
          }
        }
      } catch (e) {
        console.warn('Session init failed (offline mode):', e.message);
      }
    };
    init();
  }, []);

  // ── Sync states to localStorage ──────────────────────────────────────────
  useEffect(() => { storage.set(KEYS.PLAN, plan); }, [plan]);
  useEffect(() => { storage.set(KEYS.PAYMENT, payment); }, [payment]);
  useEffect(() => { storage.set(KEYS.FORM_DATA, formData); }, [formData]);
  useEffect(() => { storage.set('credits', credits); }, [credits]);
  useEffect(() => { if (resumeData) storage.set(KEYS.RESUME_DATA, resumeData); }, [resumeData]);
  useEffect(() => { if (linkedInData) storage.set(KEYS.LINKEDIN_DATA, linkedInData); }, [linkedInData]);
  useEffect(() => { if (coverLetter) storage.set(KEYS.COVER_LETTER, coverLetter); }, [coverLetter]);

  // ── Deduct credit ─────────────────────────────────────────────────────────
  const deductCredit = async () => {
    if (credits <= 0) return false;
    const newCredits = credits - 1;
    setCredits(newCredits);
    storage.set('credits', newCredits);
    try {
      await updateSessionCredits(sessionId, newCredits);
      logEvent(sessionId, 'credit_deducted', { remaining: newCredits });
    } catch (e) {
      console.warn('Deduct credits failed in database:', e.message);
    }
    return true;
  };

  // ── Toast system ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ── Loading overlay ───────────────────────────────────────────────────────
  const showLoading = useCallback((msg = 'Processing...') => {
    setLoadingMessage(msg);
    setIsLoading(true);
  }, []);
  const hideLoading = useCallback(() => setIsLoading(false), []);

  // ── Plan access helpers ───────────────────────────────────────────────────
  // starter: no LinkedIn/Cover Letter
  // value: unlocks LinkedIn
  // pro: unlocks LinkedIn + Cover Letter
  const hasPlan = (required) => {
    if (!plan) return false;
    if (required === 'pro') {
      return plan === 'value' || plan === 'pro';
    }
    if (required === 'premium') {
      return plan === 'pro';
    }
    return true; // basic features
  };

  const isPaid = Boolean(payment) || credits > 0;

  const value = {
    plan, setPlan,
    payment, setPayment,
    formData, setFormData,
    resumeData, setResumeData,
    linkedInData, setLinkedInData,
    coverLetter, setCoverLetter,
    sessionId,
    credits, setCredits, deductCredit,
    toasts, addToast, removeToast,
    isLoading, loadingMessage, showLoading, hideLoading,
    hasPlan, isPaid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

function defaultFormData() {
  return {
    fullName: '', email: '', phone: '', linkedinUrl: '', githubUrl: '', targetRole: '',
    college: '', degree: '', branch: '', graduationYear: '', cgpa: '',
    skills: [], certifications: [],
    projects: [{ title: '', description: '', techStack: '', liveLink: '' }],
    internships: [],
    achievements: '',
  };
}
