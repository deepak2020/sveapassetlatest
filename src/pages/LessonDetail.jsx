import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Layers, Pen, Mic, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import LevelBadge from "../components/shared/LevelBadge";
import CategoryBadge from "../components/shared/CategoryBadge";
import FlashcardDeck from "../components/lesson/FlashcardDeck";
import FillInBlanks from "../components/lesson/FillInBlanks";
import WritingExercise from "../components/lesson/WritingExercise";
import SpeakingPractice from "../components/lesson/SpeakingPractice";
import QuizRunner from "../components/shared/QuizRunner";
import LessonProgress from "../components/lesson/LessonProgress";
import ReactMarkdown from "react-markdown";

export default function LessonDetail() {
  const pathParts = window.location.pathname.split("/");
  const lessonId = pathParts[pathParts.length - 1];
  const [completed, setCompleted] = useState([]);

  const markComplete = (key) => setCompleted(c => c.includes(key) ? c : [...c, key]);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-5 w-40 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Link to="/language">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to lessons
          </Button>
        </Link>
      </div>
    );
  }

  const hasVocab = lesson.word_pairs?.length > 0;
  const hasBlanks = lesson.fill_in_blanks?.length > 0;
  const hasQuiz = lesson.quiz_questions?.length > 0;
  const hasWriting = lesson.writing_prompts?.length > 0;
  const hasSpeaking = lesson.speaking_phrases?.length > 0;

  const allDone = completed.length >= 3 || (
    (!hasVocab || completed.includes("learn")) &&
    (!hasBlanks || completed.includes("practice")) &&
    (!hasQuiz || completed.includes("quiz"))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link to="/language" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to all lessons
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <LevelBadge level={lesson.level} />
          <CategoryBadge category={lesson.skill || lesson.category} />
          {lesson.sfi_course && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              SFI {lesson.sfi_course}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{lesson.title}</h1>
        {lesson.title_sv && (
          <p className="text-lg text-muted-foreground italic mt-1">{lesson.title_sv}</p>
        )}
      </div>

      {/* Progress tracker */}
      <LessonProgress completed={completed} />

      {/* Completion banner */}
      {allDone && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Lesson complete! 🎉</p>
            <p className="text-xs text-green-600">You've finished all activities for this lesson.</p>
          </div>
          <Link to="/language" className="ml-auto">
            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">Next lesson</Button>
          </Link>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={hasVocab ? "learn" : hasBlanks ? "practice" : "content"} className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1 w-full">
          <TabsTrigger value="content" className="gap-1.5 text-sm">
            <BookOpen className="w-3.5 h-3.5" /> Lesson
          </TabsTrigger>
          {hasVocab && (
            <TabsTrigger value="learn" className="gap-1.5 text-sm">
              🃏 Learn{completed.includes("learn") ? " ✓" : ` (${lesson.word_pairs.length})`}
            </TabsTrigger>
          )}
          {hasBlanks && (
            <TabsTrigger value="practice" className="gap-1.5 text-sm">
              🧩 Practice{completed.includes("practice") ? " ✓" : ` (${lesson.fill_in_blanks.length})`}
            </TabsTrigger>
          )}
          {hasWriting && (
            <TabsTrigger value="writing" className="gap-1.5 text-sm">
              <Pen className="w-3.5 h-3.5" /> Writing
            </TabsTrigger>
          )}
          {hasSpeaking && (
            <TabsTrigger value="speaking" className="gap-1.5 text-sm">
              <Mic className="w-3.5 h-3.5" /> Speaking
            </TabsTrigger>
          )}
          {hasQuiz && (
            <TabsTrigger value="quiz" className="gap-1.5 text-sm">
              🎯 Quiz{completed.includes("quiz") ? " ✓" : ` (${lesson.quiz_questions.length})`}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Lesson content */}
        <TabsContent value="content">
          {lesson.content ? (
            <div className="prose prose-slate max-w-none bg-card rounded-xl border border-border/50 p-6">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No written content for this lesson yet.</p>
              {hasVocab && <p className="text-sm mt-1">Head to the <strong>Learn</strong> tab to start with flashcards!</p>}
            </div>
          )}
        </TabsContent>

        {/* Babbel-style flashcards */}
        {hasVocab && (
          <TabsContent value="learn">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🃏 Vocabulary Flashcards</h2>
              <p className="text-sm text-muted-foreground">Flip each card, then mark yourself — Babbel style.</p>
            </div>
            <FlashcardDeck
              wordPairs={lesson.word_pairs}
              onComplete={() => markComplete("learn")}
            />
          </TabsContent>
        )}

        {/* Clozemaster-style fill-in-blanks */}
        {hasBlanks && (
          <TabsContent value="practice">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🧩 Fill in the Blank</h2>
              <p className="text-sm text-muted-foreground">Complete the Swedish sentence — Clozemaster style.</p>
            </div>
            <FillInBlanks
              exercises={lesson.fill_in_blanks}
              onComplete={() => markComplete("practice")}
            />
          </TabsContent>
        )}

        {/* Writing */}
        {hasWriting && (
          <TabsContent value="writing">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">✍️ Writing Practice</h2>
              <p className="text-sm text-muted-foreground">Short writing exercises to reinforce your learning.</p>
            </div>
            <WritingExercise prompts={lesson.writing_prompts} />
          </TabsContent>
        )}

        {/* Speaking */}
        {hasSpeaking && (
          <TabsContent value="speaking">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🗣️ Speaking Practice</h2>
              <p className="text-sm text-muted-foreground">Read these phrases aloud to practice your pronunciation.</p>
            </div>
            <SpeakingPractice phrases={lesson.speaking_phrases} />
          </TabsContent>
        )}

        {/* Quiz */}
        {hasQuiz && (
          <TabsContent value="quiz">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🎯 Final Quiz</h2>
              <p className="text-sm text-muted-foreground">Test your knowledge and track your score.</p>
            </div>
            <QuizRunner
              questions={lesson.quiz_questions}
              quizType="language"
              sourceId={lesson.id}
              sourceTitle={lesson.title}
              onComplete={() => markComplete("quiz")}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}