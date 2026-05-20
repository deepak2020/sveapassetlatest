// Vercel serverless function — proxies InvokeLLM calls to Anthropic Claude.
// Set ANTHROPIC_API_KEY in Vercel environment variables.

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.json();
  const { prompt, response_json_schema, system_prompt } = body;

  const messages = [{ role: 'user', content: prompt }];

  const anthropicBody = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages,
  };

  if (system_prompt) {
    anthropicBody.system = system_prompt;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: err }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await response.json();
  const text = result.content?.[0]?.text || '';

  // If a JSON schema was requested, try to parse the response as JSON
  if (response_json_schema) {
    try {
      const parsed = JSON.parse(text.replace(/^```json\n?|\n?```$/g, ''));
      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // Return raw text if JSON parsing fails
    }
  }

  return new Response(JSON.stringify({ result: text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
