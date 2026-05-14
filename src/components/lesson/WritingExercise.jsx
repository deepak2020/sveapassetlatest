import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

function PromptCard({ prompt, index }) {
  const [answer, setAnswer] = useState("");
  const [showExample, setShowExample] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700 shrink-0">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-foreground">{prompt.prompt}</p>
              {prompt.hint && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> {prompt.hint}
                </p>
              )}
            </div>
          </div>

          {!submitted ? (
            <>
              <Textarea
                placeholder="Skriv ditt svar här... (Write your answer here)"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowExample(!showExample)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  {showExample ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showExample ? "Hide example" : "Show example answer"}
                </button>
                <Button size="sm" onClick={() => setSubmitted(true)} disabled={!answer.trim()} className="gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Done
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="bg-violet-50 rounded-xl p-3 border border-violet-200/60">
                <p className="text-sm font-medium text-violet-700 mb-1">Your answer:</p>
                <p className="text-sm text-foreground">{answer}</p>
              </div>
              <button onClick={() => setSubmitted(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit answer</button>
            </div>
          )}

          {showExample && prompt.example_answer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-green-50 rounded-xl p-3 border border-green-200/60"
            >
              <p className="text-xs font-semibold text-green-700 mb-1">Example answer:</p>
              <p className="text-sm text-green-800">{prompt.example_answer}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function WritingExercise({ prompts }) {
  if (!prompts || prompts.length === 0) {
    return <p className="text-muted-foreground text-sm">No writing exercises available.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">Write your answers in Swedish. Use the hint if you need help, and check the example when you're done.</p>
      {prompts.map((prompt, i) => (
        <PromptCard key={i} prompt={prompt} index={i} />
      ))}
    </div>
  );
}