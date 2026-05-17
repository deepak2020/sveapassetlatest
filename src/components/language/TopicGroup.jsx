import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const SKILL_META = {
  vocabulary: { emoji: "📝", label: "Ordförråd", color: "bg-blue-50 text-blue-700 border-blue-200" },
  grammar: { emoji: "🔤", label: "Grammatik", color: "bg-purple-50 text-purple-700 border-purple-200" },
  reading: { emoji: "📖", label: "Läsning", color: "bg-green-50 text-green-700 border-green-200" },
  writing: { emoji: "✍️", label: "Skrivning", color: "bg-amber-50 text-amber-700 border-amber-200" },
  speaking: { emoji: "🗣️", label: "Tal", color: "bg-rose-50 text-rose-700 border-rose-200" },
  listening: { emoji: "👂", label: "Hörförståelse", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

const SKILL_ORDER = ["vocabulary", "grammar", "reading", "writing", "speaking", "listening"];

export default function TopicGroup({ topic, lessons, index, completedIds = new Set() }) {
  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const allDone = doneCount === lessons.length && lessons.length > 0;
  const sorted = [...lessons].sort((a, b) => {
    const ai = SKILL_ORDER.indexOf(a.skill || a.category);
    const bi = SKILL_ORDER.indexOf(b.skill || b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const topicSv = lessons[0]?.title_sv?.split(" - ")[0] || topic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <div className="px-6 py-4 bg-muted/40 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {sorted.map((lesson) => {
          const skillKey = lesson.skill || lesson.category;
          const meta = SKILL_META[skillKey] || { emoji: "✨", label: skillKey, color: "bg-muted text-foreground border-border" };
          const done = completedIds.has(lesson.id);
          return (
            <Link key={lesson.id} to={`/language/${lesson.id}`} className="group">
              <div className={`relative h-full rounded-xl border ${meta.color} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-3 ${done ? "ring-2 ring-green-500/40" : ""}`}>
                <span className="text-2xl">{meta.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{meta.label}</p>
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
    </motion.div>
  );
}