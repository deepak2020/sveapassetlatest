import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Generate one Kurs C lesson using Base44's InvokeLLM (integration credits)
// Payload: { topic: string, skill: string, lesson_index: number, model?: string }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { topic, skill, lesson_index, model } = await req.json();
    if (!topic || !skill || !lesson_index) {
      return Response.json({ error: 'Missing topic, skill, or lesson_index' }, { status: 400 });
    }

    const prompt = buildPrompt(topic, skill, lesson_index);
    const schema = buildSchema(skill);

    const raw = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      model: model || 'claude_sonnet_4_6',
    });

    // Some models return the data wrapped as { type, properties: {...} }
    const result = (raw && raw.type === 'object' && raw.properties) ? raw.properties : raw;

    if (!result?.title) {
      return Response.json({ error: 'LLM returned no title', raw }, { status: 500 });
    }

    const lesson = await base44.asServiceRole.entities.Lesson.create({
      ...result,
      sfi_course: 'C',
      level: 'intermediate',
      topic,
      skill,
      category: skill,
      order: lesson_index,
    });

    return Response.json({ ok: true, lesson_id: lesson.id, title: lesson.title });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildPrompt(topic, skill, lessonIndex) {
  return `ROLE
You are an expert Swedish-as-a-Second-Language (SFI) curriculum designer creating
bilingual Swedish↔English learning content for SFI Kurs C (CEFR A2 → B1 transition).
Learners have completed Kurs A and Kurs B. They can read basic Swedish, handle
everyday situations, and use present tense + simple past. Push them toward
independent communication: longer texts, opinions, subordinate clauses,
and society/work vocabulary.

LEVEL TARGET — Kurs C (A2 → B1)
- Vocabulary: ~1500–2500 most frequent Swedish words + topic-specific terms
- Grammar focus: preteritum (reg+irreg), perfekt with har/hade, bisatser (att, eftersom, när, om, fastän, medan, innan), BIFF-regeln, comparison of adjectives, modal verbs (kan/ska/måste/vill/får/borde/skulle), reflexive verbs, particle verbs, s-passiv, relative clauses with "som", futurum (ska/kommer att), conditional (om...så, skulle)
- Sentence length: 8–18 words, occasionally compound
- Tone: clear, friendly, real-world useful, culturally Swedish, modern "du" form

ASSUMED PRIOR KNOWLEDGE (Kurs A + B) — DO NOT RE-TEACH
- Present tense, basic preteritum of common verbs, perfekt with "har"
- Numbers, time, clock, dates, weekdays, months, weather basics
- Family, food, shopping, transport, hobbies, holidays — basic vocabulary
- Simple questions and statements, basic word order (V2 in main clauses)
- en/ett, basic plural forms, basic pronouns

INPUT
- topic: "${topic}"
- skill: "${skill}"
- lesson_index: ${lessonIndex}

RULES
- Every Swedish element MUST have an English counterpart.
- Use natural modern Swedish, "du" form.
- All word_pairs MUST connect to the topic — no generic filler.
- Reference Swedish institutions when natural: Skatteverket, Försäkringskassan, BankID, Swish, 1177, allemansrätt, fika.
- Grammar examples should illustrate Kurs C grammar focus.
- For skill = "grammar": content MUST clearly explain the grammar with a pattern table and 3+ examples.
- For skill = "reading": include a 150–250 word bilingual text inside "content" (Swedish first, then English).
- content: 300–500 words bilingual markdown. Each Swedish paragraph followed by English in *italics*. Include 2–4 example sentences with translations. End with a "Kom ihåg / Remember" bullet list of 3–5 takeaways.

COUNTS (strict)
- word_pairs: exactly 12 items
- fill_in_blanks: exactly 7 items
- quiz_questions: exactly 6 items
- match_pairs: exactly 8 pairs (drawn from word_pairs, shuffled)
- writing_prompts: exactly 3 (only if skill == "writing")
- speaking_phrases: exactly 10 (only if skill == "speaking")
- listening_phrases: exactly 8, mix of "transcribe" and "select" (only if skill == "listening")

Return ONLY the JSON object matching the provided schema. No commentary.`;
}

function buildSchema(skill) {
  const base = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      title_sv: { type: 'string' },
      content: { type: 'string' },
      word_pairs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            swedish: { type: 'string' },
            english: { type: 'string' },
            example_sv: { type: 'string' },
            example_en: { type: 'string' },
          },
          required: ['swedish', 'english', 'example_sv', 'example_en'],
        },
      },
      fill_in_blanks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sentence_sv: { type: 'string' },
            sentence_en: { type: 'string' },
            answer: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
          },
          required: ['sentence_sv', 'sentence_en', 'answer', 'options'],
        },
      },
      quiz_questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            question_sv: { type: 'string' },
            question_en: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            correct_index: { type: 'number' },
          },
          required: ['question_sv', 'question_en', 'options', 'correct_index'],
        },
      },
      match_pairs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            left: { type: 'string' },
            right: { type: 'string' },
          },
          required: ['left', 'right'],
        },
      },
    },
    required: ['title', 'title_sv', 'content', 'word_pairs', 'fill_in_blanks', 'quiz_questions', 'match_pairs'],
  };

  if (skill === 'writing') {
    base.properties.writing_prompts = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          prompt: { type: 'string' },
          hint: { type: 'string' },
          example_answer: { type: 'string' },
        },
        required: ['prompt', 'hint', 'example_answer'],
      },
    };
    base.required.push('writing_prompts');
  }

  if (skill === 'speaking') {
    base.properties.speaking_phrases = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phrase_sv: { type: 'string' },
          phrase_en: { type: 'string' },
          pronunciation_tip: { type: 'string' },
        },
        required: ['phrase_sv', 'phrase_en', 'pronunciation_tip'],
      },
    };
    base.required.push('speaking_phrases');
  }

  if (skill === 'listening') {
    base.properties.listening_phrases = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          phrase_sv: { type: 'string' },
          phrase_en: { type: 'string' },
          exercise_type: { type: 'string', enum: ['transcribe', 'select'] },
          options: { type: 'array', items: { type: 'string' } },
          correct_index: { type: 'number' },
        },
        required: ['phrase_sv', 'phrase_en', 'exercise_type'],
      },
    };
    base.required.push('listening_phrases');
  }

  return base;
}