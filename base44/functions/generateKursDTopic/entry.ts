import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Generate all 6 skill lessons for ONE Kurs D topic in sequence.
// Payload: { topic: string, model?: string }
// Skips skills that already exist for that topic (resumable).
const SKILLS = ['vocabulary', 'grammar', 'reading', 'writing', 'speaking', 'listening'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { topic, model } = await req.json();
    if (!topic) {
      return Response.json({ error: 'Missing topic' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Lesson.filter({
      sfi_course: 'D',
      topic,
    });
    const existingSkills = new Set(existing.map((l) => l.skill));

    const results = [];
    for (let i = 0; i < SKILLS.length; i++) {
      const skill = SKILLS[i];
      if (existingSkills.has(skill)) {
        results.push({ skill, status: 'skipped' });
        continue;
      }

      try {
        const prompt = buildPrompt(topic, skill, i + 1);
        const schema = buildSchema(skill);
        const raw = await base44.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: schema,
          model: model || 'claude_sonnet_4_6',
        });

        let result = raw;
        if (result && typeof result.response === 'string') {
          try { result = JSON.parse(result.response); } catch (_) {}
        } else if (result && result.response && typeof result.response === 'object') {
          result = result.response;
        }
        if (result && result.type === 'object' && result.properties) result = result.properties;

        if (!result?.title) {
          results.push({ skill, status: 'error', error: 'no title' });
          continue;
        }

        const lesson = await base44.asServiceRole.entities.Lesson.create({
          ...result,
          sfi_course: 'D',
          level: 'advanced',
          topic,
          skill,
          category: skill,
          order: i + 1,
        });
        results.push({ skill, status: 'created', lesson_id: lesson.id, title: lesson.title });
      } catch (err) {
        results.push({ skill, status: 'error', error: err.message });
      }
    }

    return Response.json({ ok: true, topic, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildPrompt(topic, skill, lessonIndex) {
  return `ROLE
You are an expert Swedish-as-a-Second-Language (SFI) curriculum designer creating
bilingual Swedish↔English learning content for SFI Kurs D — the most advanced SFI
level (CEFR B1+ → B2 transition). Learners have completed Kurs A, B, and C. They
can already hold everyday conversations, read longer texts, and use most basic
grammar correctly. Push them toward independent, nuanced communication for
working life, higher studies, and full societal participation in Sweden.

LEVEL TARGET — Kurs D (B1+ → B2)
- Vocabulary: ~3000–5000 words including abstract, formal, academic and professional terms
- Grammar focus: advanced bisatser, s-passiv vs bli-passiv, conditional (om...så skulle),
  konjunktiv (vore, finge), perfekt particip as adjective, partikelverb,
  satsadverbial placement, nominalisations, complex sentence linking
  (däremot, följaktligen, å andra sidan, trots att, i och med att, eftersom, även om),
  formal register vs informal, indirect speech (han sa att...), reported attitudes
- Sentence length: 12–25+ words, frequently compound and complex
- Tone: nuanced, mature, often formal; suitable for workplace, university, news media

ASSUMED PRIOR KNOWLEDGE (Kurs A + B + C) — DO NOT RE-TEACH
- All basic + intermediate grammar (present, preteritum, perfekt, futurum,
  modal verbs, bisatser, BIFF, comparison, relative clauses, basic s-passiv)
- Everyday topics: family, food, shopping, transport, work, health, housing
- Society basics: Skatteverket, Försäkringskassan, BankID, Swish, 1177, allemansrätt
- Common Kurs C vocabulary around work, opinions, and society

INPUT
- topic: "${topic}"
- skill: "${skill}"
- lesson_index: ${lessonIndex}

RULES
- Every Swedish element MUST have an English counterpart.
- Use natural modern Swedish with appropriate formal register for Kurs D.
- All word_pairs MUST connect to the topic — no generic filler. Prefer abstract,
  professional, or societal vocabulary over everyday basics.
- Reference real Swedish institutions and practices when natural: Riksdagen,
  regeringen, Arbetsförmedlingen, CSN, fackförbund, kollektivavtal, deklaration,
  personnummer, BankID, Försäkringskassan, EU, FN, kommun/region/stat.
- Grammar examples should illustrate Kurs D grammar focus (see above).
- For skill = "grammar": content MUST clearly explain the advanced grammar point
  with a pattern table, 4+ examples, and a contrast with simpler forms learners already know.
- For skill = "reading": include a 200–350 word bilingual text inside "content"
  (Swedish first, then English). Use authentic genres: nyhetsartikel, debattartikel,
  ledare, faktatext, populärvetenskap.
- For skill = "writing": prompts should require structured, formal output —
  CV, personligt brev, formell e-post, klagomål, debattartikel, sammanfattning.
- For skill = "speaking": phrases should include opinion-giving, argumentation,
  professional small talk, presentations, meetings.
- For skill = "listening": include realistic scenarios — radio nyheter, möten,
  intervjuer, instruktioner på arbetsplats.
- content: 350–600 words bilingual markdown. Each Swedish paragraph followed by
  English in *italics*. Include 3–5 example sentences with translations.
  End with a "Kom ihåg / Remember" bullet list of 4–6 takeaways.

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