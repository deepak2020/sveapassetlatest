import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Direct seed - creates a few lessons and immediately reads them back
// to prove writes and reads hit the same DB
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Create 3 test lessons
    const testLessons = [
      { title: "Test Lesson 1", topic: "Test", sfi_course: "A", category: "vocabulary", skill: "vocabulary", level: "beginner", order: 9991 },
      { title: "Test Lesson 2", topic: "Test", sfi_course: "A", category: "grammar", skill: "grammar", level: "beginner", order: 9992 },
      { title: "Test Lesson 3", topic: "Test", sfi_course: "A", category: "reading", skill: "reading", level: "beginner", order: 9993 },
    ];

    const created = [];
    for (const lesson of testLessons) {
      const result = await base44.asServiceRole.entities.Lesson.create(lesson);
      created.push(result);
    }

    // Immediately read back
    const allLessons = await base44.asServiceRole.entities.Lesson.list("order", 200);

    return Response.json({
      created_count: created.length,
      created_ids: created.map(l => l.id),
      total_in_db: allLessons.length,
      sample: allLessons.slice(0, 5).map(l => ({ id: l.id, title: l.title, order: l.order })),
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});