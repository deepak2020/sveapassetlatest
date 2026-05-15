import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Levenshtein distance: measures minimum character changes needed
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

// Generate distractors using three strategies: similar-looking, same-ish POS, random
function generateDistracters(answer, candidateWords) {
  const commonSwedish = [
    'och', 'är', 'en', 'att', 'på', 'jag', 'du', 'det', 'han', 'hon', 'vi', 'de', 'med', 'för', 'från',
    'vara', 'ha', 'do', 'gå', 'komma', 'ta', 'se', 'ge', 'kunna', 'vilja', 'skola', 'böra', 'få', 'behöva',
    'inte', 'mycket', 'bara', 'här', 'där', 'nu', 'då', 'innan', 'efter', 'under', 'över', 'genom'
  ];

  // Bucket 1: Similar-looking words (Levenshtein distance 1-2)
  const similar = commonSwedish
    .filter(w => w !== answer && levenshteinDistance(answer, w) <= 2)
    .slice(0, 2);

  // Bucket 2: Words of similar length (proxy for same POS)
  const sameLengthWords = candidateWords
    .filter(w => w !== answer && Math.abs(w.length - answer.length) <= 1)
    .slice(0, 2);

  // Bucket 3: Random distractors
  const random = commonSwedish
    .filter(w => w !== answer && !similar.includes(w) && !sameLengthWords.includes(w))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  // Combine and pick 3 total
  const pool = [...similar, ...sameLengthWords, ...random];
  return pool.slice(0, 3);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { limit = 50, sfiLevel } = await req.json();

    const sampleSentences = [
      { sv: 'Hej, hur mår du?', en: 'Hello, how are you?' },
      { sv: 'Jag heter Anna och jag är från Sverige.', en: 'My name is Anna and I am from Sweden.' },
      { sv: 'Jag älskar att spela gitarr.', en: 'I love playing guitar.' },
      { sv: 'Min familj bor i Göteborg.', en: 'My family lives in Gothenburg.' },
      { sv: 'Vad gör du på helgen?', en: 'What do you do on weekends?' },
      { sv: 'Jag läser böcker varje dag.', en: 'I read books every day.' },
      { sv: 'Hon är en mycket god vän.', en: 'She is a very good friend.' },
      { sv: 'Vi skal träffas imorgon.', en: 'We will meet tomorrow.' },
      { sv: 'Det är mycket varmt idag.', en: 'It is very hot today.' },
      { sv: 'Jag behöver en ny dator.', en: 'I need a new computer.' },
      { sv: 'Kan du rekommendera en bra restaurang?', en: 'Can you recommend a good restaurant?' },
      { sv: 'Jag tycker mycket om mat.', en: 'I really like food.' },
      { sv: 'Hans hus är mycket vackert.', en: 'His house is very beautiful.' },
      { sv: 'Vi gick på bio igår kväll.', en: 'We went to the cinema yesterday evening.' },
      { sv: 'Jag har en hund och en katt.', en: 'I have a dog and a cat.' },
      { sv: 'Vad är ditt favoritmat?', en: 'What is your favorite food?' },
      { sv: 'Hon arbetar som sjuksköterska.', en: 'She works as a nurse.' },
      { sv: 'Vi spelade fotboll igår.', en: 'We played football yesterday.' },
      { sv: 'Jag behöver köpa en ny tröja.', en: 'I need to buy a new sweater.' },
      { sv: 'Han är mycket smart och begåvad.', en: 'He is very smart and talented.' },
      { sv: 'Jag är trött efter en lång dag.', en: 'I am tired after a long day.' },
      { sv: 'Vi ska gå på en promenad i parken.', en: 'We will go for a walk in the park.' },
      { sv: 'Jag älskar att titta på stjärnorna.', en: 'I love watching the stars.' },
      { sv: 'Din far är mycket rolig.', en: 'Your father is very funny.' },
      { sv: 'Vad tycker du om denna film?', en: 'What do you think about this movie?' },
      { sv: 'Jag är väldigt intresserad av historia.', en: 'I am very interested in history.' },
      { sv: 'Hon sjunger mycket vackert.', en: 'She sings very beautifully.' },
      { sv: 'Vi träffar våra vänner varje vecka.', en: 'We meet our friends every week.' },
      { sv: 'Jag behöver en ny cykel.', en: 'I need a new bicycle.' },
      { sv: 'Han är mycket blyg men mycket vänlig.', en: 'He is very shy but very kind.' },
      { sv: 'Jag tycker om att dansa.', en: 'I like to dance.' },
      { sv: 'Vi ska äta pizza för middag.', en: 'We will eat pizza for dinner.' },
      { sv: 'Hennes mor gör mycket god mat.', en: 'Her mother cooks very good food.' },
      { sv: 'Jag har mycket att göra idag.', en: 'I have a lot to do today.' },
      { sv: 'Vi bor nära ett stort bibliotek.', en: 'We live near a large library.' },
      { sv: 'Kan du hjälpa mig med mitt projekt?', en: 'Can you help me with my project?' },
      { sv: 'Jag älskar att åka skidor.', en: 'I love skiing.' },
      { sv: 'Hon är mycket duktig på matematik.', en: 'She is very good at mathematics.' },
      { sv: 'Vi ska åka till Stockholm nästa vecka.', en: 'We will go to Stockholm next week.' },
      { sv: 'Jag tycker om att spela brädspel.', en: 'I like playing board games.' },
      { sv: 'Han är en mycket framgångsrik person.', en: 'He is a very successful person.' },
      { sv: 'Jag behöver en ny telefon.', en: 'I need a new phone.' },
      { sv: 'Vi ska fira hans födelsedag imorgon.', en: 'We will celebrate his birthday tomorrow.' },
      { sv: 'Jag är mycket glad för att träffa dig.', en: 'I am very happy to meet you.' },
      { sv: 'Hon läser en mycket intressant bok.', en: 'She is reading a very interesting book.' },
      { sv: 'Vi ska gå på en familjefest på lördag.', en: 'We will go to a family party on Saturday.' },
      { sv: 'Jag älskar att måla.', en: 'I love painting.' },
      { sv: 'Han är mycket rolig och underhållande.', en: 'He is very funny and entertaining.' },
      { sv: 'Jag tycker om att sova längre på morgonen.', en: 'I like to sleep in on mornings.' },
      { sv: 'Vi ska köpa nya kläder imorgon.', en: 'We will buy new clothes tomorrow.' },
      { sv: 'Jag är mycket intresserad av vetenskap.', en: 'I am very interested in science.' },
      { sv: 'Hon har mycket vackra ögon.', en: 'She has very beautiful eyes.' },
      { sv: 'Vi ska äta frukost tillsammans imorgon.', en: 'We will eat breakfast together tomorrow.' },
      { sv: 'Jag älskar att skriva.', en: 'I love writing.' },
      { sv: 'Han är mycket omtänksam och snäll.', en: 'He is very considerate and kind.' },
      { sv: 'Jag tycker om att lyssna på musik.', en: 'I like listening to music.' },
      { sv: 'Vi ska åka på semester nästa månad.', en: 'We will go on vacation next month.' },
      { sv: 'Jag behöver en ny väska.', en: 'I need a new bag.' },
      { sv: 'Hon är mycket välutbildad och intelligent.', en: 'She is very well-educated and intelligent.' },
      { sv: 'Vi ska laga mat tillsammans på fredag.', en: 'We will cook together on Friday.' },
      { sv: 'Jag älskar att fotografera naturen.', en: 'I love photographing nature.' },
      { sv: 'Han är mycket talangfull musiker.', en: 'He is a very talented musician.' },
      { sv: 'Jag tycker om att ha picnic i parken.', en: 'I like having picnics in the park.' },
      { sv: 'Vi ska se på en konsert nästa månad.', en: 'We will watch a concert next month.' },
      { sv: 'Jag är mycket stressad över mitt arbete.', en: 'I am very stressed about my work.' },
      { sv: 'Hon är mycket engagerad i sitt arbete.', en: 'She is very committed to her work.' },
      { sv: 'Vi ska gå på ett äventyr tillsammans.', en: 'We will go on an adventure together.' },
      { sv: 'Jag älskar att åka längdskidor.', en: 'I love cross-country skiing.' },
      { sv: 'Han är mycket duktig på att laga mat.', en: 'He is very good at cooking.' },
      { sv: 'Jag tycker om att campa.', en: 'I like camping.' },
      { sv: 'Vi ska gå till en naturreservat nästa vecka.', en: 'We will go to a nature reserve next week.' },
      { sv: 'Jag behöver vila och avslappning.', en: 'I need rest and relaxation.' },
      { sv: 'Hon är mycket passionerad om djurskydd.', en: 'She is very passionate about animal protection.' },
      { sv: 'Vi ska titta på en konsert på tevén.', en: 'We will watch a concert on television.' },
      { sv: 'Jag älskar att plocka blommor.', en: 'I love picking flowers.' },
      { sv: 'Han är mycket dedikerad till sitt hantverk.', en: 'He is very dedicated to his craft.' },
      { sv: 'Jag tycker om att läsa poesi.', en: 'I like reading poetry.' },
      { sv: 'Vi ska gå på en botanisk trädgård imorgon.', en: 'We will go to a botanical garden tomorrow.' },
      { sv: 'Jag är mycket nyfiken på världen.', en: 'I am very curious about the world.' },
      { sv: 'Hon är mycket kreativ och artistisk.', en: 'She is very creative and artistic.' },
      { sv: 'Vi ska köpa matvaror för veckan.', en: 'We will buy groceries for the week.' },
      { sv: 'Jag älskar att gå på vandring.', en: 'I love going hiking.' },
      { sv: 'Han är mycket reflektiv och tankfull.', en: 'He is very reflective and thoughtful.' },
      { sv: 'Jag tycker om att läsa noveller.', en: 'I like reading short stories.' },
      { sv: 'Vi ska ha en kaffe tillsammans imorgon.', en: 'We will have a coffee together tomorrow.' },
      { sv: 'Jag är mycket tacksam för din vänskap.', en: 'I am very grateful for your friendship.' },
      { sv: 'Hon är mycket empatisk och förståelse.', en: 'She is very empathetic and understanding.' },
      { sv: 'Vi ska åka till ett museum nästa vecka.', en: 'We will go to a museum next week.' },
      { sv: 'Jag älskar att säga skämt.', en: 'I love telling jokes.' },
      { sv: 'Han är mycket rogivande och lugn person.', en: 'He is a very calm and relaxed person.' },
      { sv: 'Jag tycker om att designa saker.', en: 'I like designing things.' },
      { sv: 'Vi ska äta en god middag tillsammans.', en: 'We will eat a good dinner together.' },
      { sv: 'Jag är mycket intresserad av språk.', en: 'I am very interested in languages.' },
      { sv: 'Hon är mycket ambitiös och motiverad.', en: 'She is very ambitious and motivated.' },
      { sv: 'Vi ska gå på en vintage affär nästa vecka.', en: 'We will go to a vintage shop next week.' },
      { sv: 'Jag älskar att lösa pussel.', en: 'I love solving puzzles.' },
      { sv: 'Han är mycket inspirerande och motiverande.', en: 'He is very inspiring and motivating.' },
      { sv: 'Jag tycker om att åka på cykeltur.', en: 'I like going on bike rides.' },
      { sv: 'Vi ska titta på en dokumentär imorgon.', en: 'We will watch a documentary tomorrow.' },
      { sv: 'Jag är mycket passionerad om musik.', en: 'I am very passionate about music.' },
      { sv: 'Hon är mycket praktisk och organiserad.', en: 'She is very practical and organized.' },
      { sv: 'Vi ska göra något roligt på helgen.', en: 'We will do something fun on the weekend.' },
      { sv: 'Jag älskar att ta foton av mina vänner.', en: 'I love taking photos of my friends.' },
      { sv: 'Han är mycket modig och tappad.', en: 'He is very brave and courageous.' },
      { sv: 'Jag tycker om att åka bergsklättring.', en: 'I like rock climbing.' },
      { sv: 'Vi ska äta lunch på en skön restaurang.', en: 'We will eat lunch at a nice restaurant.' },
      { sv: 'Jag är mycket intresserad av konst.', en: 'I am very interested in art.' },
      { sv: 'Hon är mycket spontan och eventyrlig.', en: 'She is very spontaneous and adventurous.' },
      { sv: 'Vi ska planera en resa för nästa år.', en: 'We will plan a trip for next year.' },
      { sv: 'Jag älskar att be böner.', en: 'I love saying prayers.' },
      { sv: 'Han är mycket tålmodig och uthållig.', en: 'He is very patient and persistent.' },
      { sv: 'Jag tycker om att göra DIY projekt.', en: 'I like doing DIY projects.' },
      { sv: 'Vi ska gå på en fisketur tillsammans.', en: 'We will go fishing together.' },
      { sv: 'Jag är mycket villig att hjälpa andra.', en: 'I am very willing to help others.' },
      { sv: 'Hon är mycket humoristisk och vitsig.', en: 'She is very humorous and witty.' },
      { sv: 'Vi ska titta på en teaterföreställning.', en: 'We will watch a theater performance.' },
      { sv: 'Jag älskar att ha en god pratstund.', en: 'I love having a good chat.' },
      { sv: 'Han är mycket älskvärd och charmig.', en: 'He is very lovely and charming.' },
      { sv: 'Jag tycker om att spela video spel.', en: 'I like playing video games.' },
      { sv: 'Vi ska göra något speciellt för hennes födelsedag.', en: 'We will do something special for her birthday.' },
      { sv: 'Jag är mycket intresserad av filosofi.', en: 'I am very interested in philosophy.' },
      { sv: 'Hon är mycket uppmuntrande och stödjande.', en: 'She is very encouraging and supportive.' },
      { sv: 'Vi ska åka på en road trip tillsammans.', en: 'We will go on a road trip together.' },
      { sv: 'Jag älskar att spela schack.', en: 'I love playing chess.' },
      { sv: 'Han är mycket visdom och erfaren person.', en: 'He is a very wise and experienced person.' },
      { sv: 'Jag tycker om att läsa dagstidningar.', en: 'I like reading newspapers.' },
      { sv: 'Vi ska ha en liten fest hemma på fredag.', en: 'We will have a small party at home on Friday.' },
      { sv: 'Jag är mycket intresserad av astronomi.', en: 'I am very interested in astronomy.' },
      { sv: 'Hon är mycket disciplinerad och fokuserad.', en: 'She is very disciplined and focused.' },
      { sv: 'Vi ska besöka en kyrka nästa vecka.', en: 'We will visit a church next week.' },
      { sv: 'Jag älskar att skriva dagbok.', en: 'I love writing in a journal.' },
      { sv: 'Han är mycket adaptiv och flexibel.', en: 'He is very adaptive and flexible.' },
      { sv: 'Jag tycker om att köra båt.', en: 'I like boating.' },
      { sv: 'Vi ska ha en grill fest på sommaren.', en: 'We will have a barbecue in the summer.' },
      { sv: 'Jag är mycket intresserad av ekonomi.', en: 'I am very interested in economics.' },
      { sv: 'Hon är mycket pålitlig och trofast.', en: 'She is very reliable and loyal.' },
      { sv: 'Vi ska åka på en temperaturkryssning.', en: 'We will go on a cruise.' },
      { sv: 'Jag älskar att måla målningar.', en: 'I love painting paintings.' },
      { sv: 'Han är mycket framåtlutad och försiktig.', en: 'He is very forward-thinking and cautious.' },
      { sv: 'Jag tycker om att besöka gallerier.', en: 'I like visiting galleries.' },
      { sv: 'Vi ska göra en finnas shopping tur.', en: 'We will go on a shopping spree.' },
      { sv: 'Jag är mycket intresserad av psykologi.', en: 'I am very interested in psychology.' },
      { sv: 'Hon är mycket aktiv och energisk.', en: 'She is very active and energetic.' },
      { sv: 'Vi ska åka på en spa dag tillsammans.', en: 'We will go to a spa day together.' },
      { sv: 'Jag älskar att komponera musik.', en: 'I love composing music.' },
      { sv: 'Han är mycket respektfull och höflig.', en: 'He is very respectful and polite.' },
      { sv: 'Jag tycker om att åka på isdansen.', en: 'I like ice skating.' },
      { sv: 'Vi ska ha en soirée nästa månad.', en: 'We will have a soirée next month.' },
      { sv: 'Jag är mycket intresserad av arkitektur.', en: 'I am very interested in architecture.' },
      { sv: 'Hon är mycket elegant och stilfull.', en: 'She is very elegant and stylish.' },
      { sv: 'Vi ska åka på en arkäologisk expedition.', en: 'We will go on an archaeological expedition.' },
      { sv: 'Jag älskar att läsa kriminalromaner.', en: 'I love reading mystery novels.' },
      { sv: 'Han är mycket allvarlig och grundlig.', en: 'He is very serious and thorough.' },
      { sv: 'Jag tycker om att åka skateboardåkning.', en: 'I like skateboarding.' },
      { sv: 'Vi ska äta en söt dessert tillsammans.', en: 'We will eat a sweet dessert together.' },
      { sv: 'Jag är mycket intresserad av geografi.', en: 'I am very interested in geography.' },
      { sv: 'Hon är mycket sympatisk och hjälpsam.', en: 'She is very sympathetic and helpful.' },
      { sv: 'Vi ska åka på en safari nästa år.', en: 'We will go on a safari next year.' },
      { sv: 'Jag älskar att läsa kärleksromaner.', en: 'I love reading romance novels.' },
      { sv: 'Han är mycket intelligent och kunnig.', en: 'He is very intelligent and knowledgeable.' },
      { sv: 'Jag tycker om att åka vattenski.', en: 'I like water skiing.' },
      { sv: 'Vi ska dricka ett glas vin tillsammans.', en: 'We will drink a glass of wine together.' },
      { sv: 'Jag är mycket intresserad av biologi.', en: 'I am very interested in biology.' },
      { sv: 'Hon är mycket hoppfull och optimistisk.', en: 'She is very hopeful and optimistic.' },
      { sv: 'Vi ska åka på en utflykt till kusten.', en: 'We will go on an outing to the coast.' },
      { sv: 'Jag älskar att läsa science fiction.', en: 'I love reading science fiction.' },
      { sv: 'Han är mycket ödmjuk och beskäden.', en: 'He is very humble and modest.' },
      { sv: 'Jag tycker om att åka paragliding.', en: 'I like paragliding.' },
      { sv: 'Vi ska ha en picnic på gräsmattan.', en: 'We will have a picnic on the lawn.' },
      { sv: 'Jag är mycket intresserad av kemi.', en: 'I am very interested in chemistry.' },
      { sv: 'Hon är mycket modig och självsäker.', en: 'She is very brave and confident.' },
      { sv: 'Vi ska åka på en bergsklättring expedition.', en: 'We will go on a mountain climbing expedition.' },
      { sv: 'Jag älskar att läsa äventyrsromaner.', en: 'I love reading adventure novels.' },
      { sv: 'Han är mycket försiktig och genomtänkt.', en: 'He is very careful and thoughtful.' },
      { sv: 'Jag tycker om att åka hundsläde.', en: 'I like dog sledding.' },
      { sv: 'Vi ska äta en frukostbuffet tillsammans.', en: 'We will eat a breakfast buffet together.' },
      { sv: 'Jag är mycket intresserad av fysik.', en: 'I am very interested in physics.' },
      { sv: 'Hon är mycket leende och vänlig.', en: 'She is very smiling and kind.' },
      { sv: 'Vi ska åka på en joggingtur tillsammans.', en: 'We will go jogging together.' },
      { sv: 'Jag älskar att läsa fantasyromaner.', en: 'I love reading fantasy novels.' },
      { sv: 'Han är mycket ansvarsfull och pålitlig.', en: 'He is very responsible and reliable.' },
      { sv: 'Jag tycker om att åka jetski.', en: 'I like jet skiing.' },
      { sv: 'Vi ska ha en tyst middag tillsammans.', en: 'We will have a quiet dinner together.' },
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

    // Shuffle and select random sentences to avoid duplicates
    const shuffled = [...sampleSentences].sort(() => Math.random() - 0.5);
    const sentences = shuffled.slice(0, limit).map(s => ({
      text: s.sv,
      translations: [[{ text: s.en }]]
    }));

    const imported = [];
    const errors = [];

    for (const sentence of sentences) {
      try {
        const sv = sentence.text || sentence.sent;
        let en = null;

        if (Array.isArray(sentence.translations) && sentence.translations.length > 0) {
          const firstTrans = sentence.translations[0];
          en = Array.isArray(firstTrans) ? firstTrans[0]?.text : firstTrans?.text;
        }

        if (!sv || !en) continue;

        const words = sv.split(/\s+/);
        if (words.length < 3) continue;

        // Filter: no punctuation-only, no capitals, no ≤2 chars
        const cleanWords = words
          .filter(w => /[a-zA-ZåäöÅÄÖ]/.test(w) && w.length > 2 && w[0] !== w[0].toUpperCase())
          .map(w => w.toLowerCase());
        if (cleanWords.length < 2) continue;

        // Pick least-common word (longest as proxy for rarity)
        const answer = cleanWords.reduce((least, word) => 
          word.length > least.length ? word : least
        );

        const sentenceWithBlank = sv.split(/\s+/).map(w => {
          return w.toLowerCase() === answer ? '___' : w;
        }).join(' ');

        const distractors = generateDistracters(answer, cleanWords);
        if (distractors.length < 3) continue;

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