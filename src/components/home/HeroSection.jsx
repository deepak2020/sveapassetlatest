import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Landmark, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
{ value: "3 Skills", label: "Reading, Writing & Speaking" },
{ value: "AI-Powered", label: "Auto-generated lessons" },
{ value: "Civic + Language", label: "Full citizenship prep" }];


export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-chart-3/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-8 shadow-sm hidden">
              <Zap className="w-4 h-4" />
              AI-powered Swedish learning platform
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-foreground tracking-tight leading-[1.1]">
              Learn Swedish.{" "}
              <span className="relative inline-block">
                <span className="text-primary">Pass the test.</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Master <strong>reading, writing & speaking</strong> Swedish with Clozemaster-style exercises.
              Prepare for the civic test. Everything in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            <Link to="/language">
              <Button size="lg" className="gap-2 px-8 h-13 text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                <BookOpen className="w-5 h-5" />
                Start Learning Swedish
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/civic">
              <Button variant="outline" size="lg" className="gap-2 px-8 h-13 text-base border-2 hover:bg-secondary/10">
                <Landmark className="w-5 h-5" />
                Civic Test Prep
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            
            {stats.map((s) =>
            <div key={s.value} className="text-center p-3 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
                <div className="font-bold text-primary text-sm">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Skill cards strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {[
          { emoji: "📖", label: "Reading", desc: "Texts & comprehension", color: "from-blue-50 to-blue-100/50 border-blue-200/60", text: "text-blue-700" },
          { emoji: "✍️", label: "Writing", desc: "Prompts & feedback", color: "from-violet-50 to-violet-100/50 border-violet-200/60", text: "text-violet-700" },
          { emoji: "🗣️", label: "Speaking", desc: "Phrases & pronunciation", color: "from-green-50 to-green-100/50 border-green-200/60", text: "text-green-700" },
          { emoji: "🧩", label: "Fill-in-Blanks", desc: "Clozemaster exercises", color: "from-amber-50 to-amber-100/50 border-amber-200/60", text: "text-amber-700" }].
          map((item) =>
          <Link to="/language" key={item.label}>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border cursor-pointer hover:scale-105 transition-transform duration-200`}>
                <div className="text-2xl mb-2">{item.emoji}</div>
                <div className={`font-semibold text-sm ${item.text}`}>{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </Link>
          )}
        </motion.div>
      </div>
    </section>);

}