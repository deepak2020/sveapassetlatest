import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { lesson_id } = body;

  if (!lesson_id) {
    return Response.json({ error: 'lesson_id required' }, { status: 400 });
  }

  const lesson = await base44.asServiceRole.entities.Lesson.get(lesson_id);
  if (!lesson) {
    return Response.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const { title, title_sv, sfi_course, category, skill, level } = lesson;

  // Fetch a few earlier lessons in the same course to use for review questions
  const allCourseLessons = await base44.asServiceRole.entities.Lesson.filter(
    { sfi_course, content__not: null },
    'order',
    10
  );
  const earlierLessons = allCourseLessons
    .filter(l => l.id !== lesson_id && l.word_pairs?.length > 0)
    .slice(0, 3);
  
  const reviewContext = earlierLessons.length > 0
    ? `\nFor review_questions, recycle vocabulary from these earlier lessons in Course ${sfi_course}:\n` +
      earlierLessons.map(l => `- "${l.title}": ${l.word_pairs.slice(0, 5).map(wp => `${wp.swedish} (${wp.english})`).join(', ')}`).join('\n')
    : '';

  const prompt = `You are an expert Swedish language teacher creating SFI (Svenska för Invandrare) course content.

Generate RICH, COMPREHENSIVE lesson content for:
- Title: "${title}" (${title_sv})
- SFI Course: ${sfi_course} (A=absolute beginner A1, B=elementary A2, C=intermediate B1, D=advanced B2)
- Category: ${category}
- Skill: ${skill}
- Level: ${level}

Requirements (be generous — more is better):
- content: 5-8 paragraphs of thorough markdown explanation. Include: introduction, key grammar rules with Swedish examples + English translations in parentheses, cultural/practical notes, common mistakes, and a summary. Use ## headers, **bold**, *italic*, and bullet lists.
- word_pairs: 15-20 items. Core vocabulary + related compound words and collocations.
- fill_in_blanks: 10-12 sentences. Varied difficulty. Realistic everyday Swedish. Each has 4 options.
- quiz_questions: 8-10 questions mixing vocabulary, grammar comprehension, and real-world usage.
- review_questions: 5-6 multiple-choice questions that recycle vocabulary and grammar from PREVIOUS lessons to reinforce prior learning. These questions should feel like a "warm-up" bridging old and new content.${reviewContext}
- writing_prompts: 3-4 items ranging from simple sentences to a short paragraph.
- speaking_phrases: 6-8 practical conversational phrases with pronunciation tips.
- All Swedish must be natural, modern, and correct.
- Calibrate ALL difficulty strictly to SFI ${sfi_course} level.`;

  const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Full lesson explanation in Markdown, 5-8 paragraphs" },
        word_pairs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              swedish: { type: "string" },
              english: { type: "string" },
              example_sv: { type: "string" },
              example_en: { type: "string" }
            }
          }
        },
        fill_in_blanks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              sentence_sv: { type: "string", description: "Swedish sentence with ___ for the blank" },
              sentence_en: { type: "string", description: "English translation with ___ for the blank" },
              answer: { type: "string" },
              options: { type: "array", items: { type: "string" }, description: "4 options including the correct answer" }
            }
          }
        },
        quiz_questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct_index: { type: "number" }
            }
          }
        },
        review_questions: {
          type: "array",
          description: "Questions recycling vocabulary/grammar from earlier lessons",
          items: {
            type: "object",
            properties: {
              question: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct_index: { type: "number" }
            }
          }
        },
        writing_prompts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              prompt: { type: "string" },
              hint: { type: "string" },
              example_answer: { type: "string" }
            }
          }
        },
        speaking_phrases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phrase_sv: { type: "string" },
              phrase_en: { type: "string" },
              pronunciation_tip: { type: "string" }
            }
          }
        }
      }
    }
  });

  // Sanitize: filter out any non-object items the AI may have returned
  const sanitizeArray = (arr) => (arr || []).filter(item => item && typeof item === 'object' && !Array.isArray(item));

  await base44.asServiceRole.entities.Lesson.update(lesson_id, {
    content: generated.content || null,
    word_pairs: sanitizeArray(generated.word_pairs),
    fill_in_blanks: sanitizeArray(generated.fill_in_blanks),
    quiz_questions: sanitizeArray(generated.quiz_questions),
    review_questions: sanitizeArray(generated.review_questions),
    writing_prompts: sanitizeArray(generated.writing_prompts),
    speaking_phrases: sanitizeArray(generated.speaking_phrases),
  });

  return Response.json({
    success: true,
    lesson_id,
    title,
    word_pairs: generated.word_pairs?.length || 0,
    fill_in_blanks: generated.fill_in_blanks?.length || 0,
    quiz_questions: generated.quiz_questions?.length || 0,
    review_questions: generated.review_questions?.length || 0,
    writing_prompts: generated.writing_prompts?.length || 0,
    speaking_phrases: generated.speaking_phrases?.length || 0,
  });
});