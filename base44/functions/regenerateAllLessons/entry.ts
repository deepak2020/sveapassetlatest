import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Short-lived endpoint. The frontend drives the loop to avoid 504 timeouts.
// Two modes:
//   { list_only: true, only_missing?, course?, limit? } -> returns { ids: [...], total }
//   { lesson_id: "..." }                                -> regenerates one lesson
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));

        // Mode 1: list target lessons
        if (body.list_only === true) {
            const onlyMissing = body.only_missing === true;
            const courseFilter = body.course;
            const limit = parseInt(body.limit || '0', 10);

            const allLessons = await base44.asServiceRole.entities.Lesson.list('order', 500);
            let targets = allLessons;
            if (courseFilter) targets = targets.filter((l) => l.sfi_course === courseFilter);
            if (onlyMissing) targets = targets.filter((l) => !l.content && (!l.fill_in_blanks || l.fill_in_blanks.length === 0));
            if (limit > 0) targets = targets.slice(0, limit);

            return Response.json({
                ids: targets.map((l) => ({ id: l.id, title: l.title })),
                total: targets.length
            });
        }

        // Mode 2: regenerate one lesson
        if (!body.lesson_id) {
            return Response.json({ error: 'lesson_id required' }, { status: 400 });
        }

        try {
            await base44.asServiceRole.functions.invoke('generateLessonContent', { lesson_id: body.lesson_id });
            return Response.json({ success: true, lesson_id: body.lesson_id });
        } catch (e) {
            return Response.json({ success: false, lesson_id: body.lesson_id, error: e.message });
        }
    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});