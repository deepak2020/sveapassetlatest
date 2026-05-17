import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

const SKILL_META = {
  vocabulary: { emoji: "📝", label: "Ordförråd", label_en: "Vocabulary", color: "bg-blue-50 text-blue-700 border-blue-200" },
  grammar: { emoji: "🔤", label: "Grammatik", label_en: "Grammar", color: "bg-purple-50 text-purple-700 border-purple-200" },
  reading: { emoji: "📖", label: "Läsning", label_en: "Reading", color: "bg-green-50 text-green-700 border-green-200" },
  writing: { emoji: "✍️", label: "Skrivning", label_en: "Writing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  speaking: { emoji: "🗣️", label: "Tal", label_en: "Speaking", color: "bg-rose-50 text-rose-700 border-rose-200" },
  listening: { emoji: "👂", label: "Hörförståelse", label_en: "Listening", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

const SKILL_ORDER = ["vocabulary", "grammar", "reading", "writing", "speaking", "listening"];

export default function TopicGroup({ topic, lessons, index, completedIds = new Set() }) {
  const [open, setOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState("all");

  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const allDone = doneCount === lessons.length && lessons.length > 0;
  const topicSv = lessons[0]?.title_sv?.split(" - ")[0] || topic;

  // Group lessons by skill
  const bySkill = {};
  for (const l of lessons) {
    const key = l.skill || l.category || "other";
    if (!bySkill[key]) bySkill[key] = [];
    bySkill[key].push(l);
  }
  const availableSkills = SKILL_ORDER.filter((s) => bySkill[s]?.length);

  const visibleSkills = activeSkill === "all" ? availableSkills : availableSkills.filter((s) => s === activeSkill);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Topic header — clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-6 py-4 bg-muted/40 border-b border-border/50 flex items-center justify-between gap-3 hover:bg-muted/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} />
          {allDone && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
          <div className="min-w-0">
            <h3 className="font-bold text-lg truncate">{topic}</h3>
            {topicSv !== topic && (
              <p className="text-xs italic text-muted-foreground truncate">{topicSv}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
          allDone ? "bg-green-100 text-green-700" : doneCount > 0 ? "bg-amber-100 text-amber-700" : "bg-background text-muted-foreground"
        }`}>
          {doneCount}/{lessons.length} klara
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {/* Skill filter chips — scoped to this topic */}
            {availableSkills.length > 1 && (
              <div className="px-4 pt-4 flex flex-wrap gap-2 border-b border-border/30 pb-3">
                <button
                  onClick={() => setActiveSkill("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeSkill === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  ✨ Alla
                </button>
                {availableSkills.map((s) => {
                  const meta = SKILL_META[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveSkill(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeSkill === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {meta.emoji} {meta.label} ({bySkill[s].length})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Lessons grouped by skill */}
            <div className="p-4 space-y-5">
              {visibleSkills.map((skillKey) => {
                const meta = SKILL_META[skillKey] || { emoji: "✨", label: skillKey, color: "bg-muted text-foreground border-border" };
                return (
                  <div key={skillKey}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-lg">{meta.emoji}</span>
                      <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                        {meta.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {bySkill[skillKey].map((lesson) => {
                        const done = completedIds.has(lesson.id);
                        return (
                          <Link key={lesson.id} to={`/language/${lesson.id}`} className="group">
                            <div className={`relative h-full rounded-xl border ${meta.color} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3 ${done ? "ring-2 ring-green-500/40" : ""}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{lesson.title.split(" - ").slice(-1)[0]}</p>
                              </div>
                              {done ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                              ) : (
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}