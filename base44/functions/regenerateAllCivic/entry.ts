import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await req.json().catch(() => ({}));
        const clearExisting = body.clear_existing === true;

        if (clearExisting) {
            const existing = await base44.asServiceRole.entities.CivicTopic.list('order', 500);
            for (const t of existing) {
                await base44.asServiceRole.entities.CivicTopic.delete(t.id);
            }
        }

        // Process all topics in batches via existing generateCivicContent function
        const BATCH_SIZE = 3;
        const TOTAL_TOPICS = 37;
        const results = { success: 0, failed: 0, errors: [], total: TOTAL_TOPICS };

        for (let start = 0; start < TOTAL_TOPICS; start += BATCH_SIZE) {
            try {
                const res = await base44.asServiceRole.functions.invoke('generateCivicContent', {
                    batch_start: start,
                    batch_size: BATCH_SIZE
                });
                const batchResults = res?.data?.results || [];
                for (const r of batchResults) {
                    if (r.success) results.success++;
                    else {
                        results.failed++;
                        results.errors.push({ title: r.title, error: r.error });
                    }
                }
            } catch (e) {
                results.failed += BATCH_SIZE;
                results.errors.push({ batch_start: start, error: e.message });
            }
        }

        return Response.json(results);
    } catch (error) {
        return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
});