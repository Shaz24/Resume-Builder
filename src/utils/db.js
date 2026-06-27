// ─── Supabase Database Operations ──────────────────────────────────────────
// Hybrid: Supabase primary, localStorage fallback for offline dev

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage, KEYS } from './storage';

const USE_DB = () => isSupabaseConfigured();

// ─── Sessions ────────────────────────────────────────────────────────────────
export async function createSession(referralCode) {
  if (!USE_DB()) return null;
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({ referral_code: referralCode, user_agent: navigator.userAgent.substring(0, 200) })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('DB session create failed:', e.message); return null; }
}

export async function getSession(id) {
  if (!USE_DB() || !id) return null;
  try {
    const { data } = await supabase.from('sessions').select('*').eq('id', id).single();
    return data;
  } catch { return null; }
}

export async function updateSessionPlan(sessionId, plan) {
  if (!USE_DB() || !sessionId) return;
  try {
    await supabase.from('sessions').update({ plan }).eq('id', sessionId);
  } catch (e) { console.warn('DB session update failed:', e.message); }
}

export async function updateSessionCredits(sessionId, credits) {
  if (!USE_DB() || !sessionId) return;
  try {
    await supabase.from('sessions').update({ credits }).eq('id', sessionId);
  } catch (e) { console.warn('DB session credits update failed:', e.message); }
}

// ─── Payments ────────────────────────────────────────────────────────────────
export async function savePayment(sessionId, paymentData) {
  // Always save to localStorage as fallback
  storage.set(KEYS.PAYMENT, paymentData);

  if (!USE_DB()) return null;
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        session_id: sessionId || null,
        plan: paymentData.plan,
        amount: paymentData.amount * 100,
        razorpay_payment_id: paymentData.paymentId,
        razorpay_order_id: paymentData.orderId,
        status: paymentData.demo ? 'demo' : 'paid',
        paid_at: paymentData.paidAt,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('DB payment save failed:', e.message); return null; }
}

export async function getPaymentBySession(sessionId) {
  if (!USE_DB() || !sessionId) return storage.get(KEYS.PAYMENT);
  try {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data;
  } catch { return storage.get(KEYS.PAYMENT); }
}

// ─── Resumes ─────────────────────────────────────────────────────────────────
export async function saveResume(sessionId, formData, resumeJson, template = 'Classic', atsScore = 0) {
  // Always save to localStorage
  storage.set(KEYS.RESUME_DATA, resumeJson);

  if (!USE_DB()) return null;
  try {
    // Check if resume exists for this session
    const { data: existing } = await supabase
      .from('resumes')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1)
      .single();

    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('resumes')
        .update({ form_data: formData, resume_json: resumeJson, template, ats_score: atsScore })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('resumes')
        .insert({ session_id: sessionId || null, form_data: formData, resume_json: resumeJson, template, ats_score: atsScore })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  } catch (e) { console.warn('DB resume save failed:', e.message); return null; }
}

export async function updateResumeTemplate(sessionId, template) {
  if (!USE_DB() || !sessionId) return;
  try {
    await supabase.from('resumes').update({ template }).eq('session_id', sessionId);
  } catch (e) { console.warn('DB resume template update failed:', e.message); }
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
export async function saveTestimonial(sessionId, { name, college, text, stars }) {
  // Save to localStorage always
  const existing = storage.get('testimonials') || [];
  storage.set('testimonials', [...existing, { name, college, text, stars, submittedAt: new Date().toISOString() }]);

  if (!USE_DB()) return null;
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .insert({ session_id: sessionId || null, name, college, text, stars })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) { console.warn('DB testimonial save failed:', e.message); return null; }
}

export async function getApprovedTestimonials() {
  if (!USE_DB()) return [];
  try {
    const { data } = await supabase
      .from('testimonials')
      .select('name, college, text, stars')
      .eq('approved', true)
      .order('created_at', { ascending: false })
      .limit(10);
    return data || [];
  } catch { return []; }
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function logEvent(sessionId, event, data = {}) {
  // Always log to localStorage
  const log = storage.get(KEYS.ANALYTICS) || [];
  log.push({ event, data, timestamp: new Date().toISOString() });
  storage.set(KEYS.ANALYTICS, log);

  if (!USE_DB()) return;
  try {
    await supabase.from('analytics').insert({ session_id: sessionId || null, event, data });
  } catch (e) { /* silent fail for analytics */ }
}
