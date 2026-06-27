// Supabase Edge Function: enhance-resume
// Deploy: supabase functions deploy enhance-resume

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROVIDER = Deno.env.get('AI_PROVIDER') || 'gemini';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { resumeText, targetRole } = await req.json();
    if (!resumeText) throw new Error('resumeText is required');

    const system = `You are an expert resume writer and ATS optimization specialist. Enhance the user's existing resume to be highly professional, metrics-driven, and optimized for the target job role.`;

    const user = `The user has provided their existing resume and wants it enhanced for the role: "${targetRole || 'Software Engineer'}".

Your tasks:
1. Fix all weak action verbs — replace with strong ones (Built, Engineered, Designed, Led, Optimized, etc.)
2. Add metrics and numbers wherever missing — estimate realistically if not provided
3. Rewrite the summary/objective to be role-specific and keyword-rich
4. Add missing standard sections if absent (Skills, Summary, etc.)
5. Remove irrelevant or unprofessional details
6. Optimize every bullet point for ATS keyword matching for the target role: "${targetRole || 'Software Engineer'}"
7. Keep the same basic structure and real experience — only enhance, do not fabricate new roles or companies

Return ONLY a valid JSON object:
{
  "original_ats_score": 45,
  "enhanced_ats_score": 88,
  "changes_made": [
    "Rewrote summary to highlight SDE skills",
    "Added metrics to VIT project description",
    "Replaced passive verbs in internship achievements"
  ],
  "enhanced_resume": {
    "name": "Candidate Name",
    "contact": "Contact details",
    "summary": "AI enhanced professional summary",
    "skills": ["Skill1", "Skill2"],
    "experience": [{"role": "...", "company": "...", "duration": "...", "bullets": ["..."]}],
    "projects": [{"title": "...", "tech": "...", "description": "..."}],
    "education": {"degree": "...", "college": "...", "year": "...", "cgpa": "..."},
    "certifications": ["Cert1"]
  }
}

Original Resume Text:
${resumeText}`;

    const result = await callAI(system, user);
    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callAI(system: string, user: string): Promise<any> {
  switch (PROVIDER) {
    case 'openai': return callOpenAI(system, user);
    case 'claude': return callClaude(system, user);
    default: return callGemini(system, user);
  }
}

async function callGemini(system: string, user: string) {
  const key = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 4096 }
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
  return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callOpenAI(system: string, user: string) {
  const key = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return extractJSON(data.choices?.[0]?.message?.content || '');
}

async function callClaude(system: string, user: string) {
  const key = Deno.env.get('CLAUDE_API_KEY');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, system, messages: [{ role: 'user', content: user }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude error');
  return extractJSON(data.content?.[0]?.text || '');
}

function extractJSON(text: string): any {
  const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  throw new Error('Invalid JSON from AI');
}
