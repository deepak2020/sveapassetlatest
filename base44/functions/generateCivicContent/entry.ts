import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// All topics derived from Sverige i Fokus (UHR, 2026)
// https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus.pdf
const CIVIC_TOPICS = [
  // Kapitel 1 – Landet Sverige
  {
    title: "Geografi, klimat och natur",
    chapter: "Landet Sverige",
    category: "geography",
    order: 1,
    subtopics: ["Sveriges läge i Norden", "Klimat och Golfströmmen", "Fjäll, skogar, sjöar och skärgård", "Landets sträckning från Treriksröset till Smygehuk"]
  },
  {
    title: "Sveriges indelning",
    chapter: "Landet Sverige",
    category: "geography",
    order: 2,
    subtopics: ["Götaland, Svealand och Norrland", "21 län och 290 kommuner", "25 landskap", "Tre största städer: Stockholm, Göteborg, Malmö"]
  },
  {
    title: "Befolkning",
    chapter: "Landet Sverige",
    category: "society",
    order: 3,
    subtopics: ["Nästan 11 miljoner invånare", "85% bor i städer", "Befolkningsfördelning södra Sverige och kuster"]
  },
  {
    title: "Naturresurser",
    chapter: "Landet Sverige",
    category: "geography",
    order: 4,
    subtopics: ["Järnmalm och mineraler (Kiruna, Malmberget)", "Vatten och vattenkraft", "Jordbruksmark", "Skogsindustri"]
  },
  {
    title: "Klimatförändringar och hållbar utveckling",
    chapter: "Landet Sverige",
    category: "society",
    order: 5,
    subtopics: ["Orsaker till klimatförändringar", "Sveriges klimatlag och mål till 2045", "Hållbar utveckling", "Vind-, vatten- och solenergi", "Vad individer kan göra"]
  },

  // Kapitel 2 – Sveriges demokratiska system
  {
    title: "Demokrati betyder folkstyre",
    chapter: "Sveriges demokratiska system",
    category: "government",
    order: 6,
    subtopics: ["Fria val och yttrandefrihet", "Rättssäkerhet", "Hur medborgare kan påverka", "Vad stärker demokratin"]
  },
  {
    title: "Hot mot demokratin",
    chapter: "Sveriges demokratiska system",
    category: "government",
    order: 7,
    subtopics: ["Lågt valdeltagande", "Falsk information och hat på sociala medier", "Segregation och integration", "Åtgärder mot segregation"]
  },

  // Kapitel 3 – Så här styrs Sverige
  {
    title: "Landet styrs på olika nivåer",
    chapter: "Så här styrs Sverige",
    category: "government",
    order: 8,
    subtopics: ["Stat, regioner och kommuner", "EU:s påverkan på Sverige", "Riksdagen: 349 ledamöter, val vart fjärde år", "Regeringen och statsministern", "Budgetproposition och opposition"]
  },
  {
    title: "Myndigheter i Sverige",
    chapter: "Så här styrs Sverige",
    category: "government",
    order: 9,
    subtopics: ["Arbetsförmedlingen, Försäkringskassan, Migrationsverket, Polismyndigheten, Skatteverket", "JO och JK – kontroll av myndigheter", "Myndigheternas roll och ansvar"]
  },
  {
    title: "Regioner och kommuner",
    chapter: "Så här styrs Sverige",
    category: "government",
    order: 10,
    subtopics: ["21 regioners ansvar: sjukvård och kollektivtrafik", "290 kommuners ansvar: skola, omsorg, vatten, snöröjning", "Kommunfullmäktige och nämnder"]
  },
  {
    title: "Sveriges statsskick – konstitutionell monarki",
    chapter: "Så här styrs Sverige",
    category: "government",
    order: 11,
    subtopics: ["Kung Carl XVI Gustaf", "Kronprinsessa Victoria och prinsessan Estelle", "Kungens symboliska roll utan politisk makt"]
  },

  // Kapitel 4 – Politiska val och partier
  {
    title: "Val och röstning i Sverige",
    chapter: "Politiska val och partier",
    category: "government",
    order: 12,
    subtopics: ["Riksdag, region och kommunval vart fjärde år", "EU-val vart femte år", "Rösträttsregler: ålder, medborgarskap, folkbokföring", "Folkomröstningar"]
  },
  {
    title: "Politiska partier i Sverige",
    chapter: "Politiska val och partier",
    category: "government",
    order: 13,
    subtopics: ["Riksdagens åtta partier", "4-procentsspärren", "Partiernas olika politiska idéer", "Hur man engagerar sig i ett parti"]
  },

  // Kapitel 5 – Lag och rätt
  {
    title: "Grundlagarna",
    chapter: "Lag och rätt",
    category: "rights_duties",
    order: 14,
    subtopics: ["Fyra grundlagar: Regeringsformen, Successionsordningen, Tryckfrihetsförordningen, Yttrandefrihetsgrundlagen", "Grundlagarnas skydd för medborgare", "Hur grundlagarna ändras"]
  },
  {
    title: "Rättsväsendet i Sverige",
    chapter: "Lag och rätt",
    category: "rights_duties",
    order: 15,
    subtopics: ["Polisen och brottsutredning", "Åklagare och domstolar", "Tingsrätt, hovrätt och Högsta domstolen", "Förvaltningsdomstolar", "Rättssäkerhet och oskuldspresumtion"]
  },

  // Kapitel 6 – Mediernas roll
  {
    title: "Fria medier och yttrandefrihet",
    chapter: "Mediernas roll",
    category: "society",
    order: 16,
    subtopics: ["Tryckfrihetens historia i Sverige (1766)", "Public service: SVT, SR, UR", "Presstöd och mediers oberoende", "Mediernas granskande roll"]
  },
  {
    title: "Källkritik",
    chapter: "Mediernas roll",
    category: "society",
    order: 17,
    subtopics: ["Hur man granskar information", "Falska nyheter och desinformation", "Sociala mediers roll", "Hur man bedömer källors trovärdighet"]
  },

  // Kapitel 7 – Mänskliga rättigheter
  {
    title: "Mänskliga rättigheter gäller alla",
    chapter: "Mänskliga rättigheter",
    category: "rights_duties",
    order: 18,
    subtopics: ["FN:s deklaration om mänskliga rättigheter", "Civila, politiska, ekonomiska, sociala och kulturella rättigheter", "Sveriges skyldighet att skydda rättigheter", "Europakonventionen"]
  },
  {
    title: "Jämställdhet mellan könen",
    chapter: "Mänskliga rättigheter",
    category: "rights_duties",
    order: 19,
    subtopics: ["Jämställdhetsmålet i Sverige", "Lika lön och rättigheter", "Föräldraförsäkringen och föräldraledighet", "Diskrimineringslagen"]
  },
  {
    title: "Barns rättigheter",
    chapter: "Mänskliga rättigheter",
    category: "rights_duties",
    order: 20,
    subtopics: ["FN:s barnkonvention – lag i Sverige sedan 2020", "Barnets bästa i alla beslut", "Rätt till utbildning, lek och skydd", "Socialtjänstens roll"]
  },
  {
    title: "Minoriteters rättigheter",
    chapter: "Mänskliga rättigheter",
    category: "rights_duties",
    order: 21,
    subtopics: ["Nationella minoriteter: samer, romer, judar, tornedalingar, sverigefinnar", "Urfolk – samernas rättigheter", "Minoritetsspråk och kulturell identitet"]
  },
  {
    title: "Diskriminering och dina rättigheter",
    chapter: "Mänskliga rättigheter",
    category: "rights_duties",
    order: 22,
    subtopics: ["Sju diskrimineringsgrunder i diskrimineringslagen", "Diskrimineringsombudsmannen (DO)", "Hur man anmäler diskriminering", "Aktiva åtgärder på arbetsplatser och skolor"]
  },

  // Kapitel 8 – Arbetsmarknad och privatekonomi
  {
    title: "Så fungerar arbetsmarknaden",
    chapter: "Arbetsmarknad och privatekonomi",
    category: "society",
    order: 23,
    subtopics: ["Arbetsgivare och arbetstagare", "Fackföreningar och arbetsgivarorganisationer", "Kollektivavtal", "Arbetsförmedlingens roll"]
  },
  {
    title: "Lagar och regler på arbetsmarknaden",
    chapter: "Arbetsmarknad och privatekonomi",
    category: "rights_duties",
    order: 24,
    subtopics: ["LAS – lagen om anställningsskydd", "MBL – medbestämmandelagen", "Arbetstidslagen", "Arbetsmiljölagen och Arbetsmiljöverket"]
  },
  {
    title: "Privatekonomi i Sverige",
    chapter: "Arbetsmarknad och privatekonomi",
    category: "society",
    order: 25,
    subtopics: ["Skatt och deklaration", "Bankväsendet och BankID", "Konsumenträtt och Konsumentverket", "Skuldsanering och Kronofogden"]
  },

  // Kapitel 9 – Välfärdssamhället
  {
    title: "Skatter och välfärden",
    chapter: "Välfärdssamhället",
    category: "society",
    order: 26,
    subtopics: ["Hur skatterna finansierar välfärden", "Inkomstskatt, moms och arbetsgivaravgifter", "Fördelning: stat, regioner och kommuner", "Offentlig sektor och dess tjänster"]
  },
  {
    title: "Sociala trygghetssystem",
    chapter: "Välfärdssamhället",
    category: "society",
    order: 27,
    subtopics: ["Försäkringskassan och socialförsäkringen", "Sjukpenning och sjukersättning", "Föräldrapenning och barnbidrag", "Pension – allmän och tjänstepension", "A-kassa och arbetslöshetsersättning"]
  },

  // Kapitel 10 – Sveriges moderna historia
  {
    title: "Från jordbrukssamhälle till industrisamhälle",
    chapter: "Sveriges moderna historia",
    category: "history",
    order: 28,
    subtopics: ["1800-talets emigration till Amerika", "Industrialiseringen och urbaniseringen", "Järnvägens betydelse", "Tidiga fackföreningar och arbetarrörelsen"]
  },
  {
    title: "Sveriges väg till demokrati",
    chapter: "Sveriges moderna historia",
    category: "history",
    order: 29,
    subtopics: ["Allmän och lika rösträtt 1921", "Parlamentarismens genombrott", "Konung och riksdag", "Neutralitetspolitiken under världskrigen"]
  },
  {
    title: "Folkhem och modernisering",
    chapter: "Sveriges moderna historia",
    category: "history",
    order: 30,
    subtopics: ["Socialdemokraternas folkhemsidé", "Miljonprogrammet och bostadsbyggandet", "Rekordåren: ekonomisk tillväxt på 1950-70-talen", "Välfärdsstatens expansion"]
  },
  {
    title: "Informationssamhället och globalisering",
    chapter: "Sveriges moderna historia",
    category: "history",
    order: 31,
    subtopics: ["Teknikskiftet och digitaliseringen", "Sveriges EU-inträde 1995", "Globaliseringens effekter på svensk ekonomi", "Immigration och mångkulturellt Sverige"]
  },

  // Kapitel 11 – Sverige och omvärlden
  {
    title: "Nordiskt och europeiskt samarbete",
    chapter: "Sverige och omvärlden",
    category: "government",
    order: 32,
    subtopics: ["Nordiska rådet och nordiskt samarbete", "EU – historia och beslutsfattande", "Sveriges roll i EU", "Schengensamarbetet och fri rörlighet"]
  },
  {
    title: "Globalt samarbete och FN",
    chapter: "Sverige och omvärlden",
    category: "government",
    order: 33,
    subtopics: ["FN:s roll och uppbyggnad", "Sveriges biståndspolitik (1% av BNI)", "Internationella organisationer: WHO, IMF, Världsbanken", "Flyktingkonventionen och UNHCR"]
  },
  {
    title: "Försvars- och säkerhetspolitik",
    chapter: "Sverige och omvärlden",
    category: "government",
    order: 34,
    subtopics: ["Sveriges NATO-medlemskap 2024", "Totalförsvar – civilt och militärt", "MSB och krisberedskap", "Säkerhetspolisen (SÄPO)"]
  },

  // Kapitel 12 – Religion
  {
    title: "Religionsfrihet och sekulär stat",
    chapter: "En sekulär stat och ett mångreligiöst land",
    category: "rights_duties",
    order: 35,
    subtopics: ["Religionsfrihet som grundlag", "Svenska kyrkan och separation från staten år 2000", "Religionens minskade roll i det offentliga livet", "Religiös mångfald i Sverige"]
  },
  {
    title: "Religionens roll i Sverige",
    chapter: "En sekulär stat och ett mångreligiöst land",
    category: "culture",
    order: 36,
    subtopics: ["Kristendomens historiska roll", "Islam, judendom, buddhism och andra religioner", "Livsåskådning och sekulära traditioner", "Religionens plats i skola och samhälle"]
  },

  // Kapitel 13 – Traditioner och högtider
  {
    title: "Svenska traditioner och högtider",
    chapter: "Traditioner och högtider",
    category: "culture",
    order: 37,
    subtopics: ["Jul, påsk och midsommar", "Lucia och Alla helgons dag", "Nationaldagen 6 juni", "Valborg och första maj", "Semestertraditioner"]
  },
];

