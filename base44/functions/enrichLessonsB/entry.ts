import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Enrich every Kurs B lesson by sharing vocab + quiz + fill-ins + match pairs
// across the skill lessons of each topic. Keeps each lesson's primary skill,
// just adds extra activities where empty.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const all = await base44.asServiceRole.entities.Lesson.filter(
      { sfi_course: 'B' },
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
    const errors = [];

    for (const topic of Object.keys(byTopic)) {
      const lessons = byTopic[topic];

      const sharedWordPairs = [];
      const sharedMatch = [];
      const sharedQuiz = [];
      const sharedFill = [];
      const seenSv = new Set();

      for (const l of lessons) {
        for (const wp of l.word_pairs || []) {
          if (wp?.swedish && !seenSv.has(wp.swedish)) {
            seenSv.add(wp.swedish);
            sharedWordPairs.push(wp);
          }
        }
        for (const m of l.match_pairs || []) sharedMatch.push(m);
        for (const q of l.quiz_questions || []) sharedQuiz.push(q);
        for (const f of l.fill_in_blanks || []) sharedFill.push(f);
      }

      const capWords = sharedWordPairs.slice(0, 12);
      const capQuiz = sharedQuiz.slice(0, 5);
      const capFill = sharedFill.slice(0, 5);
      const capMatch = sharedMatch.slice(0, 8);

      for (const l of lessons) {
        const patch = {};

        if ((!l.word_pairs || l.word_pairs.length === 0) && capWords.length) {
          patch.word_pairs = capWords;
        }
        if ((!l.quiz_questions || l.quiz_questions.length === 0) && capQuiz.length) {
          patch.quiz_questions = capQuiz;
        }
        if ((!l.fill_in_blanks || l.fill_in_blanks.length === 0) && capFill.length) {
          patch.fill_in_blanks = capFill;
        }
        if ((!l.match_pairs || l.match_pairs.length === 0) && capMatch.length) {
          patch.match_pairs = capMatch;
        }

        if (Object.keys(patch).length === 0) continue;

        try {
          await base44.asServiceRole.entities.Lesson.update(l.id, patch);
          updated++;
        } catch (e) {
          errors.push({ id: l.id, title: l.title, error: e.message });
          if (e.message?.includes('Rate limit')) await sleep(2000);
        }
        await sleep(120);
      }
    }

    return Response.json({
      total_lessons: all.length,
      topics: Object.keys(byTopic).length,
      updated,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});