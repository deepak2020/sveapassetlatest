import { CheckCircle2, Circle } from "lucide-react";

const ALL_STEPS = [
  { key: "learn", label: "Learn", emoji: "🃏" },
  { key: "practice", label: "Practice", emoji: "🧩" },
  { key: "match", label: "Match", emoji: "🔗" },
  { key: "writing", label: "Writing", emoji: "✍️" },
  { key: "speaking", label: "Speaking", emoji: "🗣️" },
  { key: "listening", label: "Listening", emoji: "👂" },
  { key: "translate", label: "Translate", emoji: "✍️" },
  { key: "review", label: "Review", emoji: "🔁" },
  { key: "quiz", label: "Quiz", emoji: "🎯" },
];

export default function LessonProgress({ completed = [], availableKeys = null }) {
  // If availableKeys is provided, only show those steps. Otherwise show all.
  const steps = availableKeys
    ? ALL_STEPS.filter((s) => availableKeys.includes(s.key))
    : ALL_STEPS;

  if (steps.length === 0) return null;

  const doneCount = steps.filter((s) => completed.includes(s.key)).length;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          Aktiviteter klara · <span className="italic">Activities complete</span>
        </span>
        <span className="font-semibold">
          {doneCount}/{steps.length}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step) => {
          const done = completed.includes(step.key);
          return (
            <div
              key={step.key}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                done
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-muted border-border/40 text-muted-foreground"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              <span>
                {step.emoji} {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}