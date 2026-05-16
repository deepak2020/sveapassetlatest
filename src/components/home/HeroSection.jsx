import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const stats = [
  { value: "SFI A–D", label: "Complete Swedish courses" },
  { value: "100+ Topics", label: "Civic & culture guides" },
  { value: "Daily Practice", label: "Learn at your pace" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#006AA7]/8 via-background to-[#FECC02]/10">
      {/* Swedish-flag inspired blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FECC02]/15 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#006AA7]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 md:pt-28 md:pb-16">
        <div className="max-w-4xl mx-auto text-center">

          {/* Swedish flag icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="text-4xl">🇸🇪</span>
            <span className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
              Your journey in Sweden
            </span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.15]">
              Learn Swedish.{" "}
              <span className="relative inline-block">
                <span className="text-[#006AA7]">Thrive in Sweden.</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q75 2 150 8 Q225 14 298 6" stroke="#FECC02" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="mt-7 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Your all-in-one companion for mastering Swedish language and understanding Swedish society. Whether you're just starting out or refining your skills, we're here to support your integration journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/language">
              <Button size="lg" className="gap-2 px-7 text-base shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-shadow bg-[#006AA7] hover:bg-[#005a8e]">
                <BookOpen className="w-5 h-5" />
                Start Learning Swedish
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/civic">
              <Button variant="outline" size="lg" className="gap-2 px-7 text-base border-2 border-[#006AA7]/40 hover:bg-[#006AA7]/5">
                <Users className="w-5 h-5" />
                Explore Swedish Society
              </Button>
            </Link>
            <Link to="/gym">
              <Button variant="ghost" size="lg" className="gap-2 px-6 text-base hover:bg-[#FECC02]/20">
                <Sparkles className="w-5 h-5" />
                Practice
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 grid grid-cols-3 gap-3 max-w-lg mx-auto"
          >
            {stats.map((s) => (
              <div key={s.value} className="text-center p-3 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-sm">
                <div className="font-bold text-[#006AA7] text-sm">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Swedish Level Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {[
            { level: "Beginner", desc: "Start here", emoji: "🌱", color: "from-emerald-50 to-emerald-100/50 border-emerald-200/60", text: "text-emerald-700" },
            { level: "Elementary", desc: "Build foundation", emoji: "📘", color: "from-blue-50 to-blue-100/50 border-blue-200/60", text: "text-blue-700" },
            { level: "Intermediate", desc: "Gain fluency", emoji: "📗", color: "from-violet-50 to-violet-100/50 border-violet-200/60", text: "text-violet-700" },
            { level: "Advanced", desc: "Master it", emoji: "🎓", color: "from-amber-50 to-amber-100/50 border-amber-200/60", text: "text-amber-700" },
          ].map((item) => (
            <Link to="/language" key={item.level}>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} border cursor-pointer hover:scale-105 transition-transform duration-200`}>
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className={`font-bold text-sm ${item.text}`}>{item.level}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
