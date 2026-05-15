import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const sentences = await base44.asServiceRole.entities.ClozeSentence.filter({ source: 'tatoeba' });
    return Response.json({ count: sentences.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});