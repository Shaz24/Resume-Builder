// Supabase Edge Function: rewrite-linkedin
// Deploy: supabase functions deploy rewrite-linkedin

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROVIDER = Deno.env.get('AI_PROVIDER') || 'gemini';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { resumeData, targetRole } = await req.json();

    const system = `You are a LinkedIn profile optimization expert. You help Indian freshers craft compelling, keyword-rich LinkedIn profiles that attract recruiters for tech roles.`;

    const user = `Rewrite this LinkedIn profile to be keyword-rich and ATS-friendly for a ${targetRole || 'Software Engineer'} fresher.

Return ONLY a valid JSON object:
{
  "headline": "Optimized LinkedIn headline (max 220 chars)",
  "about": "Compelling About section 250-300 words with keywords and CTA",
  "experience": [{ "role": "...", "company": "...", "bullets": ["achievement bullet"] }],
  "annotations": { "headline": "Why this headline works", "about": "Key improvements", "keywords": ["keyword1"] }
}

Resume Data: ${JSON.stringify(resumeData, null, 2)}`;

    const result = await callAI(system, user, 2000);
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

async function callAI(system: string, user: string, maxTokens = 2000): Promise<any> {
  switch (PROVIDER) {
    case 'openai': return callOpenAI(system, user, maxTokens);
    case 'claude': return callClaude(system, user, maxTokens);
    default: return callGemini(system, user);
  }
}

async function callGemini(system: string, user: string) {
  const key = Deno.env.get('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ parts: [{ text: user }] }], generationConfig: { responseMimeType: 'application/json' } }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gemini error');
  return extractJSON(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
}

async function callOpenAI(system: string, user: string, maxTokens: number) {
  const key = Deno.env.get('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini';
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: maxTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return extractJSON(data.choices?.[0]?.message?.content || '');
}

async function callClaude(system: string, user: string, maxTokens: number) {
  const key = Deno.env.get('CLAUDE_API_KEY');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
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
