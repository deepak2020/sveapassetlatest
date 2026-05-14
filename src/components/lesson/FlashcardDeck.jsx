import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export default function FlashcardDeck({ wordPairs, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [learning, setLearning] = useState([]);
  const [finished, setFinished] = useState(false);

  if (!wordPairs || wordPairs.length === 0) {
    return <p className="text-muted-foreground text-sm">No vocabulary available for this lesson.</p>;
  }

  const card = wordPairs[index];
  const total = wordPairs.length;

  const handleKnow = async () => {
    setKnown(k => [...k, card]);
    await awardXP(base44, XP_REWARDS.flashcard_good);
    advance();
  };

  const handleLearning = async () => {
    setLearning(l => [...l, card]);
    await awardXP(base44, XP_REWARDS.flashcard_hard);
    advance();
  };

  const advance = () => {
    setFlipped(false);
    if (index + 1 >= total) {
      setFinished(true);
      onComplete?.();
    } else {
      setIndex(i => i + 1);
    }
  };

  const restart = () => {
    setIndex(0); setFlipped(false); setKnown([]); setLearning([]); setFinished(false);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sv-SE";
    window.speechSynthesis.speak(utterance);
  };

  if (finished) {
    const pct = Math.round((known.length / total) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-amber-500" />
        </div>
        <h3 className="font-display text-2xl font-bold mb-1">Round complete!</h3>
        <p className="text-4xl font-bold text-primary my-3">{pct}%</p>
        <p className="text-muted-foreground mb-2">{known.length} known · {learning.length} still learning</p>
        {learning.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6">Keep practicing the words you're still learning!</p>
        )}
        <Button onClick={restart} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" /> Review again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{index + 1} / {total}</span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-3.5 h-3.5" />{known.length}</span>
          <span className="flex items-center gap-1 text-orange-500"><XCircle className="w-3.5 h-3.5" />{learning.length}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      {/* Flashcard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="cursor-pointer"
          onClick={() => setFlipped(f => !f)}
        >
          <div className="relative min-h-[240px] rounded-2xl border-2 border-border/50 bg-card shadow-sm flex flex-col items-center justify-center p-8 text-center select-none hover:border-primary/30 transition-colors">
            <span className="absolute top-3 left-3 text-xs text-muted-foreground uppercase tracking-wide font-medium">
              {flipped ? "English" : "Swedish"}
            </span>

            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); speak(flipped ? card.english : card.swedish); }}
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <p className="text-3xl font-bold text-foreground mb-3">
              {flipped ? card.english : card.swedish}
            </p>

            {flipped && card.example_sv && (
              <div className="mt-4 pt-4 border-t border-border/40 w-full">
                <p className="text-sm italic text-foreground">"{card.example_sv}"</p>
                <p className="text-xs text-muted-foreground mt-1">"{card.example_en}"</p>
              </div>
            )}

            {!flipped && (
              <p className="text-xs text-muted-foreground mt-4">Tap to reveal translation</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleLearning}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-semibold hover:bg-orange-100 transition-colors"
          >
            <XCircle className="w-5 h-5" /> Still learning
          </button>
          <button
            onClick={handleKnow}
            className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-green-200 bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5" /> Got it!
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Tap the card to reveal the answer, then rate yourself</p>
      )}
    </div>
  );
}