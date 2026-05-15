import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { limit = 100, sfiLevel = 'A' } = await req.json();

    // Fetch Swedish sentences from Tatoeba API
    const response = await fetch('https://tatoeba.org/api_v0/search?from=swe&to=eng&limit=' + limit);
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch Tatoeba data' }, { status: 500 });
    }

    const data = await response.json();
    const sentences = data.results || [];

    if (sentences.length === 0) {
      return Response.json({ message: 'No sentences found' }, { status: 200 });
    }

    // Process and import sentences as cloze cards
    const imported = [];
    const errors = [];

    for (const sentence of sentences) {
      try {
        const sv = sentence.text;
        const en = sentence.translations?.[0]?.[0]?.text;

        if (!sv || !en) continue;

        // Simple word extraction for cloze
        const words = sv.split(/\s+/);
        if (words.length < 5) continue; // Skip short sentences

        const randomIdx = Math.floor(Math.random() * words.length);
        const answer = words[randomIdx];
        
        // Create sentence with blank
        const sentenceWithBlank = words.map((w, i) => i === randomIdx ? '___' : w).join(' ');

        // Extract common Swedish words for distractors
        const allWords = new Set(words);
        const distractors = Array.from(allWords)
          .filter(w => w !== answer && w.length > 3)
          .slice(0, 3);

        if (distractors.length < 3) continue; // Skip if not enough distractors

        const existing = await base44.asServiceRole.entities.ClozeSentence.list(
          undefined,
          1,
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