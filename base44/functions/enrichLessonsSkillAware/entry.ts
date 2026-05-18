import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Skill-aware enrichment for lessons.
// Each lesson is filled with activity content ONLY for its primary skill,
// so Vocabulary / Grammar / Reading / Writing / Speaking / Listening
// lessons in the same topic no longer share identical exercises.
//
// Within a topic, content of the same skill is shared across lessons of that
// skill (rarely more than one per topic, but harmless if there are several).
//
// Mapping (skill -> activity fields enriched):
//   vocabulary -> word_pairs, match_pairs
//   grammar    -> fill_in_blanks
//   reading    -> quiz_questions only (content stays untouched)
//   writing    -> writing_prompts
//   speaking   -> speaking_phrases
//   listening  -> listening_phrases
//
// Body: { course: "A" | "B" | "C" | "D" }  (required)

const SKILL_FIELDS = {
  vocabulary: ['word_pairs', 'match_pairs'],
  grammar: ['fill_in_blanks'],
  reading: ['quiz_questions'],
  writing: ['writing_prompts'],
  speaking: ['speaking_phrases'],
  listening: ['listening_phrases'],
};

const CAPS = {
  word_pairs: 12,
  match_pairs: 8,
  fill_in_blanks: 5,
  quiz_questions: 5,
  writing_prompts: 4,
  speaking_phrases: 8,
  listening_phrases: 6,
};

function inferSkill(lesson) {
  return (lesson.skill || lesson.category || '').toLowerCase();
}

function dedupeBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(item);
    }
  }
  return out;
}

function poolKey(field, item) {
  if (field === 'word_pairs') return item?.swedish;
  if (field === 'match_pairs') return `${item?.left}|${item?.right}`;
  if (field === 'fill_in_blanks') return item?.sentence_sv;
  if (field === 'quiz_questions') return item?.question_sv;
  if (field === 'writing_prompts') return item?.prompt;
  if (field === 'speaking_phrases') return item?.phrase_sv;
  if (field === 'listening_phrases') return item?.phrase_sv;
  return JSON.stringify(item);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let body = {};
    try { body = await req.json(); } catch { /* ok */ }
    const course = body.course;
    if (!course || !['A', 'B', 'C', 'D'].includes(course)) {
      return Response.json({ error: 'Body must include course: "A"|"B"|"C"|"D"' }, { status: 400 });
    }

    const all = await base44.asServiceRole.entities.Lesson.filter(
      { sfi_course: course },
      'order',
      2000
    );

    // Group by topic
    const byTopic = {};
    for (const l of all) {
      const t = l.topic || 'misc';
      if (!byTopic[t]) byTopic[t] = [];
      byTopic[t].push(l);
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const topic of Object.keys(byTopic)) {
      const lessons = byTopic[topic];

      // Build per-skill pools from the existing content in this topic
      // (each lesson only contributes to its own skill's pool).
      const pools = {}; // skill -> field -> array
      for (const l of lessons) {
        const skill = inferSkill(l);
        const fields = SKILL_FIELDS[skill];
        if (!fields) continue;
        if (!pools[skill]) pools[skill] = {};
        for (const f of fields) {
          if (!pools[skill][f]) pools[skill][f] = [];
          for (const item of l[f] || []) pools[skill][f].push(item);
        }
      }

      // Dedupe + cap each pool
      for (const skill of Object.keys(pools)) {
        for (const f of Object.keys(pools[skill])) {
          pools[skill][f] = dedupeBy(pools[skill][f], (it) => poolKey(f, it)).slice(0, CAPS[f]);
        }
      }

      // Apply: for each lesson, fill ONLY its own skill's empty fields
      for (const l of lessons) {
        const skill = inferSkill(l);
        const fields = SKILL_FIELDS[skill];
        if (!fields) { skipped++; continue; }

        const pool = pools[skill] || {};
        const patch = {};
        for (const f of fields) {
          const hasValue = Array.isArray(l[f]) && l[f].length > 0;
          if (!hasValue && pool[f] && pool[f].length) {
            patch[f] = pool[f];
          }
        }

        if (Object.keys(patch).length === 0) { skipped++; continue; }

        try {
          await base44.asServiceRole.entities.Lesson.update(l.id, patch);
          updated++;
        } catch (e) {
          errors.push({ id: l.id, title: l.title, error: e.message });
          if (e.message?.includes('Rate limit')) await sleep(2000);
        }
        await sleep(100);
      }
    }

    return Response.json({
      course,
      total_lessons: all.length,
      topics: Object.keys(byTopic).length,
      updated,
      skipped,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});