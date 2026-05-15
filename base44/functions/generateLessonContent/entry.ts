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

  const prompt = `You are an expert Swedish language teacher creating SFI (Swedish for Immigrants) course content.

Generate complete lesson content for:
- Title: "${title}" (${title_sv})
- SFI Course: ${sfi_course} (A=absolute beginner A1, B=elementary A2, C=intermediate B1, D=advanced B2)
- Category: ${category}
- Skill: ${skill}
- Level: ${level}

Requirements:
- word_pairs: 8-12 items, all relevant to the lesson topic
- fill_in_blanks: 6-8 items, varied grammar structures, distractors are same part of speech
- quiz_questions: 5-6 items testing comprehension of the lesson
- writing_prompts: 2-3 items appropriate to the SFI level
- speaking_phrases: 4-6 useful phrases from the topic
- All Swedish must be natural, modern, correct
- Calibrate difficulty strictly to SFI ${sfi_course} level`;

  const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Full lesson explanation in Markdown, 3-5 paragraphs in English with Swedish examples" },
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
    writing_prompts: generated.writing_prompts?.length || 0,
    speaking_phrases: generated.speaking_phrases?.length || 0,
  });
});