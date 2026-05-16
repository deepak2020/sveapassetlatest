import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.CivicTopic.list('created_date', 2000);

    const seen = new Map();
    const toDelete = [];
    for (const topic of all) {
      const key = (topic.title || '').toLowerCase().trim();
      if (seen.has(key)) {
        toDelete.push(topic.id);
      } else {
        seen.set(key, topic.id);
      }
    }

    let deleted = 0;
    for (const id of toDelete) {
      await base44.asServiceRole.entities.CivicTopic.delete(id);
      deleted++;
    }

    return Response.json({
      total_before: all.length,
      unique: seen.size,
      deleted,
      remaining: all.length - deleted,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});