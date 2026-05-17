import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, BookOpen } from "lucide-react";

export default function TopicCard({ topic, lessons, course, index, completedIds = new Set() }) {
  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const allDone = doneCount === lessons.length && lessons.length > 0;
  const topicSv = lessons[0]?.title_sv?.split(" - ")[0] || topic;

  // Aggregate activity counts so the card shows what's inside
  const totals = lessons.reduce(
    (acc, l) => {
      acc.cards += l.word_pairs?.length || 0;
      acc.blanks += l.fill_in_blanks?.length || 0;
      acc.quiz += l.quiz_questions?.length || 0;
      acc.listening += l.listening_phrases?.length || 0;
      return acc;
    },
    { cards: 0, blanks: 0, quiz: 0, listening: 0 }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/language/topic/${course}/${encodeURIComponent(topic)}`} className="group block h-full">
        <div className={`h-full rounded-2xl border bg-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col gap-3 ${
          allDone ? "border-green-300 ring-2 ring-green-200/60" : "border-border/50"
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {allDone ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <BookOpen className="w-5 h-5 text-primary flex-shrink-0" />
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate">{topic}</h3>
                {topicSv !== topic && (
                  <p className="text-xs italic text-muted-foreground truncate">{topicSv}</p>
                )}
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
              allDone ? "bg-green-100 text-green-700" : doneCount > 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"
            }`}>
              {doneCount}/{lessons.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px] font-medium">
            {totals.cards > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">🃏 {totals.cards}</span>}
            {totals.blanks > 0 && <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">🧩 {totals.blanks}</span>}
            {totals.listening > 0 && <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">👂 {totals.listening}</span>}
            {totals.quiz > 0 && <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">🎯 {totals.quiz}</span>}
          </div>

          <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-xs text-muted-foreground">{lessons.length} lektioner</span>
            <ArrowRight className="w-4 h-4 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}