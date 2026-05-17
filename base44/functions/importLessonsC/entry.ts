import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ALLOWED_FIELDS = [
  'title', 'title_sv', 'topic', 'sfi_course', 'category', 'skill',
  'level', 'content', 'word_pairs', 'fill_in_blanks', 'writing_prompts',
  'speaking_phrases', 'listening_phrases', 'quiz_questions',
  'review_questions', 'match_pairs', 'order',
];

function clean(lesson) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (lesson[key] !== undefined) out[key] = lesson[key];
  }
  // Force sfi_course = C
  out.sfi_course = 'C';
  if (!out.level) out.level = 'intermediate';
  if (!out.skill && out.category) out.skill = out.category;
  if (!out.category && out.skill) out.category = out.skill;
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const lessons = Array.isArray(body) ? body : body.lessons;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return Response.json({ error: 'Expected JSON array of lessons or { lessons: [...] }' }, { status: 400 });
    }

    const prepared = lessons.map(clean);

    let created = 0;
    const errors = [];
    const BATCH = 10;
    for (let i = 0; i < prepared.length; i += BATCH) {
      const slice = prepared.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        slice.map((l) => base44.asServiceRole.entities.Lesson.create(l))
      );
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') created++;
        else errors.push({
          title: slice[idx].title,
          error: r.reason?.message || String(r.reason),
        });
      });
    }

    return Response.json({
      received: lessons.length,
      created,
      failed: errors.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});