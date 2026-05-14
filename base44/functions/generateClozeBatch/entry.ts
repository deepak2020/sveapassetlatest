import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Full batch plan: level -> topics -> batches_per_topic
const BATCH_PLAN = {
  A: {
    batches_per_topic: 5,
    topics: [
      "Greetings & introductions", "Numbers & counting", "Colors & shapes",
      "Family members", "Food & drink", "Daily routines",
      "Time & dates", "Weather", "Body parts", "Simple directions"
    ]
  },
  B: {
    batches_per_topic: 5,
    topics: [
      "Shopping & money", "Public transport", "Healthcare basics",
      "Housing & home", "School & education", "Work & jobs",
      "Hobbies & free time", "Swedish geography", "Culture & traditions",
      "Rights & everyday law"
    ]
  },
  C: {
    batches_per_topic: 10,
    topics: [
      "Swedish grammar (verb conjugation)", "Swedish grammar (articles & gender)",
      "Swedish grammar (adjectives & agreement)", "Swedish grammar (subordinate clauses)",
      "Swedish grammar (tenses)", "Swedish democracy & Riksdag",
      "Swedish society & welfare", "Healthcare system", "Education system",
      "Rights & discrimination law", "Economy & taxes",
      "Culture (Nobel, ABBA, Astrid Lindgren)", "Environment & climate",
      "Swedish history 1800-1945", "Civic knowledge general"
    ]
  },
  D: {
    batches_per_topic: 10,
    topics: [
      "Swedish constitution (grundlagarna)", "Government & lawmaking process",
      "Labour market & LAS", "Unions & collective agreements",
      "Media freedom & offentlighetsprincipen", "Criminal law & courts",
      "Social services & welfare rights", "Swedish history 1945-present",
      "Climate policy & legislation", "Advanced grammar (modal particles)",
      "Advanced grammar (passive constructions)", "Advanced grammar (negation in clauses)",
      "Citizenship test prep - democracy", "Citizenship test prep - society",
      "Citizenship test prep - history & culture"
    ]
  }
};

function isValid(s) {
  return (
    typeof s.sentence_sv === 'string' && s.sentence_sv.includes('___') &&
    typeof s.sentence_en === 'string' && s.sentence_en.includes('___') &&
    typeof s.answer === 'string' && s.answer.length > 0 && s.answer.length < 50 &&
    Array.isArray(s.distractors) && s.distractors.length === 3 &&
    ['A', 'B', 'C', 'D'].includes(s.sfi_level) &&
    typeof s.topic === 'string' && s.topic.length > 0
  );
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Get total existing sentences count
  const allSentences = await base44.asServiceRole.entities.ClozeSentence.list();
  const totalExisting = allSentences.length;

  if (totalExisting >= 20000) {
    return Response.json({ message: "Goal reached: 20,000 sentences already exist.", total: totalExisting });
  }

  // Find the next pending job
  const pendingJobs = await base44.asServiceRole.entities.GenerationJob.filter({ status: "pending" }, "created_date", 1);

  let job = pendingJobs[0];

  // If no pending jobs exist yet, seed all jobs
  if (!job) {
    const existingJobs = await base44.asServiceRole.entities.GenerationJob.list();
    if (existingJobs.length === 0) {
      // Seed all jobs
      const jobsToCreate = [];
      for (const [level, config] of Object.entries(BATCH_PLAN)) {
        for (const topic of config.topics) {
          for (let batch = 1; batch <= config.batches_per_topic; batch++) {
            jobsToCreate.push({ level, topic, batch_number: batch, status: "pending", sentences_generated: 0 });
          }
        }
      }
      await base44.asServiceRole.entities.GenerationJob.bulkCreate(jobsToCreate);
      return Response.json({ message: `Seeded ${jobsToCreate.length} jobs. Run again to start generating.`, total: totalExisting });
    }
    return Response.json({ message: "All jobs complete or no pending jobs.", total: totalExisting });
  }

  // Mark job as running
  await base44.asServiceRole.entities.GenerationJob.update(job.id, { status: "running" });

  // Call Anthropic API
  const prompt = `Generate exactly 50 Swedish cloze (fill-in-the-blank) sentences.
Level: ${job.level}  (A=absolute beginner, B=elementary, C=intermediate, D=advanced)
Topic: ${job.topic}

Each sentence must follow this EXACT JSON schema — return ONLY a raw JSON array, no markdown:
[
  {
    "sentence_sv": "Swedish sentence with ___ for the blank",
    "sentence_en": "English translation with ___ for the blank",
    "answer": "correct missing word (single word or max 3-word phrase)",
    "distractors": ["wrong1", "wrong2", "wrong3"],
    "sfi_level": "${job.level}",
    "topic": "${job.topic}",
    "word_frequency_rank": <integer 1-1000, lower=more common>,
    "grammar_note": "short grammar tip" or null
  }
]

Rules:
- All 50 sentences must be unique
- Distractors must be same part of speech as answer, plausible but clearly wrong in context
- Sentences must be natural modern Swedish used in everyday life
- grammar_note on ~30% of sentences, null on the rest
- Level calibration:
  A: single clause, top-200 vocabulary, very simple structure
  B: 1-2 clause sentences, everyday vocabulary, basic grammar patterns
  C: multi-clause, civic/grammar topics, intermediate vocabulary
  D: complex sentences, formal register, advanced civic and legal vocabulary
- Return ONLY the JSON array. No explanation. No markdown fences.`;

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
    await base44.asServiceRole.entities.GenerationJob.update(job.id, { status: "failed", error: err.slice(0, 500) });
    return Response.json({ error: "Anthropic API error", details: err.slice(0, 500) }, { status: 500 });
  }

  const data = await apiRes.json();
  const text = data.content[0].text.trim();

  let sentences;
  try {
    sentences = JSON.parse(text);
  } catch (e) {
    // Try to extract JSON array from response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      sentences = JSON.parse(match[0]);
    } else {
      await base44.asServiceRole.entities.GenerationJob.update(job.id, { status: "failed", error: "JSON parse error: " + e.message });
      return Response.json({ error: "Failed to parse JSON", raw: text.slice(0, 200) }, { status: 500 });
    }
  }

  // Validate
  const valid = sentences.filter(isValid);

  // Get existing sentence_sv values to deduplicate
  const existingSvs = new Set(allSentences.map(s => s.sentence_sv));

  // Filter duplicates
  const newSentences = valid.filter(s => !existingSvs.has(s.sentence_sv));

  // Save in bulk
  if (newSentences.length > 0) {
    await base44.asServiceRole.entities.ClozeSentence.bulkCreate(newSentences);
  }

  await base44.asServiceRole.entities.GenerationJob.update(job.id, {
    status: "done",
    sentences_generated: newSentences.length
  });

  const newTotal = totalExisting + newSentences.length;

  return Response.json({
    job: `${job.level} / ${job.topic} / batch ${job.batch_number}`,
    generated: sentences.length,
    valid: valid.length,
    saved: newSentences.length,
    total_sentences: newTotal,
    remaining_jobs: pendingJobs.length - 1
  });
});