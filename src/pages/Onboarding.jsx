import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const SFI_LEVELS = [
  { value: "A", label: "SFI A", desc: "Absolute beginner — learning the alphabet and basic words", cefr: "CEFR A1" },
  { value: "B", label: "SFI B", desc: "Basic conversations, everyday topics", cefr: "CEFR A2" },
  { value: "C", label: "SFI C", desc: "Intermediate — work, society, longer texts", cefr: "CEFR B1" },
  { value: "D", label: "SFI D", desc: "Advanced — formal writing, debate, citizenship test", cefr: "CEFR B2" },
];

const GOALS = [
  "Pass the citizenship test",
  "Improve everyday Swedish",
  "Prepare for SFI exam",
  "All of the above",
];

const DAILY_GOALS = [
  { value: 5, label: "5 min", desc: "Just a taste" },
  { value: 10, label: "10 min", desc: "Light & steady" },
  { value: 15, label: "15 min", desc: "Good progress" },
  { value: 30, label: "30 min", desc: "Serious learner" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [sfi_level, setSfiLevel] = useState(null);
  const [goal, setGoal] = useState(null);
  const [daily_goal_minutes, setDailyGoal] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    await base44.auth.updateMe({
      sfi_level,
      goal,
      daily_goal_minutes,
      onboarding_complete: true,
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-muted"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="font-display text-2xl font-bold text-center mb-2">What's your current Swedish level?</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">We'll personalise lessons and exercises for you.</p>
              <div className="space-y-3">
                {SFI_LEVELS.map(l => (
                  <button key={l.value} onClick={() => setSfiLevel(l.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${sfi_level === l.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{l.label}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{l.cefr}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{l.desc}</p>
                    </div>
                    {sfi_level === l.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(1)} disabled={!sfi_level} className="w-full mt-6">Continue →</Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="font-display text-2xl font-bold text-center mb-2">What's your main goal?</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">This helps us prioritise the right content.</p>
              <div className="space-y-3">
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${goal === g ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"}`}>
                    <span className="font-medium">{g}</span>
                    {goal === g && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">← Back</Button>
                <Button onClick={() => setStep(2)} disabled={!goal} className="flex-1">Continue →</Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="font-display text-2xl font-bold text-center mb-2">How much time per day?</h1>
              <p className="text-muted-foreground text-center mb-6 text-sm">Consistency matters more than duration.</p>
              <div className="grid grid-cols-2 gap-3">
                {DAILY_GOALS.map(d => (
                  <button key={d.value} onClick={() => setDailyGoal(d.value)}
                    className={`p-5 rounded-xl border-2 text-center transition-all ${daily_goal_minutes === d.value ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"}`}>
                    <div className="text-2xl font-bold text-primary">{d.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{d.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                <Button onClick={handleFinish} disabled={!daily_goal_minutes || saving} className="flex-1">
                  {saving ? "Saving..." : "Start learning! 🚀"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}