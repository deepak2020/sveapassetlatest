import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-sm font-medium text-secondary-foreground mb-8">
              <span className="text-lg">🇸🇪</span>
              Välkommen — Welcome
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Your Path to
              <span className="block text-primary">Swedish Citizenship</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Master the Swedish language and ace the civic test. Interactive lessons, 
              practice quizzes, and everything you need for your citizenship journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/language">
              <Button size="lg" className="gap-2 px-8 h-12 text-base shadow-lg shadow-primary/20">
                <BookOpen className="w-5 h-5" />
                Start Learning Swedish
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/civic">
              <Button variant="outline" size="lg" className="gap-2 px-8 h-12 text-base">
                <Landmark className="w-5 h-5" />
                Civic Test Prep
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}