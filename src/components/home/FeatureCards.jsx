import { Link } from "react-router-dom";
import { BookOpen, Landmark, Brain, BarChart3, ArrowRight, PenLine, Mic, Puzzle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    emoji: "📖",
    title: "Reading & Writing",
    description: "Read Swedish texts, fill in blanks, and practice writing with guided prompts and AI feedback.",
    link: "/language",
    gradient: "from-blue-500/10 to-blue-600/5",
    border: "hover:border-blue-300/60",
    iconColor: "bg-blue-100 text-blue-600",
  },
  {
    icon: Mic,
    emoji: "🗣️",
    title: "Speaking Practice",
    description: "Learn phrases, pronunciation tips, and everyday conversation for life in Sweden.",
    link: "/language",
    gradient: "from-green-500/10 to-green-600/5",
    border: "hover:border-green-300/60",
    iconColor: "bg-green-100 text-green-600",
  },
  {
    icon: Puzzle,
    emoji: "🧩",
    title: "Clozemaster Exercises",
    description: "Fill-in-the-blank style drills to master vocabulary in context — just like Clozemaster.",
    link: "/language",
    gradient: "from-amber-500/10 to-amber-600/5",
    border: "hover:border-amber-300/60",
    iconColor: "bg-amber-100 text-amber-600",
  },
  {
    icon: Landmark,
    emoji: "🏛️",
    title: "Civic Test Prep",
    description: "Study Swedish government, history, culture, and society. Quizzes included for every topic.",
    link: "/civic",
    gradient: "from-violet-500/10 to-violet-600/5",
    border: "hover:border-violet-300/60",
    iconColor: "bg-violet-100 text-violet-600",
  },
  {
    icon: Brain,
    emoji: "✨",
    title: "AI-Generated Lessons",
    description: "Instantly generate any lesson or civic topic with AI — tailored to your level and goal.",
    link: "/language",
    gradient: "from-primary/10 to-primary/5",
    border: "hover:border-primary/30",
    iconColor: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart3,
    emoji: "📈",
    title: "Track Your Progress",
    description: "See your quiz scores, streaks, and improvement over time on your personal dashboard.",
    link: "/progress",
    gradient: "from-chart-3/10 to-chart-3/5",
    border: "hover:border-chart-3/30",
    iconColor: "bg-chart-3/10 text-chart-3",
  },
];

export default function FeatureCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold text-foreground">Everything You Need to Succeed</h2>
        <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
          From beginner Swedish to passing the citizenship test — all in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link to={feature.link}>
                <Card className={`group h-full border-border/50 ${feature.border} hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-to-br ${feature.gradient} overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl ${feature.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-2xl">{feature.emoji}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-base">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Get started <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}