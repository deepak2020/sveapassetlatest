import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Removes cross-skill duplication created by earlier enrichLessons* functions.
// Each lesson keeps ONLY the activity fields that match its primary skill.
// All other activity fields are cleared so the lesson stops showing identical
// flashcards / match pairs / fill-ins / etc. as its sibling lessons in the
// same topic.
//
// Mapping (skill -> activity fields kept):
//   vocabulary -> word_pairs, match_pairs
//   grammar    -> fill_in_blanks
//   reading    -> (content + quiz_questions only)
//   writing    -> writing_prompts
//   speaking   -> speaking_phrases
//   listening  -> listening_phrases
//
// Every lesson keeps its own `content` and `quiz_questions` (the final quiz),
// since those are lesson-specific.
//
// Optional body: { course: "A" | "B" | "C" | "D" }  — if omitted, runs for all.

const ALL_ACTIVITY_FIELDS = [
  'word_pairs',
  'match_pairs',
  'fill_in_blanks',
  'writing_prompts',
  'speaking_phrases',
  'listening_phrases',
  'review_questions',
];

const SKILL_KEEP = {
  vocabulary: ['word_pairs', 'match_pairs'],
  grammar: ['fill_in_blanks'],
  reading: [],
  writing: ['writing_prompts'],
  speaking: ['speaking_phrases'],
  listening: ['listening_phrases'],
};

function inferSkill(lesson) {
  return (lesson.skill || lesson.category || '').toLowerCase();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch { /* empty body ok */ }
    const courses = body.course ? [body.course] : ['A', 'B', 'C', 'D'];

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const summary = { courses: {}, updated: 0, skipped: 0, errors: [] };

    for (const course of courses) {
      const lessons = await base44.asServiceRole.entities.Lesson.filter(
        { sfi_course: course },
        'order',
        2000
      );

      let cUpdated = 0;
      let cSkipped = 0;

      for (const l of lessons) {
        const skill = inferSkill(l);
        const keep = SKILL_KEEP[skill];

        // Unknown skill → leave it alone (safer than wiping everything).
        if (!keep) { cSkipped++; continue; }

        const patch = {};
        for (const field of ALL_ACTIVITY_FIELDS) {
          const shouldKeep = keep.includes(field);
          const current = l[field];
          const hasValue = Array.isArray(current) && current.length > 0;

          if (!shouldKeep && hasValue) {
            patch[field] = [];
          }
        }

        if (Object.keys(patch).length === 0) { cSkipped++; continue; }

        try {
          await base44.asServiceRole.entities.Lesson.update(l.id, patch);
          cUpdated++;
        } catch (e) {
          summary.errors.push({ id: l.id, title: l.title, error: e.message });
          if (e.message?.includes('Rate limit')) await sleep(2000);
        }
        await sleep(80);
      }

      summary.courses[course] = { total: lessons.length, updated: cUpdated, skipped: cSkipped };
      summary.updated += cUpdated;
      summary.skipped += cSkipped;
    }

    summary.errors = summary.errors.slice(0, 10);
    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});