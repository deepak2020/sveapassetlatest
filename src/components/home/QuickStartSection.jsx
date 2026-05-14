import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { number: "01", title: "Choose Your Path", description: "Start with Swedish language basics or dive into civic test preparation." },
  { number: "02", title: "Study & Practice", description: "Work through interactive lessons with vocabulary, grammar, and key facts." },
  { number: "03", title: "Take Quizzes", description: "Test your knowledge with practice quizzes after each lesson." },
  { number: "04", title: "Track & Improve", description: "Monitor your progress and revisit topics until you're confident." },
];

export default function QuickStartSection() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mt-3 text-muted-foreground text-lg">Four simple steps to prepare for your citizenship</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-border" />
              )}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-display font-bold text-primary text-xl">{step.number}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}