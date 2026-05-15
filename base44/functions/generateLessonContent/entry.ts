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

Return ONLY a raw JSON object (no markdown, no fences) with this exact structure:

{
  "content": "Full lesson content in Markdown. Include: a clear explanation in English, Swedish examples with translations, grammar rules if applicable, and usage tips. 3-5 paragraphs.",
  "word_pairs": [
    {
      "swedish": "Swedish word/phrase",
      "english": "English translation",
      "example_sv": "Example sentence in Swedish",
      "example_en": "English translation of example"
    }
  ],
  "fill_in_blanks": [
    {
      "sentence_sv": "Swedish sentence with ___ for the blank",
      "sentence_en": "English translation with ___ for the blank",
      "answer": "correct word",
      "options": ["correct word", "wrong1", "wrong2", "wrong3"]
    }
  ],
  "quiz_questions": [
    {
      "question": "Quiz question in English",
      "options": ["option A", "option B", "option C", "option D"],
      "correct_index": 0
    }
  ],
  "writing_prompts": [
    {
      "prompt": "Writing task in English",
      "hint": "Helpful hint in Swedish",
      "example_answer": "Example answer in Swedish"
    }
  ],
  "speaking_phrases": [
    {
      "phrase_sv": "Swedish phrase to practice",
      "phrase_en": "English meaning",
      "pronunciation_tip": "How to pronounce key sounds"
    }
  ]
}

Requirements:
- word_pairs: 8-12 items, all relevant to the lesson topic
- fill_in_blanks: 6-8 items, varied grammar structures, distractors are same part of speech
- quiz_questions: 5-6 items testing comprehension of the lesson
- writing_prompts: 2-3 items appropriate to the SFI level
- speaking_phrases: 4-6 useful phrases from the topic
- All Swedish must be natural, modern, correct
- Calibrate difficulty strictly to SFI ${sfi_course} level
- Return ONLY the JSON object. No explanation. No markdown.`;

  const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY"),
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!apiRes.ok) {
    const err = await apiRes.text();
    return Response.json({ error: "Anthropic API error", details: err.slice(0, 500) }, { status: 500 });
  }

  const data = await apiRes.json();
  const text = data.content[0].text.trim();

  let generated;
  try {
    generated = JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      generated = JSON.parse(match[0]);
    } else {
      return Response.json({ error: "JSON parse error", raw: text.slice(0, 300) }, { status: 500 });
    }
  }

  // Update the lesson with generated content
  await base44.asServiceRole.entities.Lesson.update(lesson_id, {
    content: generated.content || null,
    word_pairs: generated.word_pairs || [],
    fill_in_blanks: generated.fill_in_blanks || [],
    quiz_questions: generated.quiz_questions || [],
    writing_prompts: generated.writing_prompts || [],
    speaking_phrases: generated.speaking_phrases || [],
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