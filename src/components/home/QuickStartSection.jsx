import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    emoji: "🎯",
    title: "Choose Your Starting Point",
    description: "Begin at a level that matches your current skills — whether you're just starting out or already have some Swedish knowledge.",
  },
  {
    number: "02",
    emoji: "📚",
    title: "Learn & Practice",
    description: "Work through interactive lessons with vocabulary, grammar, listening, and real-world conversations — all tailored to your pace.",
  },
  {
    number: "03",
    emoji: "💪",
    title: "Master Through Daily Practice",
    description: "Use our spaced repetition gym to reinforce what you learn. The system guides you to review exactly what you need, when you need it.",
  },
  {
    number: "04",
    emoji: "🌍",
    title: "Integrate & Thrive",
    description: "Develop cultural understanding and real-world Swedish skills. Become confident in social, professional, and everyday situations.",
  },
];

export default function QuickStartSection() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Swedish blue background accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#006AA7]/5 via-muted/40 to-[#FECC02]/5 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold text-foreground">Your Path to Swedish Fluency</h2>
          <p className="mt-3 text-muted-foreground text-base">Four simple steps to confident Swedish fluency and integration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-14">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[62%] w-[76%] h-px bg-border" />
              )}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-[#006AA7]/10 border border-[#006AA7]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{step.emoji}</span>
              </div>
              <div className="text-xs font-bold text-[#006AA7] uppercase tracking-widest mb-1">{step.number}</div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Sweden values strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-[#006AA7]/5 border border-[#006AA7]/15 p-8 text-center"
        >
          <div className="text-3xl mb-3">🇸🇪</div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">
            Welcome to Sweden
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Sweden is known for its democratic values, gender equality, commitment to education, and inclusive society. Learning the language is just the beginning — understanding the culture is the key to real belonging.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {["🗳️ Democracy", "📚 Education", "🏥 Wellbeing", "🌿 Sustainability", "🤝 Equality", "🎶 Culture"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/70 border border-[#006AA7]/20 text-sm text-foreground font-medium">
                {tag}
              </span>
            ))}
          </div>
          <Link to="/language">
            <Button className="gap-2 bg-[#006AA7] hover:bg-[#005a8e]">
              Start your journey <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
