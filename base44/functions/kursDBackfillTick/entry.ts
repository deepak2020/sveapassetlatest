import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Scheduled dispatcher: generates ONE missing Kurs D lesson per invocation.
// Picks the first topic with missing skills, then the first missing skill.
// Inlines the generation logic so it works under scheduler (no user) context.

const TOPICS = [
  'Arbetslivet i Sverige',
  'Utbildning och vidareutbildning',
  'Demokrati och samhällsdebatt',
  'Hälsa och sjukvårdssystemet',
  'Miljö och hållbar utveckling',
  'Ekonomi och privatekonomi',
  'Lagar, rättigheter och skyldigheter',
  'Integration och mångkultur',
  'Media och informationskällor',
  'Teknik och digitalisering',
  'Kultur, konst och litteratur',
  'Sveriges historia och samhällsutveckling',
  'EU och internationella relationer',
  'Jämställdhet och sociala frågor',
  'Framtid, karriär och livsval',
];

const SKILLS = ['vocabulary', 'grammar', 'reading', 'writing', 'speaking', 'listening'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Load all existing Kurs D lessons
    const existing = await base44.asServiceRole.entities.Lesson.filter({ sfi_course: 'D' }, '-created_date', 500);
    const have = new Set(existing.map((l) => `${l.topic}::${l.skill}`));

    // Find next missing (topic, skill)
    let nextTopic = null;
    let nextSkill = null;
    let nextIndex = 0;
    outer: for (const topic of TOPICS) {
      for (let i = 0; i < SKILLS.length; i++) {
        const skill = SKILLS[i];
        if (!have.has(`${topic}::${skill}`)) {
          nextTopic = topic;
          nextSkill = skill;
          nextIndex = i + 1;
          break outer;
        }
      }
    }

    if (!nextTopic) {
      return Response.json({ ok: true, done: true, total: existing.length, message: 'All 90 Kurs D lessons exist' });
    }

    // Generate the lesson inline
    const prompt = buildPrompt(nextTopic, nextSkill, nextIndex);
    const schema = buildSchema(nextSkill);
    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      model: 'claude_sonnet_4_6',
    });

    let result = raw;
    if (result && typeof result.response === 'string') {
      try { result = JSON.parse(result.response); } catch (_) {}
    } else if (result && result.response && typeof result.response === 'object') {
      result = result.response;
    }
    if (result && result.type === 'object' && result.properties) result = result.properties;

    if (!result?.title) {
      return Response.json({ ok: false, error: 'LLM returned no title', topic: nextTopic, skill: nextSkill, raw_keys: Object.keys(raw || {}) }, { status: 500 });
    }

    const lesson = await base44.asServiceRole.entities.Lesson.create({
      ...result,
      sfi_course: 'D',
      level: 'advanced',
      topic: nextTopic,
      skill: nextSkill,
      category: nextSkill,
      order: nextIndex,
    });

    return Response.json({
      ok: true,
      created: { topic: nextTopic, skill: nextSkill, lesson_id: lesson.id, title: lesson.title },
      progress: `${existing.length + 1}/90`,
      remaining: 90 - existing.length - 1,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});

function buildPrompt(topic, skill, lessonIndex) {
  return `ROLE
You are an expert Swedish-as-a-Second-Language (SFI) curriculum designer creating
bilingual Swedish↔English learning content for SFI Kurs D — the most advanced SFI
level (CEFR B1+ → B2 transition). Learners have completed Kurs A, B, and C.

LEVEL TARGET — Kurs D (B1+ → B2)
- Vocabulary: ~3000–5000 words including abstract, formal, academic and professional terms
- Grammar focus: advanced bisatser, s-passiv vs bli-passiv, conditional (om...så skulle),
  konjunktiv (vore, finge), perfekt particip as adjective, partikelverb,
  satsadverbial placement, nominalisations, complex sentence linking
  (däremot, följaktligen, å andra sidan, trots att, i och med att, eftersom, även om),
  formal register vs informal, indirect speech, reported attitudes
- Sentence length: 12–25+ words, frequently compound and complex
- Tone: nuanced, mature, often formal; suitable for workplace, university, news media

ASSUMED PRIOR KNOWLEDGE (Kurs A + B + C) — DO NOT RE-TEACH
- All basic + intermediate grammar
- Everyday topics: family, food, shopping, transport, work, health, housing
- Society basics: Skatteverket, Försäkringskassan, BankID, Swish, 1177, allemansrätt

INPUT
- topic: "${topic}"
- skill: "${skill}"
- lesson_index: ${lessonIndex}

RULES
- Every Swedish element MUST have an English counterpart.
- Use natural modern Swedish with appropriate formal register for Kurs D.
- All word_pairs MUST connect to the topic — no generic filler.
- Reference real Swedish institutions when natural: Riksdagen, regeringen,
  Arbetsförmedlingen, CSN, fackförbund, kollektivavtal, deklaration, BankID, EU.
- For skill = "grammar": explain advanced grammar with a pattern table, 4+ examples, contrast with simpler forms.
- For skill = "reading": include a 200–350 word bilingual text inside "content" (Swedish first, then English in italics). Use nyhetsartikel, debattartikel, ledare, faktatext.
- For skill = "writing": prompts require structured, formal output — CV, personligt brev, formell e-post, klagomål, debattartikel, sammanfattning.
- For skill = "speaking": phrases include opinion-giving, argumentation, professional small talk, meetings.
- For skill = "listening": realistic scenarios — radio nyheter, möten, intervjuer, instruktioner.
- content: 350–600 words bilingual markdown. Each Swedish paragraph followed by English in *italics*. 3–5 example sentences with translations. End with "Kom ihåg / Remember" bullet list of 4–6 takeaways.

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
          properties: { left: { type: 'string' }, right: { type: 'string' } },
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