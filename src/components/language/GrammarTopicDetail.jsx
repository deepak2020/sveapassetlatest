import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TOPIC_EXERCISES = {
  "A": {
    "V2 Rule (Verb Second)": {
      lesson: "The V2 (Verb Second) rule is fundamental to Swedish sentence structure. In main clauses, the finite verb always appears in the second position. This applies regardless of whether the sentence starts with the subject or another element like an adverbial or object.\n\n**Basic Pattern:**\nPosition 1: Subject → Position 2: Verb → Position 3+: Objects/Adverbials\n\n**Example with adverbial first:**\nPosition 1: Adverbial → Position 2: Verb → Position 3: Subject → Position 4+: Objects\n\nThis rule distinguishes Swedish from English, where the subject must come first in most cases.",
      exercises: [
        {
          question: "Complete the sentence: 'Varje morgon ____ jag kaffe.'",
          type: "fill-blank",
          answer: "dricker",
          options: ["drickar", "dricker", "dricka"]
        },
        {
          question: "Reorder: 'På fredagen går jag till skolan'",
          type: "reorder",
          correct: true
        },
        {
          question: "Which is incorrect V2 order?",
          type: "choice",
          options: [
            "Jag äter frukt.",
            "Frukt äter jag.",
            "Frukt jag äter."
          ],
          correct: 2
        }
      ]
    },
    "Present Tense": {
      lesson: "Swedish present tense is formed by adding -r to the verb stem for most regular verbs. All persons (except infinitive) use the same form, making it simpler than many other languages.\n\n**Regular Conjugation:**\n- Jag/Du/Han/Hon/Vi/Ni/De + verb stem + r\n\n**Common Verbs:**\n- äta (eat) → äter\n- dricka (drink) → dricker\n- gå (go) → går\n- arbeta (work) → arbetar",
      exercises: [
        {
          question: "Conjugate 'att tala' (to speak) in present: 'Jag ____ svenska.'",
          type: "fill-blank",
          answer: "talar",
          options: ["talar", "talr", "tala"]
        }
      ]
    }
  },
  "B": {
    "Past Tense (Preterit & Perfect)": {
      lesson: "Swedish has two main past tenses: Preterit (simple past) and Perfect (present perfect). Preterit is formed by adding -ade, -ede, or -te to regular verbs. Perfect uses 'har' + past participle.\n\n**Preterit (Regular):**\n- arbeta → arbetade\n- dricka → drack (irregular)\n\n**Perfect:**\n- har + participle (har arbetat, har druckit)",
      exercises: [
        {
          question: "Which is the correct preterit form of 'äta'?",
          type: "choice",
          options: ["äta", "åt", "ätade"],
          correct: 1
        }
      ]
    }
  },
  "C": {
    "Subordinate Clauses": {
      lesson: "In subordinate (dependent) clauses, the word order changes significantly. The finite verb moves to the end of the clause, following the pattern: Subject + Adverbials + Verb.\n\n**Main Clause:** Jag vet att...\n**Subordinate Clause:** ...han kommer snart\n\nCommon subordinators: att (that), som (which), när (when), om (if), eftersom (because)",
      exercises: [
        {
          question: "Correct the subordinate clause word order: 'Jag vet att snart han kommer'",
          type: "fill-blank",
          answer: "kommer snart"
        }
      ]
    }
  },
  "D": {
    "Advanced Sentence Construction": {
      lesson: "At advanced levels, master complex nested clauses, formal constructions, and stylistic variations. Understanding these structures enables reading of academic texts and formal communication.\n\n**Complex Patterns:**\n- Multiple subordinate clauses\n- Participial constructions\n- Passive voice in formal contexts",
      exercises: []
    }
  }
};