async function generateOneTopic(base44, topic) {
  const prompt = `You are an expert on Swedish society and civic education, specifically for the Swedish citizenship test (medborgarskapsprovet).

Generate comprehensive educational content about the following topic from the official study material "Sverige i Fokus" (UHR, 2026):

Chapter: "${topic.chapter}"
Topic: "${topic.title}"
Category: ${topic.category}
Key subtopics to cover: ${topic.subtopics.join(', ')}

This content will be used to help people in Sweden prepare for the citizenship test (medborgarskapsprovet).

Generate:

content: Rich markdown (6-8 paragraphs) covering:
- The key facts and concepts from "Sverige i Fokus" for this topic
- How it affects daily life in Sweden
- Specific practical information (numbers, agency names, laws, years, percentages)
- A real-life scenario or example
- Cultural context where relevant
Use ## headers, **bold**, bullet lists. Write in English but include Swedish terms in *italics* with translations.
Stay closely aligned to what is in the Sverige i Fokus material — this is a citizenship test, accuracy is essential.

key_facts: 6-8 concise, memorable facts a citizenship test candidate MUST know. Use concrete specifics from Sverige i Fokus (exact agency names, numbers, percentages, ages, laws, years).

quiz_questions: 10-12 varied questions testing knowledge of this topic, directly based on Sverige i Fokus content.
For EACH question provide:
- question_sv: The question in Swedish
- question_en: The same question translated to English
- options: 4 answer choices (in Swedish)
- correct_index: 0-3, the index of the correct answer

Question types to include:
- "Vad heter...?" / "What is the name of...?"
- "Hur många...?" / "How many...?"
- "Vilket år...?" / "What year...?"
- "Vad ansvarar X för?" / "What is X responsible for?"
- "Vilken av dessa är...?" / "Which of these is...?"
- "Vad ska man göra om...?" / "What should you do if...?"

All content must be accurate and directly based on Sverige i Fokus (UHR, 2026).`;

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

  // Allow admin users OR internal service-role calls (no user context)
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Admin only' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { topic_index, batch_start = 0, batch_size = 3 } = body;

  let toGenerate;
  if (topic_index !== undefined) {
    toGenerate = [CIVIC_TOPICS[topic_index]].filter(Boolean);
  } else {
    const end = Math.min(batch_start + batch_size, CIVIC_TOPICS.length);
    toGenerate = CIVIC_TOPICS.slice(batch_start, end);
  }

  const results = [];

  for (let i = 0; i < toGenerate.length; i++) {
    const topic = toGenerate[i];
    console.log(`[generateCivicContent] Generating: ${topic.title}`);
    try {
      const data = await generateOneTopic(base44, topic);

      const sanitize = (arr) =>
        Array.isArray(arr) ? arr.filter((x) => x && typeof x === 'object') : [];

      const payload = {
        title: topic.title,
        chapter: topic.chapter,
        category: topic.category,
        order: topic.order,
        content: data.content || null,
        key_facts: sanitize(data.key_facts),
        quiz_questions: sanitize(data.quiz_questions),
      };
      console.log(`[generateCivicContent] About to create: ${topic.title} (keys: ${Object.keys(payload).join(',')})`);
      let created;
      try {
        created = await base44.asServiceRole.entities.CivicTopic.create(payload);
      } catch (createErr) {
        console.error(`[generateCivicContent] CREATE FAILED: ${topic.title}`, createErr?.message, createErr?.response?.data);
        throw createErr;
      }
      console.log(`[generateCivicContent] Created id=${created?.id} for: ${topic.title}`);
      results.push({ title: topic.title, id: created?.id, success: true });
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