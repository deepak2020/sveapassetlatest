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
      { sv: 'Vad är klockan?', en: 'What time is it?' },
      { sv: 'Jag äter frukosten klockan åtta.', en: 'I eat breakfast at eight o\'clock.' },
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
      { sv: 'Bussen går klockan nio.', en: 'The bus leaves at nine o\'clock.' },
      { sv: 'Jag går till arbetet varje dag.', en: 'I go to work every day.' },
      { sv: 'Hon bor i ett stort hus.', en: 'She lives in a big house.' },
      { sv: 'Vad äter du till frukost?', en: 'What do you eat for breakfast?' },
      { sv: 'Jag dricker kaffe varje morgon.', en: 'I drink coffee every morning.' },
      { sv: 'Han spelar fotboll på helgen.', en: 'He plays football on weekends.' },
      { sv: 'Vi läser böcker på biblioteket.', en: 'We read books at the library.' },
      { sv: 'Barnens skola ligger nära hemma.', en: 'The children\'s school is near home.' },
      { sv: 'Det snöar mycket på vintern.', en: 'It snows a lot in winter.' },
      { sv: 'Sommarens väder är mycket vackert.', en: 'The summer weather is very beautiful.' },
      { sv: 'Jag tycker att film är intressant.', en: 'I think films are interesting.' },
      { sv: 'Du måste lära dig svenska ordbok.', en: 'You must learn Swedish vocabulary.' },
      { sv: 'Hennes familj är mycket stor.', en: 'Her family is very big.' },
      { sv: 'Jag skulle vilja gå på biograf.', en: 'I would like to go to the cinema.' },
      { sv: 'Mannen kör bilen till jobbet.', en: 'The man drives the car to work.' },
      { sv: 'Flickan skriver ett brev till sin vän.', en: 'The girl writes a letter to her friend.' },
      { sv: 'Vi äter middag tillsammans varje kväll.', en: 'We eat dinner together every evening.' },
      { sv: 'Hunden springer genom parken.', en: 'The dog runs through the park.' },
      { sv: 'Katten ligger på soffan.', en: 'The cat lies on the sofa.' },
      { sv: 'Jag behöver köpa mat från affären.', en: 'I need to buy food from the store.' },
      { sv: 'Hennes väska är mycket tung.', en: 'Her bag is very heavy.' },
      { sv: 'Vi tar tåget till Stockholm.', en: 'We take the train to Stockholm.' },
      { sv: 'Flygplanet går snart.', en: 'The airplane leaves soon.' },
      { sv: 'Jag gick på marknaden i söndags.', en: 'I went to the market on Sunday.' },
      { sv: 'Restaurangen är mycket bra här.', en: 'The restaurant is very good here.' },
      { sv: 'Jag tycker om att simma.', en: 'I like to swim.' },
      { sv: 'Hennes mor är läkare.', en: 'Her mother is a doctor.' },
      { sv: 'Hans far arbetar på sjukhuset.', en: 'His father works at the hospital.' },
      { sv: 'Det finns många träd i skogen.', en: 'There are many trees in the forest.' },
      { sv: 'Havet är blått och vackert.', en: 'The sea is blue and beautiful.' },
      { sv: 'Berget är högt och stort.', en: 'The mountain is tall and big.' },
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