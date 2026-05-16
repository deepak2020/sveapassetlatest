import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Short-lived endpoint. The frontend drives the loop to avoid 504 timeouts.
// Two modes:
//   { clear_only: true }                    -> deletes all existing CivicTopic records, returns { cleared, total: 37 }
//   { batch_start: number, batch_size?: n } -> generates one small batch via generateCivicContent
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const TOTAL_TOPICS = 37;

        // Mode 1: clear all existing topics
        if (body.clear_only === true) {
            const existing = await base44.asServiceRole.entities.CivicTopic.list('order', 500);
            for (const t of existing) {
                await base44.asServiceRole.entities.CivicTopic.delete(t.id);
            }
            return Response.json({ cleared: existing.length, total: TOTAL_TOPICS });
        }

        // Mode 2: generate one batch
        const batch_start = Number(body.batch_start ?? 0);
        const batch_size = Number(body.batch_size ?? 2);

        const res = await base44.asServiceRole.functions.invoke('generateCivicContent', {
            batch_start,
            batch_size
        });

        const batchResults = res?.data?.results || [];
        let success = 0, failed = 0;
        const errors = [];
        for (const r of batchResults) {
            if (r.success) success++;
            else {
                failed++;
                errors.push({ title: r.title, error: r.error });
            }
        }

        const nextStart = batch_start + batch_size;
        const hasMore = nextStart < TOTAL_TOPICS;

        return Response.json({
            batch_start,
            batch_size,
            success,
            failed,
            errors,
            total: TOTAL_TOPICS,
            hasMore,
            nextBatch: hasMore ? nextStart : null
        });
    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});