import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// All civic topics derived from informationsverige.se/sv/om-sverige.html
const CIVIC_TOPICS = [
  // Att komma till Sverige → government / history
  { title: "Sverige – en demokrati och rättsstat", category: "government", order: 1 },
  { title: "Sveriges historia", category: "history", order: 2 },
  { title: "Välfärdsstaten", category: "society", order: 3 },
  { title: "Mänskliga rättigheter och jämställdhet", category: "rights_duties", order: 4 },
  { title: "Att invandra till Sverige", category: "society", order: 5 },
  { title: "Identitet och kultur", category: "culture", order: 6 },
  // Att bo i Sverige
  { title: "Hur bor människor i Sverige?", category: "society", order: 7 },
  { title: "Rättigheter och skyldigheter i ditt boende", category: "rights_duties", order: 8 },
  { title: "Kontakt med myndigheter", category: "government", order: 9 },
  { title: "Din säkerhet och polisens roll", category: "society", order: 10 },
  { title: "Kultur och fritid i Sverige", category: "culture", order: 11 },
  { title: "Människa och miljö", category: "society", order: 12 },
  // Att försörja sig
  { title: "Arbetsmarknaden i Sverige", category: "society", order: 13 },
  { title: "Att söka arbete", category: "society", order: 14 },
  { title: "Skatt och deklaration", category: "government", order: 15 },
  { title: "Utbildning för vuxna i Sverige", category: "society", order: 16 },
  { title: "Din ekonomi och konsumenträtt", category: "rights_duties", order: 17 },
  // Individens rättigheter och skyldigheter
  { title: "Vad är mänskliga rättigheter?", category: "rights_duties", order: 18 },
  { title: "Kvinnors rättigheter och jämställdhet", category: "rights_duties", order: 19 },
  { title: "Barnets rättigheter", category: "rights_duties", order: 20 },
  { title: "Diskriminering och dina rättigheter", category: "rights_duties", order: 21 },
  { title: "Religionsfrihet i Sverige", category: "rights_duties", order: 22 },
  // Att påverka i Sverige
  { title: "Vad är demokrati?", category: "government", order: 23 },
  { title: "Så styrs Sverige", category: "government", order: 24 },
  { title: "Det svenska valsystemet", category: "government", order: 25 },
  { title: "Källkritik och media", category: "society", order: 26 },
  // Att vårda sin hälsa
  { title: "Sjukvården i Sverige", category: "society", order: 27 },
  { title: "Rättigheter i mötet med vården", category: "rights_duties", order: 28 },
  // Att bilda familj
  { title: "Familjelivet i Sverige", category: "culture", order: 29 },
  { title: "Det svenska skolsystemet", category: "society", order: 30 },
  { title: "Socialtjänsten och familjestöd", category: "society", order: 31 },
  // Att åldras i Sverige
  { title: "Pension och ekonomiskt stöd för äldre", category: "society", order: 32 },
  { title: "Sveriges geografi och regioner", category: "geography", order: 33 },
];

async function generateOneTopic(base44, topic) {
  const prompt = `You are an expert on Swedish society and civic education for newly arrived immigrants (samhällsorientering / SO).

Generate comprehensive educational content about the following topic from the official Swedish civic curriculum (informationsverige.se):

Topic: "${topic.title}"
Category: ${topic.category}

This content will be used to help new arrivals in Sweden prepare for their samhällsorientering and understand Swedish society.

Generate:

content: Rich markdown (6-8 paragraphs) covering:
- What this topic means in Sweden (facts, laws, institutions)
- How it affects daily life for a new arrival
- Specific practical information (numbers, names of agencies, procedures)
- A real-life scenario or example
- Cultural context / comparison with international norms where relevant
Use ## headers, **bold**, bullet lists. Write in English but include Swedish terms in *italics* with translations.

key_facts: 6-8 concise, memorable facts about this topic. Each fact should be a clear statement and detail that a new arrival MUST know. Use concrete specifics (e.g. exact agency names, numbers, percentages, ages, laws).

quiz_questions: 10-12 varied questions testing knowledge of this topic.
For EACH question, provide:
- question_sv: The question in Swedish
- question_en: The SAME question translated to English
- options: 4 answer choices (in Swedish)
- correct_index: 0-3, the index of the correct answer

Examples of question types:
- "What is the name of the agency responsible for X?" / "Vad heter myndigheten som ansvarar för X?"
- "How does Y work in Sweden?" / "Hur fungerar Y i Sverige?"
- "True or false: ..." / "Sant eller falskt: ..."
- "Which of these is a right/responsibility in Sweden?" / "Vilket av dessa är en rättighet/skyldighet i Sverige?"
- "What should you do if...?" / "Vad bör du göra om...?"

All content must be accurate, practical, and directly relevant to someone newly arrived in Sweden.`;

  const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        content: { type: "string" },
        key_facts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              fact: { type: "string" },
              detail: { type: "string" }
            }
          }
        },
        quiz_questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_sv: { type: "string" },
              question_en: { type: "string" },
              options: { type: "array", items: { type: "string" } },
              correct_index: { type: "number" }
            }
          }
        }
      }
    }
  });

  return generated;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { topic_index, batch_start = 0, batch_size = 3 } = body;

  let toGenerate;
  if (topic_index !== undefined) {
    toGenerate = [CIVIC_TOPICS[topic_index]].filter(Boolean);
  } else {
    // Generate in batches to avoid timeout
    const end = Math.min(batch_start + batch_size, CIVIC_TOPICS.length);
    toGenerate = CIVIC_TOPICS.slice(batch_start, end);
  }

  const results = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const topic = toGenerate[i];
    console.log(`[generateCivicContent] Generating: ${topic.title}`);
    try {
      const data = await generateOneTopic(base44, topic);

      const sanitize = (arr) => Array.isArray(arr) ? arr.filter(x => x && typeof x === 'object') : [];

      const created = await base44.asServiceRole.entities.CivicTopic.create({
        title: topic.title,
        category: topic.category,
        order: topic.order,
        content: data.content || null,
        key_facts: sanitize(data.key_facts),
        quiz_questions: sanitize(data.quiz_questions),
      });

      results.push({ title: topic.title, id: created.id, success: true });
      console.log(`[generateCivicContent] Done: ${topic.title}`);
    } catch (e) {
      console.error(`[generateCivicContent] Failed: ${topic.title}`, e.message);
      results.push({ title: topic.title, success: false, error: e.message });
    }
  }

  const hasMore = batch_start + batch_size < CIVIC_TOPICS.length;
  return Response.json({ 
    results, 
    batch: { start: batch_start, size: batch_size, total: CIVIC_TOPICS.length },
    hasMore,
    nextBatch: hasMore ? batch_start + batch_size : null
  });
});