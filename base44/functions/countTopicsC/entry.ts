import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const lessons = await base44.asServiceRole.entities.Lesson.filter({ sfi_course: 'C' }, 'order', 500);
    const topicCounts = {};
    for (const l of lessons) {
      const t = l.topic || '(no topic)';
      topicCounts[t] = (topicCounts[t] || 0) + 1;
    }
    const topics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => a.topic.localeCompare(b.topic));

    return Response.json({
      total_lessons: lessons.length,
      unique_topics: topics.length,
      topics,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});