import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Lesson.filter(
      { sfi_course: 'B' },
      'created_date',
      2000
    );

    const LIMIT = 150;
    const work = all.slice(0, LIMIT);

    let deleted = 0;
    const errors = [];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (const l of work) {
      try {
        await base44.asServiceRole.entities.Lesson.delete(l.id);
        deleted++;
      } catch (e) {
        errors.push({ id: l.id, error: e.message });
        if (e.message?.includes('Rate limit')) await sleep(2000);
      }
      await sleep(120);
    }

    return Response.json({
      total_before: all.length,
      deleted,
      remaining: all.length - deleted,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});