import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const lessons = await base44.asServiceRole.entities.Lesson.list("order", 100);
    return Response.json({ lessons });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});