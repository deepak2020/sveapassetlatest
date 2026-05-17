import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { useLastLesson } from "@/hooks/useLessonProgress";
import { motion } from "framer-motion";

export default function ContinueLearning() {
  const last = useLastLesson();

  if (!last) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          to={`/language/${last.id}`}
          className="block rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                Fortsätt lära dig · <span className="italic font-normal">Continue learning</span>
              </p>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                {last.title}
              </h3>
              {last.title_sv && (
                <p className="text-sm text-muted-foreground italic truncate">{last.title_sv}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}