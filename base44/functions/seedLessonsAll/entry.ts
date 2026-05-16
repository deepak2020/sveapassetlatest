import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SFI_COURSES = [
  {
    id: "A",
    name: "Kurs A: Grunder",
    level: "beginner",
    topics: ["Hälsningar & Presentationer", "Uttal (Å, Ä, Ö)", "Siffror & Tid", "En & Ett Substantiv", "Familjemedlemmar", "Beställa Mat & Fika", "Fråga om Vägen", "Nödfraser"],
  },
  {
    id: "B",
    name: "Kurs B: Dagliga Livet",
    level: "beginner",
    topics: ["Shopping & Priser", "Pluralformer", "Bestämda & Obestämda Former", "Transport & Resor", "Dagliga Rutiner", "Adjektivöverensstämmelse", "Datumtid", "Natur & Allemansrätten"],
  },
  {
    id: "C",
    name: "Kurs C: Integration",
    level: "intermediate",
    topics: ["Arbetsplatssvenska", "Perfekt & Pluskvamperfekt", "Bisatser", "Svenska Bostäder", "E-post & Formellt Skrivande", "Läsande av Nyheter", "Miljö & Hållbarhet", "Försäkringar"],
  },
  {
    id: "D",
    name: "Kurs D: Avancerad",
    level: "advanced",
    topics: ["Passivform", "Modalverb", "Villkorliga Meningar", "Komplex Ordföljning", "Akademisk Ordförråd", "Idiomatiska Uttryck", "Formella Rapporter & Brev", "Jobbansökningar"],
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
    // Insert one by one to avoid any rate limit or silent failures
    for (const lesson of newLessons) {
      await base44.asServiceRole.entities.Lesson.create(lesson);
      createdCount++;
    }

    return Response.json({ success: true, count: createdCount, total: allExisting.length + createdCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});