import { Link } from "react-router-dom";
import { BookOpen, Landmark, Brain, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  {
    icon: BookOpen,
    title: "Language Lessons",
    description: "Build vocabulary, master grammar, and learn everyday Swedish phrases from beginner to advanced.",
    link: "/language",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Landmark,
    title: "Civic Test Prep",
    description: "Study Swedish government, history, culture, and society to prepare for the citizenship test.",
    link: "/civic",
    color: "bg-secondary/20 text-secondary-foreground",
  },
  {
    icon: Brain,
    title: "Practice Quizzes",
    description: "Test your knowledge with interactive quizzes after each lesson and topic.",
    link: "/language",
    color: "bg-chart-3/10 text-chart-3",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    description: "Monitor your learning journey and see how you improve over time.",
    link: "/progress",
    color: "bg-chart-4/10 text-chart-4",
  },
];

export default function FeatureCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl font-bold text-foreground">Everything You Need</h2>
        <p className="mt-3 text-muted-foreground text-lg">
          A complete toolkit for your Swedish citizenship preparation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={feature.link}>
                <Card className="group h-full border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
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