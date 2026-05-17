import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dumbbell, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function SRSReviewCard() {
  const { isAuthenticated } = useAuth();

  const { data: srsCards = [] } = useQuery({
    queryKey: ["srs-cards-due"],
    queryFn: () => base44.entities.UserSRSCard.list(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return null;

  const today = new Date().toISOString().split("T")[0];
  const dueCount = srsCards.filter(
    (c) => c.due_date <= today && c.status !== "mastered"
  ).length;

  if (dueCount === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/gym"
          className="block rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 sm:p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-300 mb-1">
                Granska idag · <span className="italic font-normal">Review today</span>
              </p>
              <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
                {dueCount} {dueCount === 1 ? "kort förfaller" : "kort förfaller"}
              </h3>
              <p className="text-sm text-muted-foreground italic">
                {dueCount} card{dueCount === 1 ? "" : "s"} due for review
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
}