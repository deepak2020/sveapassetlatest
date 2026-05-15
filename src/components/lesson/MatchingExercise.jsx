import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MatchingExercise({ pairs, onComplete }) {
  const [shuffledRight, setShuffledRight] = useState([]);
  const [selected, setSelected] = useState({ left: null, right: null });
  const [matched, setMatched] = useState([]); // array of left values that are matched
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const rights = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
    setShuffledRight(rights);
  }, [pairs]);

  const handleLeft = (left) => {
    if (matched.includes(left)) return;
    setSelected(s => ({ ...s, left }));
    tryMatch({ left, right: selected.right });
  };

  const handleRight = (right) => {
    if (matched.some(m => pairs.find(p => p.left === m)?.right === right)) return;
    setSelected(s => ({ ...s, right }));
    tryMatch({ left: selected.left, right });
  };

  const tryMatch = ({ left, right }) => {
    if (!left || !right) return;
    const correct = pairs.find(p => p.left === left)?.right === right;
    if (correct) {
      const newMatched = [...matched, left];
      setMatched(newMatched);
      setSelected({ left: null, right: null });
      if (newMatched.length === pairs.length) {
        setDone(true);
        onComplete?.();
      }
    } else {
      setWrong(true);
      setTimeout(() => {
        setWrong(false);
        setSelected({ left: null, right: null });
      }, 700);
    }
  };

  const reset = () => {
    setMatched([]);
    setSelected({ left: null, right: null });
    setDone(false);
    setWrong(false);
    const rights = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
    setShuffledRight(rights);
  };

  const isRightMatched = (right) => matched.some(l => pairs.find(p => p.left === l)?.right === right);

  if (done) {
    return (
      <div className="text-center py-16 space-y-4">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold text-green-700">All matched! 🎉</h3>
        <p className="text-muted-foreground">You matched all {pairs.length} pairs correctly.</p>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Play again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tap an item on the left, then its match on the right. {matched.length}/{pairs.length} matched.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Left column */}
        <div className="space-y-2">
          {pairs.map((pair) => {
            const isMatched = matched.includes(pair.left);
            const isSelected = selected.left === pair.left;
            const isWrongSelected = wrong && isSelected;
            return (
              <motion.button
                key={pair.left}
                onClick={() => handleLeft(pair.left)}
                disabled={isMatched}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  isMatched && "bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default",
                  isWrongSelected && "bg-red-50 border-red-400 text-red-700",
                  isSelected && !isWrongSelected && !isMatched && "bg-primary/10 border-primary text-primary",
                  !isSelected && !isMatched && !isWrongSelected && "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                animate={isWrongSelected ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {pair.left}
              </motion.button>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-2">
          {shuffledRight.map((right) => {
            const isMatched = isRightMatched(right);
            const isSelected = selected.right === right;
            const isWrongSelected = wrong && isSelected;
            return (
              <motion.button
                key={right}
                onClick={() => handleRight(right)}
                disabled={isMatched}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all",
                  isMatched && "bg-green-50 border-green-300 text-green-700 opacity-60 cursor-default",
                  isWrongSelected && "bg-red-50 border-red-400 text-red-700",
                  isSelected && !isWrongSelected && !isMatched && "bg-primary/10 border-primary text-primary",
                  !isSelected && !isMatched && !isWrongSelected && "bg-card border-border hover:border-primary/50 hover:bg-muted/50"
                )}
                animate={isWrongSelected ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {right}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}