// Supabase Edge Function: generate-resume
// Calls the configured AI provider with server-side API keys
// Deploy: supabase functions deploy generate-resume

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROVIDER = Deno.env.get('AI_PROVIDER') || 'gemini';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { formData } = await req.json();
    if (!formData) throw new Error('formData is required');

    const systemPrompt = `You are an expert resume writer specializing in ATS-optimized resumes for Indian freshers targeting tech jobs. Use strong action verbs, quantify achievements wherever possible, and maintain a professional tone appropriate for freshers in India's tech industry.`;

    const userPrompt = `Create an ATS-optimized resume for an Indian fresher. Use strong action verbs and quantify achievements.

Return ONLY a valid JSON object with exactly these keys:
{
  "summary": "2-3 sentence professional summary",
  "education": { "college": "...", "degree": "...", "branch": "...", "year": "...", "cgpa": "..." },
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1"],
  "projects": [{ "title": "...", "description": "Enhanced description with action verbs", "techStack": ["React"], "liveLink": "..." }],
  "internships": [{ "company": "...", "role": "...", "duration": "...", "achievements": ["bullet with action verb"] }],
  "achievements": ["achievement 1"]
}

Candidate Details:
${JSON.stringify(formData, null, 2)}`;

    const result = await callAI(systemPrompt, userPrompt);
    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ─── AI Provider Router ───────────────────────────────────────────────────────
async function callAI(system: string, user: string): Promise<any> {
  switch (PROVIDER) {
    case 'openai': return callOpenAI(system, user);
    case 'claude': return callClaude(system, user);
    case 'gemini':
    default: return callGemini(system, user);
  }
}

async function callGemini(system: string, user: string) {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY not set in Edge Function secrets');
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini API error');
  return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callOpenAI(system: string, user: string) {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY not set in Edge Function secrets');
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI API error');
  return extractJSON(data.choices?.[0]?.message?.content || '');
}

async function callClaude(system: string, user: string) {
  const key = Deno.env.get('CLAUDE_API_KEY');
  if (!key) throw new Error('CLAUDE_API_KEY not set in Edge Function secrets');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Claude API error');
  return extractJSON(data.content?.[0]?.text || '');
}

function extractJSON(text: string): any {
  const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(stripped); } catch {}
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch {} }
  throw new Error('AI returned invalid JSON. Please try again.');
}
