import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const url = new URL(req.url);
        const onlyMissing = url.searchParams.get('only_missing') === 'true';
        const courseFilter = url.searchParams.get('course'); // optional: A, B, C, D
        const limit = parseInt(url.searchParams.get('limit') || '0', 10);

        const allLessons = await base44.asServiceRole.entities.Lesson.list('order', 500);

        let targets = allLessons;
        if (courseFilter) {
            targets = targets.filter((l) => l.sfi_course === courseFilter);
        }
        if (onlyMissing) {
            targets = targets.filter((l) => !l.content && (!l.fill_in_blanks || l.fill_in_blanks.length === 0));
        }
        if (limit > 0) {
            targets = targets.slice(0, limit);
        }

        const results = { success: 0, failed: 0, errors: [], total: targets.length };

        for (const lesson of targets) {
            try {
                await base44.asServiceRole.functions.invoke('generateLessonContent', { lesson_id: lesson.id });
                results.success++;
            } catch (e) {
                results.failed++;
                results.errors.push({ id: lesson.id, title: lesson.title, error: e.message });
            }
        }

        return Response.json(results);
    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});