import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const data = await base44.asServiceRole.entities.CivicTopic.list();
  return Response.json({ count: data.length, data });
});