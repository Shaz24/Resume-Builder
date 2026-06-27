// ─── AI API calls via Supabase Edge Functions ────────────────────────────────
// API keys live securely in Edge Function secrets — never exposed to browser.
// Falls back to direct browser calls if Supabase is not configured (dev mode).

import { callEdgeFunction, isSupabaseConfigured } from '../lib/supabase';

// ─── Resume Generation ────────────────────────────────────────────────────────
export async function generateResume(formData) {
  if (isSupabaseConfigured()) {
    return callEdgeFunction('generate-resume', { formData });
  }
  // Fallback: direct browser call (for local dev without Supabase)
  return callDirectAI('resume', { formData });
}

// ─── LinkedIn Rewrite ─────────────────────────────────────────────────────────
export async function rewriteLinkedIn(resumeData, targetRole) {
  if (isSupabaseConfigured()) {
    return callEdgeFunction('rewrite-linkedin', { resumeData, targetRole });
  }
  return callDirectAI('linkedin', { resumeData, targetRole });
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────
export async function generateCoverLetter(resumeData, jobDescription, company, targetRole) {
  if (isSupabaseConfigured()) {
    return callEdgeFunction('generate-cover-letter', { resumeData, jobDescription, company, targetRole });
  }
  return callDirectAI('cover-letter', { resumeData, jobDescription, company, targetRole });
}

// ─── Direct browser fallback (dev without Supabase) ──────────────────────────
// AI keys read from .env.local — only use this for local development!
const PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'gemini';

async function callDirectAI(type, payload) {
  const prompts = buildPrompts(type, payload);
  switch (PROVIDER) {
    case 'openai': return callOpenAI(prompts.system, prompts.user);
    case 'claude': return callClaude(prompts.system, prompts.user);
    case 'gemini':
    default: return callGemini(prompts.system, prompts.user);
  }
}

function buildPrompts(type, payload) {
  if (type === 'resume') {
    return {
      system: `You are an expert resume writer for Indian freshers targeting tech jobs. Use strong action verbs and ATS optimization.`,
      user: `Create an ATS-optimized resume. Return ONLY valid JSON:
{"summary":"...","education":{"college":"...","degree":"...","branch":"...","year":"...","cgpa":"..."},"skills":["skill1"],"certifications":["cert1"],"projects":[{"title":"...","description":"...","techStack":["React"],"liveLink":"..."}],"internships":[{"company":"...","role":"...","duration":"...","achievements":["bullet"]}],"achievements":["achievement"]}

Candidate: ${JSON.stringify(payload.formData, null, 2)}`,
    };
  }
  if (type === 'linkedin') {
    return {
      system: `You are a LinkedIn optimization expert for Indian freshers.`,
      user: `Rewrite LinkedIn for ${payload.targetRole} fresher. Return ONLY valid JSON:
{"headline":"...","about":"...","experience":[{"role":"...","company":"...","bullets":["..."]}],"annotations":{"headline":"...","about":"...","keywords":["..."]}}

Resume: ${JSON.stringify(payload.resumeData, null, 2)}`,
    };
  }
  // cover-letter
  return {
    system: `Expert cover letter writer for Indian freshers. Never start with "I am writing to express".`,
    user: `Write cover letter for ${payload.targetRole} at ${payload.company}. Under 250 words. Return ONLY valid JSON:
{"coverLetter":"...","wordCount":200,"highlights":["..."]}

JD: ${payload.jobDescription}
Resume: ${JSON.stringify(payload.resumeData, null, 2)}`,
  };
}

async function callGemini(system, user) {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here')
    throw new Error('Gemini API key not set. Add VITE_GEMINI_API_KEY to .env.local — or configure Supabase for secure key storage.');
  const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 4096 } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Gemini error ${res.status}`);
  return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callOpenAI(system, user) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key || key === 'your_openai_api_key_here')
    throw new Error('OpenAI API key not set. Add VITE_OPENAI_API_KEY to .env.local');
  const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: 3000, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `OpenAI error ${res.status}`);
  return extractJSON(data.choices?.[0]?.message?.content || '');
}

async function callClaude(system, user) {
  const key = import.meta.env.VITE_CLAUDE_API_KEY;
  if (!key || key === 'your_claude_api_key_here')
    throw new Error('Claude API key not set. Add VITE_CLAUDE_API_KEY to .env.local');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Claude error ${res.status}`);
  return extractJSON(data.content?.[0]?.text || '');
}

function extractJSON(text) {
  if (!text) throw new Error('Empty response from AI');
  const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  throw new Error('AI returned invalid JSON. Please try again.');
}
