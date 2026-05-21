import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function CivicQuizRunner({ questions, quizType, sourceId, sourceTitle }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No quiz questions available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (optionIndex) => {
    if (answered) return;

    const isCorrect = optionIndex === currentQuestion.correct_index;
    setSelectedIndex(optionIndex);
    setAnswered(true);

    if (isCorrect) {
      setScore(score + 1);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setSelectedIndex(null);
    } else {
      saveResult();
      setShowResults(true);
    }
  };

  const saveResult = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return;

    const percentage = Math.round((score / questions.length) * 100);
    await base44.entities.QuizResult.create({
      quiz_type: quizType,
      source_id: sourceId,
      source_title: sourceTitle,
      score: score,
      total: questions.length,
      percentage: percentage,
    });
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(false);
    setSelectedIndex(null);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              {percentage >= 80 ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2">Dina resultat · Your Results</h2>
            <p className="text-4xl font-bold text-primary mb-2">{percentage}%</p>
            <p className="text-muted-foreground mb-6">
              {score} av {questions.length} rätt · {score} of {questions.length} correct
            </p>
            <Button onClick={resetQuiz} className="gap-2">
              Testa igen · Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Fråga {currentIndex + 1} av {questions.length} · Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="h-2 w-32 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-1">{currentQuestion.question_sv}</h3>
            <p className="text-sm text-muted-foreground italic">{currentQuestion.question_en}</p>
          </div>

          <div className="space-y-3 mb-6">
            {(currentQuestion.options ?? []).map((option, idx) => {
              const isSelected = idx === selectedIndex;
              const isCorrect = idx === currentQuestion.correct_index;
              const showCorrect = answered && isCorrect;
              const showIncorrect = answered && isSelected && !isCorrect;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? "border-green-500 bg-green-50"
                      : showIncorrect
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  } ${answered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${showCorrect ? "text-green-700" : showIncorrect ? "text-red-700" : "text-foreground"}`}>
                      {option}
                    </span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showIncorrect && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <Button onClick={handleNext} className="w-full">
              {currentIndex < questions.length - 1
                ? "Nästa fråga · Next Question"
                : "Visa resultat · Show Results"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}