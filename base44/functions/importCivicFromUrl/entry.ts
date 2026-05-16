import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FILE_URL = 'https://media.base44.com/files/public/6a05a8cd3d89f28998abebbd/e29c18f10_sverige_i_fokus_topics.json';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const res = await fetch(FILE_URL);
    if (!res.ok) {
      return Response.json({ error: `Failed to fetch file: ${res.status}` }, { status: 500 });
    }
    const topics = await res.json();

    // Get all existing titles (lowercase) for dedup
    const existing = await base44.asServiceRole.entities.CivicTopic.list('-created_date', 1000);
    const existingTitles = new Set(existing.map(t => (t.title || '').toLowerCase().trim()));

    const toCreate = topics.filter(t => !existingTitles.has((t.title || '').toLowerCase().trim()));

    let created = 0;
    const errors = [];
    for (const topic of toCreate) {
      try {
        await base44.asServiceRole.entities.CivicTopic.create(topic);
        created++;
      } catch (e) {
        errors.push({ title: topic.title, error: e.message });
      }
    }

    return Response.json({
      total_in_file: topics.length,
      already_existed: topics.length - toCreate.length,
      created,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});