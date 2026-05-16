import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Lesson.filter(
      { sfi_course: 'A' },
      'created_date',
      2000
    );

    let deleted = 0;
    const errors = [];
    const BATCH = 20;
    for (let i = 0; i < all.length; i += BATCH) {
      const slice = all.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        slice.map((l) => base44.asServiceRole.entities.Lesson.delete(l.id))
      );
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') deleted++;
        else errors.push({ id: slice[idx].id, error: r.reason?.message || String(r.reason) });
      });
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