export default function GrammarTopicDetail({ topic, level, onBack }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [exercisesCompleted, setExercisesCompleted] = useState(0);

  const topicData = TOPIC_EXERCISES[level]?.[topic.title];
  const exercises = topicData?.exercises || [];
  const currentEx = exercises[currentExercise];

  const handleAnswer = (answer, isCorrect) => {
    setSelectedAnswer(answer);
    setAnswered(true);
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExercise + 1 >= exercises.length) {
      setExercisesCompleted(1);
    } else {
      setCurrentExercise(c => c + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const resetExercises = () => {
    setCurrentExercise(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setScore(0);
    setExercisesCompleted(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold">{topic.title}</h2>
          <p className="text-muted-foreground mt-1">{topic.description}</p>
        </div>
        <Badge>{level}</Badge>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="lesson" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson">📖 Lesson</TabsTrigger>
          <TabsTrigger value="examples">💡 Examples</TabsTrigger>
          {exercises.length > 0 && <TabsTrigger value="practice">✍️ Practice</TabsTrigger>}
        </TabsList>

        {/* Lesson Tab */}
        <TabsContent value="lesson">
          <Card className="border-border/50">
            <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
              <div className="space-y-4 text-foreground">
                {topicData?.lesson?.split("\n\n").map((paragraph, idx) => (
                  <div key={idx}>
                    {paragraph.split("\n").map((line, lidx) => (
                      <p key={lidx} className="text-muted-foreground leading-relaxed">
                        {line.includes("**") ? (
                          <>
                            {line.split("**").map((part, pidx) =>
                              pidx % 2 === 0 ? part : <strong className="text-foreground font-semibold">{part}</strong>
                            )}
                          </>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Key Points */}
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Key Point</h4>
                <p className="text-amber-900 dark:text-amber-100">{topic.keyPoint}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples">
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Example</h4>
                <p className="text-blue-900 dark:text-blue-100 italic text-lg">{topic.example}</p>
              </div>

              {/* Additional examples for context */}
              <div className="space-y-3">
                <h4 className="font-semibold">More Examples:</h4>
                {level === "A" && topic.title === "V2 Rule (Verb Second)" && (
                  <>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Subject first:</strong> Jag älskar äpplen. (I love apples.)</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Adverbial first:</strong> Idag går jag till skolan. (Today I go to school.)</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Object first:</strong> Mat äter jag varje dag. (Food I eat every day.)</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        {exercises.length > 0 && (
          <TabsContent value="practice">
            <AnimatePresence mode="wait">
              {exercisesCompleted ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center space-y-6">
                      <h3 className="text-2xl font-bold">Great Job! 🎉</h3>
                      <div className="text-5xl font-bold text-primary">
                        {Math.round((score / exercises.length) * 100)}%
                      </div>
                      <p className="text-muted-foreground">{score} of {exercises.length} correct</p>
                      <div className="flex gap-3 justify-center">
                        <Button onClick={resetExercises} variant="outline">Try Again</Button>
                        <Button onClick={onBack}>Back to Grammar</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : currentEx ? (
                <motion.div key={currentExercise} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-6 space-y-6">
                      {/* Progress */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Exercise {currentExercise + 1} of {exercises.length}
                        </span>
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all" 
                            style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Question */}
                      <h3 className="text-xl font-bold">{currentEx.question}</h3>

                      {/* Options */}
                      {currentEx.type === "choice" && (
                        <div className="space-y-3">
                          {currentEx.options.map((option, idx) => {
                            const isCorrect = idx === currentEx.correct;
                            const isSelected = selectedAnswer === idx;
                            return (
                              <button
                                key={idx}
                                onClick={() => !answered && handleAnswer(idx, isCorrect)}
                                disabled={answered}
                                className={`w-full p-4 rounded-lg text-left font-medium transition-all border-2 ${
                                  isSelected
                                    ? isCorrect
                                      ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                                      : "border-red-400 bg-red-50 dark:bg-red-950/30"
                                    : answered && isCorrect
                                    ? "border-green-400 bg-green-50 dark:bg-green-950/30"
                                    : "border-border hover:border-primary"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill blank */}
                      {currentEx.type === "fill-blank" && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Type your answer..."
                            className="w-full p-3 border-2 border-border rounded-lg focus:border-primary outline-none"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !answered) {
                                const isCorrect = e.target.value.toLowerCase() === currentEx.answer.toLowerCase();
                                handleAnswer(e.target.value, isCorrect);
                              }
                            }}
                            disabled={answered}
                          />
                          {answered && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <p className="text-sm text-blue-900 dark:text-blue-100">
                                <strong>Correct answer:</strong> {currentEx.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next Button */}
                      {answered && (
                        <Button onClick={handleNextExercise} className="w-full">
                          {currentExercise + 1 >= exercises.length ? "See Results" : "Next Exercise"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}