import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { awardXP, XP_REWARDS } from "@/lib/xp";

export default function QuizRunner({ questions, quizType, sourceId, sourceTitle, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No quiz questions available for this lesson yet.</p>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQ];
  const isCorrect = selected === question.correct_index;

  const handleSelect = async (index) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    const correct = index === question.correct_index;
    if (correct) setScore(score + 1);
    await awardXP(base44, correct ? XP_REWARDS.quiz_correct : 0);
  };

  const handleNext = async () => {
    if (currentQ + 1 >= questions.length) {
      const finalScore = score;
      const percentage = Math.round((finalScore / questions.length) * 100);
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        await base44.entities.QuizResult.create({
          quiz_type: quizType,
          source_id: sourceId,
          source_title: sourceTitle,
          score: finalScore,
          total: questions.length,
          percentage,
        });
      }
      setFinished(true);
      if (onComplete) onComplete(finalScore, questions.length);
    } else {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className={`w-10 h-10 ${percentage >= 70 ? "text-secondary" : "text-primary"}`} />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep practicing!"}
            </h3>
            <p className="text-4xl font-bold text-primary mb-2">{percentage}%</p>
            <p className="text-muted-foreground mb-6">
              You got {score} out of {questions.length} correct
            </p>
            <Button onClick={handleRestart} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Question {currentQ + 1} of {questions.length}
          </CardTitle>
          <span className="text-sm text-muted-foreground">Score: {score}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-5">
              {question.question_sv && (
                <>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{question.question_sv}</h3>
                  {question.question_en && (
                    <p className="text-sm text-muted-foreground italic">{question.question_en}</p>
                  )}
                </>
              )}
              {!question.question_sv && (question.question_en || question.question) && (
                <h3 className="text-lg font-semibold text-foreground">{question.question_en || question.question}</h3>
              )}
              {!question.question_sv && !question.question_en && !question.question && (
                <h3 className="text-lg font-semibold text-foreground">Question not available</h3>
              )}
            </div>
            <div className="space-y-3">
              {question.options.map((option, index) => {
                let optionStyle = "border-border/50 hover:border-primary/30 hover:bg-muted/50";
                if (answered) {
                  if (index === question.correct_index) {
                    optionStyle = "border-chart-3/50 bg-chart-3/5";
                  } else if (index === selected && !isCorrect) {
                    optionStyle = "border-destructive/50 bg-destructive/5";
                  } else {
                    optionStyle = "border-border/30 opacity-50";
                  }
                } else if (index === selected) {
                  optionStyle = "border-primary bg-primary/5";
                }

                return (
                  <button
                     key={index}
                     onClick={() => handleSelect(index)}
                     className={`w-full text-left p-4 md:p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 min-h-12 md:min-h-10 ${optionStyle}`}
                     disabled={answered}
                   >
                    <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium text-foreground">{option}</span>
                    {answered && index === question.correct_index && (
                      <CheckCircle2 className="w-5 h-5 text-chart-3 ml-auto shrink-0" />
                    )}
                    {answered && index === selected && !isCorrect && index !== question.correct_index && (
                      <XCircle className="w-5 h-5 text-destructive ml-auto shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {answered && (
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex justify-end pt-2"
           >
             <Button onClick={handleNext} className="gap-2 h-11 md:h-10">
               {currentQ + 1 >= questions.length ? "See Results" : "Next Question"}
               <ArrowRight className="w-4 h-4" />
             </Button>
           </motion.div>
         )}
      </CardContent>
    </Card>
  );
}