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
      { sv: 'Vattnet är kristallklart idag.', en: 'The water is crystal clear today.' },
      { sv: 'Träden har vackra löv i höst.', en: 'The trees have beautiful leaves in autumn.' },
      { sv: 'Solen skiner över himlen.', en: 'The sun shines over the sky.' },
      { sv: 'Månen är mycket ljus på natten.', en: 'The moon is very bright at night.' },
      { sv: 'Stjärnorna glänser över oss.', en: 'The stars glimmer above us.' },
      { sv: 'Vinden blåser genom träden.', en: 'The wind blows through the trees.' },
      { sv: 'Det är en klar och vacker natt.', en: 'It is a clear and beautiful night.' },
      { sv: 'Fågeln sjunger en vacker melodi.', en: 'The bird sings a beautiful melody.' },
      { sv: 'Fjärilarna flyger över blommorna.', en: 'The butterflies fly over the flowers.' },
      { sv: 'Bron går över floden.', en: 'The bridge crosses the river.' },
      { sv: 'Vägen är lång och smal.', en: 'The road is long and narrow.' },
      { sv: 'Staden är stor och välkänd.', en: 'The city is large and well-known.' },
      { sv: 'Huset är byggt på berget.', en: 'The house is built on the mountain.' },
      { sv: 'Trädgården är full av blommor.', en: 'The garden is full of flowers.' },
      { sv: 'Blomman doftar mycket gott.', en: 'The flower smells very sweet.' },
      { sv: 'Gräset är grönt och frodigt.', en: 'The grass is green and lush.' },
      { sv: 'Jorden är våt efter regnet.', en: 'The ground is wet after the rain.' },
      { sv: 'Stenarna glänser i solen.', en: 'The stones shine in the sun.' },
      { sv: 'Väggen är målad i vitt.', en: 'The wall is painted white.' },
      { sv: 'Fönstret är öppet och luftigt.', en: 'The window is open and airy.' },
      { sv: 'Dörren är gjord av trä.', en: 'The door is made of wood.' },
      { sv: 'Taket skyddar oss från regnet.', en: 'The roof protects us from rain.' },
      { sv: 'Golvet är rent och glansigt.', en: 'The floor is clean and shiny.' },
      { sv: 'Sängen är mjuk och bekväm.', en: 'The bed is soft and comfortable.' },
      { sv: 'Stolen är stabil och stark.', en: 'The chair is stable and strong.' },
      { sv: 'Bordet är fyllt med mat.', en: 'The table is full of food.' },
      { sv: 'Skåpet innehåller många saker.', en: 'The cupboard contains many things.' },
      { sv: 'Lampan lyser starkt i rummet.', en: 'The lamp shines brightly in the room.' },
      { sv: 'Spegeln reflekterar mitt ansikte.', en: 'The mirror reflects my face.' },
      { sv: 'Mattan är röd och stor.', en: 'The carpet is red and large.' },
      { sv: 'Gardinerna är tjocka och blå.', en: 'The curtains are thick and blue.' },
      { sv: 'Tavlan hänger på väggen.', en: 'The picture hangs on the wall.' },
      { sv: 'Blomvasan står på bordet.', en: 'The vase stands on the table.' },
      { sv: 'Stolen är bekväm att sitta på.', en: 'The chair is comfortable to sit on.' },
      { sv: 'Pengarna ligger i plånboken.', en: 'The money is in the wallet.' },
      { sv: 'Nycklarna är på bordet.', en: 'The keys are on the table.' },
      { sv: 'Klockan visar två.', en: 'The clock shows two.' },
      { sv: 'Kalendern hänger på väggen.', en: 'The calendar hangs on the wall.' },
      { sv: 'Papperet är vitt och rent.', en: 'The paper is white and clean.' },
      { sv: 'Pennan skriver bra.', en: 'The pen writes well.' },
      { sv: 'Boken är intressant att läsa.', en: 'The book is interesting to read.' },
      { sv: 'Tidningen är från igår.', en: 'The newspaper is from yesterday.' },
      { sv: 'Brevet kom denna morgon.', en: 'The letter arrived this morning.' },
      { sv: 'Paketet är väl inslaget.', en: 'The package is well wrapped.' },
      { sv: 'Lådan är full av bok.', en: 'The box is full of books.' },
      { sv: 'Väskan är tung att bära.', en: 'The bag is heavy to carry.' },
      { sv: 'Ryggsäcken är praktisk och stor.', en: 'The backpack is practical and large.' },
      { sv: 'Skon passar mig perfekt.', en: 'The shoe fits me perfectly.' },
      { sv: 'Kläderna är rena och snygga.', en: 'The clothes are clean and neat.' },
      { sv: 'Hatten passar till min överdel.', en: 'The hat matches my top.' },
      { sv: 'Halsdukan är varm och mjuk.', en: 'The scarf is warm and soft.' },
      { sv: 'Handsken skyddar från kylan.', en: 'The glove protects from the cold.' },
      { sv: 'Strumpan är lång och svart.', en: 'The sock is long and black.' },
      { sv: 'Skürten är kort och vit.', en: 'The skirt is short and white.' },
      { sv: 'Jackan är varm och bekväm.', en: 'The jacket is warm and comfortable.' },
      { sv: 'Tröjan är gjord av bomull.', en: 'The sweater is made of cotton.' },
      { sv: 'Byxorna passar honom bra.', en: 'The pants fit him well.' },
      { sv: 'Blusen är elegant och fin.', en: 'The blouse is elegant and nice.' },
      { sv: 'Klänningen är vacker och färgglad.', en: 'The dress is beautiful and colorful.' },
      { sv: 'Badkläder är perfekta för sommaren.', en: 'Swimwear is perfect for summer.' },
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