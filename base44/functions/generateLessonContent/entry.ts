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

  const lessonResults = await base44.asServiceRole.entities.Lesson.filter({ id: lesson_id });
  const lesson = lessonResults[0];
  if (!lesson) {
    return Response.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const { title, title_sv, sfi_course, category, skill, level } = lesson;

  // Fetch earlier lessons for review context
  const allCourseLessons = await base44.asServiceRole.entities.Lesson.filter(
    { sfi_course },
    'order',
    10
  );
  const earlierLessons = allCourseLessons
    .filter(l => l.id !== lesson_id && l.word_pairs?.length > 0)
    .slice(0, 3);

  const reviewContext = earlierLessons.length > 0
    ? `\nFor review_questions, recycle vocabulary from these earlier lessons in Course ${sfi_course}:\n` +
      earlierLessons.map(l => `- "${l.title}": ${l.word_pairs.slice(0, 6).map(wp => `${wp.swedish} (${wp.english})`).join(', ')}`).join('\n')
    : '';

  const prompt = `You are an expert Swedish language teacher creating SFI (Svenska för Invandrare) course content. 

Your teaching philosophy blends TWO proven methodologies:
1. **Hermods SFI style**: Structured, curriculum-aligned content following Sweden's official SFI framework. Grammar is taught explicitly with clear rules, Swedish school system conventions, and formal exercises that mirror real SFI classroom materials. Sentences and vocabulary are carefully calibrated to the CEFR level.
2. **Babbel style**: Practical, real-life conversational learning. Every lesson is grounded in authentic everyday situations a new arrival in Sweden would actually face. Vocabulary and phrases are immediately usable. Dialogues feel natural, not textbook-stiff. Learning happens through context, not memorization.

Generate VERY RICH, COMPREHENSIVE lesson content for:
- Title: "${title}" (${title_sv})
- SFI Course: ${sfi_course} (A=absolute beginner A1, B=elementary A2, C=intermediate B1, D=advanced B2)
- Category: ${category}
- Skill: ${skill}
- Level: ${level}

ALL content must be 100% about the topic "${title}". Be generous — quantity AND quality matter.

=== CONTENT REQUIREMENTS ===

content: 6-8 paragraphs of thorough markdown in the **Hermods style** — structured with clear sections, grammar rules explained formally with Swedish examples + English translations in parentheses, cultural/practical notes about life in Sweden, common learner pitfalls, and a summary. Use ## headers, **bold**, *italic*, and bullet lists. Include at least one realistic dialogue or situational example in the **Babbel style** (natural, conversational, set in a real Swedish context like a shop, workplace, or phone call).

word_pairs: 18-22 items in the **Babbel style** — prioritize words a new arrival in Sweden genuinely needs TODAY. Include core vocabulary, compound words, collocations, and real phrases heard in daily Swedish life. Every item MUST have example_sv and example_en showing the word used naturally in context.

fill_in_blanks: 14-18 sentences blending both styles:
  - **Hermods**: Grammar-focused (correct verb form, article, adjective agreement, word order)
  - **Babbel**: Real-life context (sentences from situations like shopping, healthcare, workplace, transport)
  - Each has exactly 4 options with plausible distractors of the same word class.

quiz_questions: 12-15 questions using VARIED FORMATS:
  - "What does X mean in Swedish?" (vocabulary recall)
  - "Which sentence is grammatically correct?" (Hermods grammar focus)
  - "How would you say [real situation] in Swedish?" (Babbel practical focus)
  - "What is the plural/past tense/definite form of X?"
  - "Which word does NOT belong with the others?"
  - "Complete the dialogue: Person A says ___, what does Person B reply?" (Babbel conversational)
  - "What is the correct word order in this sentence?" (Hermods V2 rule etc.)
  - Reading a short 2-sentence Swedish paragraph and answering a comprehension question
  - Each question has 4 options.

review_questions: 6-8 questions recycling vocabulary/grammar from PREVIOUS lessons. Use varied question types (translation, grammar, usage). ${reviewContext}

writing_prompts: 5-6 items with INCREASING difficulty in the **Babbel style** — always rooted in realistic Swedish life situations:
  1. Write one sentence using [specific word from this lesson] in a real context
  2. Describe [simple topic-related everyday scenario] in 2-3 sentences
  3. Write a short dialogue (4-6 lines) about [topic-related real-life situation in Sweden]
  4. Write a short paragraph (4-6 sentences) describing [topic-related scenario]
  5. (For C/D levels) Write a formal text (email, letter, report) about [advanced topic-related Swedish context]
  Each prompt has a helpful hint and a full example_answer in natural, modern Swedish.

speaking_phrases: 8-10 practical conversational phrases in the **Babbel style** — things people actually say in Sweden related to this topic. Each has a pronunciation_tip focusing on Swedish sounds (vowels, sj-sound, pitch accent, etc.) in the **Hermods** explicit-instruction style.

match_pairs: 10-12 pairs for a matching exercise. Mix of:
  - Swedish word → English translation
  - Swedish sentence → English meaning  
  - Swedish question → correct Swedish answer
  Each pair: { left: string, right: string }

All Swedish must be natural, modern standard Swedish (Rikssvenska). Calibrate ALL difficulty strictly to SFI ${sfi_course} level. Avoid overly formal or archaic Swedish — write how educated Swedes actually speak and write today.`;

  const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: "claude_sonnet_4_6",
    response_json_schema: {
      type: "object",
      properties: {
        content: { type: "string" },
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
              sentence_sv: { type: "string" },
              sentence_en: { type: "string" },
              answer: { type: "string" },
              options: { type: "array", items: { type: "string" } }
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
        },
        match_pairs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              left: { type: "string" },
              right: { type: "string" }
            }
          }
        }
      }
    }
  });

  const sanitizeArray = (arr) => (arr || []).filter(item => item && typeof item === 'object' && !Array.isArray(item));

  await base44.asServiceRole.entities.Lesson.update(lesson_id, {
    content: generated.content || null,
    word_pairs: sanitizeArray(generated.word_pairs),
    fill_in_blanks: sanitizeArray(generated.fill_in_blanks),
    quiz_questions: sanitizeArray(generated.quiz_questions),
    review_questions: sanitizeArray(generated.review_questions),
    writing_prompts: sanitizeArray(generated.writing_prompts),
    speaking_phrases: sanitizeArray(generated.speaking_phrases),
    match_pairs: sanitizeArray(generated.match_pairs),
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
    match_pairs: generated.match_pairs?.length || 0,
  });
});