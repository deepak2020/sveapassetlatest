import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Based on Skolverket's SFI kursplan (2022) and Hermods SFI course progression.
// Topics reflect the "centralt innehåll" themes for each level.
const SFI_COURSES = [
  {
    id: "A",
    name: "Kurs A: Grundläggande Svenska",
    level: "beginner",
    // Studieväg 1, nybörjarnivå – mycket vardagsnära, konkret språk
    topics: [
      "Alfabetet & Uttal",
      "Hälsa & Presentera Sig",
      "Siffror, Klockan & Datum",
      "Familj & Personer",
      "Min Kropp & Hälsa",
      "Hemma & Mitt Rum",
      "Mat, Dryck & Fika",
      "Vägbeskrivning & Nödsituationer",
    ],
  },
  {
    id: "B",
    name: "Kurs B: Vardagsspråk",
    level: "beginner",
    // Fortsättning – vardagsliv, rutiner, närsamhälle
    topics: [
      "Handla i Affären",
      "Kläder & Väder",
      "Transport & Kollektivtrafik",
      "Min Bostad & Grannskap",
      "Vardagsrutiner & Fritid",
      "Sjukvård & Hos Doktorn",
      "Årstider & Högtider",
      "Plural & Bestämd Form",
    ],
  },
  {
    id: "C",
    name: "Kurs C: Samhälle & Arbete",
    level: "intermediate",
    // Studieväg 2/3 – aktivt deltagande i samhället
    topics: [
      "Arbetsliv & Yrken",
      "Skolan & Utbildning",
      "Sjukvårdssystemet",
      "Bo i Sverige (Hyresrätt & Bostadsrätt)",
      "Banken, Skatt & Försäkringar",
      "Svenska Traditioner & Kultur",
      "Miljö & Hållbar Utveckling",
      "Tempus: Perfekt & Preteritum",
    ],
  },
  {
    id: "D",
    name: "Kurs D: Avancerad Svenska",
    level: "advanced",
    // Avslutande nivå – samhälle, arbetsmarknad, formellt språk
    topics: [
      "Arbetsmarknaden & Jobbsökning",
      "CV, Personligt Brev & Intervju",
      "Det Svenska Samhället & Demokrati",
      "Nyheter, Medier & Källkritik",
      "Att Uttrycka Åsikter & Argumentera",
      "Formellt Skrivande & E-post",
      "Bisatser, Passiv & Modalverb",
      "Vidare Studier & Framtidsplaner",
    ],
  },
];

const SKILLS = [
  { key: "vocabulary", label: "Ordförråd", label_en: "Vocabulary" },
  { key: "grammar", label: "Grammatik", label_en: "Grammar" },
  { key: "reading", label: "Läsning", label_en: "Reading" },
  { key: "writing", label: "Skrivning", label_en: "Writing" },
  { key: "speaking", label: "Tal", label_en: "Speaking" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const allExisting = await base44.asServiceRole.entities.Lesson.list("order", 1000);
    const existingKeys = new Set(allExisting.map(l => `${l.sfi_course}-${l.topic}-${l.skill}`));

    const newLessons = [];
    let order = allExisting.length + 1;
    
    for (const course of SFI_COURSES) {
      for (const topic of course.topics) {
        for (const skill of SKILLS) {
          const key = `${course.id}-${topic}-${skill.key}`;
          if (!existingKeys.has(key)) {
            newLessons.push({
              title: `${topic} - ${skill.label_en}`,
              title_sv: `${topic} - ${skill.label}`,
              topic: topic,
              sfi_course: course.id,
              category: skill.key,
              skill: skill.key,
              level: course.level,
              order: order++,
            });
          }
        }
      }
    }

    let createdCount = 0;
    const errors = [];
    const BATCH_SIZE = 10;
    const DELAY_MS = 1500;
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    for (let i = 0; i < newLessons.length; i += BATCH_SIZE) {
      const batch = newLessons.slice(i, i + BATCH_SIZE);
      for (const lesson of batch) {
        try {
          await base44.asServiceRole.entities.Lesson.create(lesson);
          createdCount++;
        } catch (e) {
          errors.push({ title: lesson.title, error: e.message });
        }
      }
      if (i + BATCH_SIZE < newLessons.length) {
        await sleep(DELAY_MS);
      }
    }

    return Response.json({
      success: true,
      created: createdCount,
      skipped: allExisting.length,
      remaining: newLessons.length - createdCount,
      total: allExisting.length + createdCount,
      errors: errors.slice(0, 5),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});