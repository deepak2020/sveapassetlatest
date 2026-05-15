import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowLeft, Volume2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { awardXP, XP_REWARDS } from "@/lib/xp";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const playAudio = async (text, lang = "sv-SE", speed = 1) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = speed;
  synth.speak(utterance);
};

export default function GymSessionV2({ sentences, mode, level, srsCards, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!sentences || sentences.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">No sentences available for this selection.</p>
        <Button onClick={onFinish} className="mt-4">Back to Gym</Button>
      </div>
    );
  }

  const sentence = sentences[current];
  const blanksCount = (sentence.sentence_sv.match(/___/g) || []).length;

  const getOptions = () => {
    if (mode === "type" || level === "advanced") return [];
    const answers = sentence.answer.split(",").map(a => a.trim());
    const allOptions = [...answers, ...(sentence.distractors || []).slice(0, 3)];
    return shuffle(allOptions).slice(0, 4);
  };

  const options = getOptions();

  const handleAnswer = async (answer) => {
    if (answered) return;
    const expected = sentence.answer.trim().toLowerCase();
    const given = answer.trim().toLowerCase();
    const isCorrect = given === expected;
    setSelected(answer);
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) setScore(s => s + 1);
    await awardXP(base44, isCorrect ? XP_REWARDS.cloze_correct : 0);
    await updateSRS(sentence.id, isCorrect, srsCards);
  };

  const handleNext = () => {
    if (current + 1 >= sentences.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setTyped("");
      setAnswered(false);
      setCorrect(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / sentences.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="font-display text-3xl font-bold mb-1">Bra jobbat! 🎉</h2>
        <p className="text-5xl font-bold text-primary my-3">{pct}%</p>
        <p className="text-muted-foreground mb-6">{score} / {sentences.length} correct</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onFinish} variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Gym</Button>
          <Button onClick={() => { setCurrent(0); setScore(0); setFinished(false); setAnswered(false); setSelected(null); setTyped(""); setCorrect(false); }}>
            <RotateCcw className="w-4 h-4 mr-2" /> Try again
          </Button>
        </div>
      </motion.div>
    );
  }

  const parts = sentence.sentence_sv.split("___");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onFinish} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-sm text-muted-foreground">{current + 1} / {sentences.length}</span>
        <span className="text-sm font-semibold text-primary">Score: {score}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((current + 1) / sentences.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-5">
              {/* English text */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase">English</span>
                </div>
                <p className="text-base leading-relaxed text-blue-900">{sentence.sentence_en}</p>
              </div>

              {/* Swedish sentence with blanks */}
              <div className="bg-muted/40 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-foreground uppercase">Swedish</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => playAudio(sentence.sentence_sv, "sv-SE", 0.6)}
                      className="p-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors"
                      title="Slow (0.6x)"
                    >
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => playAudio(sentence.sentence_sv, "sv-SE", 1)}
                      className="p-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors"
                      title="Normal (1x)"
                    >
                      <Volume2 className="w-4 h-4 text-primary" />
                    </button>
                    <button
                      onClick={() => playAudio(sentence.sentence_sv, "sv-SE", 1.4)}
                      className="p-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors"
                      title="Fast (1.4x)"
                    >
                      <Volume2 className="w-4 h-4 text-orange-500" />
                    </button>
                  </div>
                </div>
                <p className="text-lg font-medium leading-relaxed">
                  {parts.map((part, idx) => (
                    <span key={idx}>
                      {part}
                      {idx < parts.length - 1 && (
                        <span className={`inline-block px-3 py-0.5 mx-1 rounded-lg border-2 font-bold transition-colors min-w-[80px] text-center ${
                          !answered ? "border-dashed border-primary/40 text-primary/40" :
                          correct ? "border-green-400 bg-green-50 text-green-700" :
                          "border-red-400 bg-red-50 text-red-700"
                        }`}>
                          {answered ? sentence.answer.split(",")[idx]?.trim() || "___" : "___"}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Level-based input */}
              {level === "advanced" ? (
                <div className="space-y-3">
                  <textarea
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    disabled={answered}
                    placeholder="Write the complete Swedish sentence..."
                    className="w-full border-2 border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors min-h-24 resize-none"
                  />
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {["å", "ä", "ö"].map(c => (
                      <button key={c} onClick={() => setTyped(t => t + c)}
                        className="px-2.5 py-1 border rounded-lg hover:bg-muted transition-colors font-medium">{c}</button>
                    ))}
                  </div>
                  {!answered && <Button onClick={() => handleAnswer(typed)} className="w-full">Check</Button>}
                </div>
              ) : (
                <div>
                  {mode === "type" || (level !== "beginner" && Math.random() > 0.5) ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={typed}
                        onChange={e => setTyped(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !answered) handleAnswer(typed); }}
                        disabled={answered}
                        placeholder={`Type the missing word${blanksCount > 1 ? "s" : ""}...`}
                        className="w-full border-2 border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        {["å", "ä", "ö"].map(c => (
                          <button key={c} onClick={() => setTyped(t => t + c)}
                            className="px-2.5 py-1 border rounded-lg hover:bg-muted transition-colors font-medium">{c}</button>
                        ))}
                      </div>
                      {!answered && <Button onClick={() => handleAnswer(typed)} className="w-full">Check</Button>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {options.map(opt => {
                        let style = "border-border/50 hover:border-primary/40 hover:bg-muted/50";
                        if (answered) {
                          if (opt === sentence.answer) style = "border-green-400 bg-green-50";
                          else if (opt === selected) style = "border-red-400 bg-red-50 opacity-80";
                          else style = "border-border/30 opacity-40";
                        }
                        return (
                          <button key={opt} onClick={() => handleAnswer(opt)} disabled={answered}
                            className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all flex items-center justify-between gap-2 ${style}`}>
                            <span>{opt}</span>
                            {answered && opt === sentence.answer && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                            {answered && opt === selected && opt !== sentence.answer && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Result */}
              {answered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className={`p-3 rounded-lg ${correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <p className={`text-sm font-semibold ${correct ? "text-green-700" : "text-red-700"}`}>
                      {correct ? "✓ Correct!" : `✗ Answer: ${sentence.answer}`}
                    </p>
                  </div>
                  {sentence.grammar_note && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                      💡 {sentence.grammar_note}
                    </div>
                  )}
                  <Button onClick={handleNext} className="w-full">
                    {current + 1 >= sentences.length ? "See Results" : "Next"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

async function updateSRS(sentenceId, isCorrect, srsCards) {
  const today = new Date().toISOString().split("T")[0];
  const existing = srsCards.find(c => c.cloze_sentence_id === sentenceId);

  if (existing) {
    let ease = Math.min(2.5, Math.max(1.3, existing.ease_factor || 2.5));
    let interval = existing.interval_days || 1;

    if (isCorrect) {
      interval = Math.round(interval * ease);
      ease = Math.min(2.5, ease + 0.1);
    } else {
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    }

    const due = new Date();
    due.setDate(due.getDate() + interval);
    const timesCorrect = (existing.times_correct || 0) + (isCorrect ? 1 : 0);
    const timesSeen = (existing.times_seen || 0) + 1;
    const accuracy = timesCorrect / timesSeen;
    const status = timesCorrect >= 5 && accuracy >= 0.9 ? "mastered" : "review";

    await base44.entities.UserSRSCard.update(existing.id, {
      interval_days: interval,
      ease_factor: ease,
      due_date: due.toISOString().split("T")[0],
      times_seen: timesSeen,
      times_correct: timesCorrect,
      last_answer_correct: isCorrect,
      status,
    });
  } else {
    const interval = isCorrect ? 3 : 1;
    const due = new Date();
    due.setDate(due.getDate() + interval);
    await base44.entities.UserSRSCard.create({
      cloze_sentence_id: sentenceId,
      interval_days: interval,
      ease_factor: 2.5,
      due_date: due.toISOString().split("T")[0],
      times_seen: 1,
      times_correct: isCorrect ? 1 : 0,
      last_answer_correct: isCorrect,
      status: "learning",
    });
  }
}