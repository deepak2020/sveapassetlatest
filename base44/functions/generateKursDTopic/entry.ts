import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Generate all 6 skill lessons for ONE Kurs D topic in sequence.
// Payload: { topic: string, model?: string }
// Skips skills that already exist for that topic (resumable).
const SKILLS = ['vocabulary', 'grammar', 'reading', 'writing', 'speaking', 'listening'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { topic, model } = await req.json();
    if (!topic) {
      return Response.json({ error: 'Missing topic' }, { status: 400 });
    }

    // Find which skills already exist for this topic in Kurs D
    const existing = await base44.asServiceRole.entities.Lesson.filter({
      sfi_course: 'D',
      topic,
    });
    const existingSkills = new Set(existing.map((l) => l.skill));

    const results = [];
    for (let i = 0; i < SKILLS.length; i++) {
      const skill = SKILLS[i];
      if (existingSkills.has(skill)) {
        results.push({ skill, status: 'skipped' });
        continue;
      }

      const res = await base44.functions.invoke('generateKursDLesson', {
        topic,
        skill,
        lesson_index: i + 1,
        model,
      });

      const data = res?.data || res;
      results.push({ skill, status: data?.ok ? 'created' : 'error', ...data });
    }

    return Response.json({ ok: true, topic, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});