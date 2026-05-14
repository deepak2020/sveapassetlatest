import { CheckCircle2, Circle } from "lucide-react";

const steps = [
  { key: "learn", label: "Learn", emoji: "🃏" },
  { key: "practice", label: "Practice", emoji: "🧩" },
  { key: "quiz", label: "Quiz", emoji: "🎯" },
];

export default function LessonProgress({ completed = [] }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => {
        const done = completed.includes(step.key);
        return (
          <div key={step.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              done ? "bg-green-50 border-green-200 text-green-700" : "bg-muted border-border/40 text-muted-foreground"
            }`}>
              {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {step.emoji} {step.label}
            </div>
            {i < steps.length - 1 && <div className={`h-px w-6 ${done ? "bg-green-300" : "bg-border/40"}`} />}
          </div>
        );
      })}
    </div>
  );
}