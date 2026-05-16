import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const topics = await base44.asServiceRole.entities.CivicTopic.list('order', 500);
  return Response.json({
    count: topics.length,
    sample: topics.slice(0, 3).map(t => ({
      id: t.id,
      title: t.title,
      chapter: t.chapter,
      has_content: !!t.content,
      content_length: t.content?.length || 0,
      key_facts_count: t.key_facts?.length || 0,
      quiz_count: t.quiz_questions?.length || 0,
    })),
    titles: topics.map(t => t.title),
  });
});