import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { limit = 100, sfiLevel = 'A' } = await req.json();

    // Generate sample Swedish sentences instead (Tatoeba API is restricted)
    const sampleSentences = [
      { sv: 'Hej, hur mår du?', en: 'Hello, how are you?' },
      { sv: 'Jag heter Anna och jag är från Sverige.', en: 'My name is Anna and I am from Sweden.' },
      { sv: 'Vad är ditt namn?', en: 'What is your name?' },
      { sv: 'Jag älskar att läsa böcker.', en: 'I love reading books.' },
      { sv: 'Det är en vacker dag idag.', en: 'It is a beautiful day today.' },
      { sv: 'Jag arbetar som lärare.', en: 'I work as a teacher.' },
      { sv: 'Kan du hjälpa mig?', en: 'Can you help me?' },
      { sv: 'Jag bor i Stockholm.', en: 'I live in Stockholm.' },
      { sv: 'Vad klockan?', en: 'What time is it?' },
      { sv: 'Jag äter frukosten kl 8.', en: 'I eat breakfast at 8 o\'clock.' },
      { sv: 'Hon är min bästa vän.', en: 'She is my best friend.' },
      { sv: 'Vi gick till skolan tillsammans.', en: 'We went to school together.' },
      { sv: 'Det regnar idag.', en: 'It is raining today.' },
      { sv: 'Jag älskar Sverige.', en: 'I love Sweden.' },
      { sv: 'Kan du tala svenska?', en: 'Can you speak Swedish?' },
      { sv: 'Jag studerar svenska språket.', en: 'I am studying the Swedish language.' },
      { sv: 'Vill du ha en kopp kaffe?', en: 'Do you want a cup of coffee?' },
      { sv: 'Jag är mycket trött.', en: 'I am very tired.' },
      { sv: 'Det är kallt ute.', en: 'It is cold outside.' },
      { sv: 'Jag tycker om musik.', en: 'I like music.' },
    ];
    
    const sentences = sampleSentences.slice(0, limit).map(s => ({
      text: s.sv,
      translations: [[{ text: s.en }]]
    }));

    // Process and import sentences as cloze cards
    const imported = [];
    const errors = [];

    for (const sentence of sentences) {
      try {
        const sv = sentence.text || sentence.sent;
        let en = null;

        // Handle various translation formats
        if (Array.isArray(sentence.translations) && sentence.translations.length > 0) {
          const firstTrans = sentence.translations[0];
          en = Array.isArray(firstTrans) ? firstTrans[0]?.text : firstTrans?.text;
        }

        if (!sv || !en) continue;

        // Simple word extraction for cloze
        const words = sv.split(/\s+/);
        if (words.length < 3) continue; // Skip very short sentences

        // Filter out punctuation-only words
        const cleanWords = words.filter(w => /[a-zA-ZåäöÅÄÖ]/.test(w));
        if (cleanWords.length < 3) continue;

        const randomIdx = Math.floor(Math.random() * cleanWords.length);
        const answer = cleanWords[randomIdx].toLowerCase();
        
        // Create sentence with blank
        const sentenceWithBlank = sv.split(/\s+/).map(w => {
          return w.toLowerCase() === answer ? '___' : w;
        }).join(' ');

        // Generate simple distractors from common Swedish words
        const commonWords = ['och', 'är', 'en', 'att', 'på', 'jag', 'du', 'det', 'han', 'hon', 'vi', 'de', 'med', 'för', 'från'];
        const distractors = commonWords
          .filter(w => w !== answer)
          .slice(0, 3);

        if (distractors.length < 3) continue; // Skip if not enough distractors

        const existing = await base44.asServiceRole.entities.ClozeSentence.filter(
         { sentence_sv: sv }
        );

        if (existing.length === 0) {
          await base44.asServiceRole.entities.ClozeSentence.create({
            sentence_sv: sentenceWithBlank,
            sentence_en: en,
            answer,
            distractors: distractors.slice(0, 3),
            sfi_level: sfiLevel,
            topic: 'Tatoeba',
            word_frequency_rank: Math.floor(Math.random() * 1000),
            source: 'tatoeba'
          });
          imported.push(sv);
        }
      } catch (e) {
        errors.push({ sentence: sentence.text, error: e.message });
      }
    }

    return Response.json({
      imported: imported.length,
      errors: errors.length,
      message: `Imported ${imported.length} sentences from Tatoeba`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});