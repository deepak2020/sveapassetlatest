import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import SpeakButton from "@/components/shared/SpeakButton";

// Pick a stable word for the day based on the date so it doesn't shuffle every render
function pickForToday(items) {
  if (!items.length) return null;
  const today = new Date();
  const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 50 + today.getDate();
  return items[seed % items.length];
}

export default function WordOfTheDay() {
  const { data: lessons = [] } = useQuery({
    queryKey: ["wotd-lessons"],
    queryFn: () => base44.entities.Lesson.list("-created_date", 100),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const word = useMemo(() => {
    const all = lessons.flatMap((l) =>
      (l.word_pairs || []).filter((w) => w?.swedish && w?.english)
    );
    return pickForToday(all);
  }, [lessons]);

  if (!word) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent p-5 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-secondary-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            Dagens ord · <span className="italic font-normal">Word of the day</span>
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {word.swedish}
          </h3>
          <SpeakButton text={word.swedish} lang="sv-SE" />
        </div>
        <p className="text-lg text-muted-foreground mt-1">{word.english}</p>
        {word.example_sv && (
          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-sm italic text-foreground">"{word.example_sv}"</p>
            {word.example_en && (
              <p className="text-xs text-muted-foreground mt-1">"{word.example_en}"</p>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}