import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { ArrowLeft, BookOpen, Pen, Mic, Trophy } from "lucide-react";
import { useLessonCompletion, setLastLesson } from "@/hooks/useLessonProgress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FlashcardDeck from "../components/lesson/FlashcardDeck";
import FillInBlanks from "../components/lesson/FillInBlanks";
import WritingExercise from "../components/lesson/WritingExercise";
import SpeakingPractice from "../components/lesson/SpeakingPractice";
import QuizRunner from "../components/shared/QuizRunner";
import SentenceTranslation from "../components/lesson/SentenceTranslation";
import MatchingExercise from "../components/lesson/MatchingExercise";
import ListeningExercise from "../components/lesson/ListeningExercise";
import LessonBottomNav from "../components/lesson/LessonBottomNav";
import ReactMarkdown from "react-markdown";

export default function LessonDetail() {
  const pathParts = window.location.pathname.split("/");
  const lessonId = pathParts[pathParts.length - 1];
  const { completed, scores, markComplete } = useLessonCompletion(lessonId);
  const confettiFired = useRef(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId,
  });

  // Sibling lessons in the same course → prev/next navigation
  const { data: siblings = [] } = useQuery({
    queryKey: ["lesson-siblings", lesson?.sfi_course],
    queryFn: () =>
      base44.entities.Lesson.filter({ sfi_course: lesson.sfi_course }, "order", 500),
    enabled: !!lesson?.sfi_course,
  });

  const currentIdx = siblings.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  // Remember this lesson so Home can offer "Continue learning"
  useEffect(() => {
    if (lesson) setLastLesson(lesson);
  }, [lesson]);

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
  const hasReview = lesson.review_questions?.length > 0;
  const hasWriting = lesson.writing_prompts?.length > 0;
  const hasSpeaking = lesson.speaking_phrases?.length > 0;
  const hasListening = lesson.listening_phrases?.length > 0;
  const hasTranslate = lesson.word_pairs?.some(wp => wp.example_en && wp.example_sv);
  const hasMatch = lesson.match_pairs?.length > 0;

  const allDone = completed.length >= 3 || (
    (!hasVocab || completed.includes("learn")) &&
    (!hasBlanks || completed.includes("practice")) &&
    (!hasQuiz || completed.includes("quiz"))
  );

  // Fire confetti once when lesson is completed
  if (allDone && !confettiFired.current && typeof window !== "undefined") {
    confettiFired.current = true;
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 200);
  }

  const availableKeys = [
    hasVocab && "learn",
    hasBlanks && "practice",
    hasMatch && "match",
    hasWriting && "writing",
    hasSpeaking && "speaking",
    hasListening && "listening",
    hasTranslate && "translate",
    hasReview && "review",
    hasQuiz && "quiz",
  ].filter(Boolean);
  const doneCount = availableKeys.filter((k) => completed.includes(k)).length;
  const pct = availableKeys.length ? Math.round((doneCount / availableKeys.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
      {/* Back */}
      <Link to={lesson.topic ? `/language/topic/${lesson.sfi_course}/${encodeURIComponent(lesson.topic)}` : "/language"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> {lesson.topic ? `Back to ${lesson.topic}` : "Back to lessons"}
      </Link>

      {/* Header — clean & calm */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {lesson.sfi_course && `SFI ${lesson.sfi_course}`}
          {lesson.topic && lesson.sfi_course && " · "}
          {lesson.topic}
        </p>
        <h1 className="font-display text-3xl font-bold text-foreground leading-tight">{lesson.title}</h1>
        {lesson.title_sv && lesson.title_sv !== lesson.title && (
          <p className="text-muted-foreground italic mt-1">{lesson.title_sv}</p>
        )}
      </div>

      {/* Slim progress bar */}
      {availableKeys.length > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${allDone ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
            {doneCount}/{availableKeys.length} klart
          </span>
        </div>
      )}

      {/* Completion banner */}
      {allDone && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Lesson complete! 🎉</p>
            <p className="text-xs text-green-600">You've finished all activities for this lesson.</p>
          </div>
          {nextLesson && (
            <Link to={`/language/${nextLesson.id}`} className="ml-auto">
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">Next lesson</Button>
            </Link>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={hasVocab ? "learn" : hasBlanks ? "practice" : "content"} className="space-y-6">
        <TabsList className="flex w-full max-w-full overflow-x-auto sm:flex-wrap h-auto gap-1 justify-start sm:justify-center scrollbar-none bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="content" className="shrink-0 gap-1.5 text-sm data-[state=active]:bg-background">
            <BookOpen className="w-3.5 h-3.5" /> Lesson
          </TabsTrigger>
          {hasVocab && (
            <TabsTrigger value="learn" className="shrink-0 text-sm data-[state=active]:bg-background">
              🃏 Learn {completed.includes("learn") && "✓"}
            </TabsTrigger>
          )}
          {hasBlanks && (
            <TabsTrigger value="practice" className="shrink-0 text-sm data-[state=active]:bg-background">
              🧩 Practice {completed.includes("practice") && "✓"}
            </TabsTrigger>
          )}
          {hasMatch && (
            <TabsTrigger value="match" className="shrink-0 text-sm data-[state=active]:bg-background">
              🔗 Match {completed.includes("match") && "✓"}
            </TabsTrigger>
          )}
          {hasWriting && (
            <TabsTrigger value="writing" className="shrink-0 gap-1.5 text-sm data-[state=active]:bg-background">
              <Pen className="w-3.5 h-3.5" /> Writing
            </TabsTrigger>
          )}
          {hasSpeaking && (
            <TabsTrigger value="speaking" className="shrink-0 gap-1.5 text-sm data-[state=active]:bg-background">
              <Mic className="w-3.5 h-3.5" /> Speaking
            </TabsTrigger>
          )}
          {hasListening && (
            <TabsTrigger value="listening" className="shrink-0 text-sm data-[state=active]:bg-background">
              👂 Listening {completed.includes("listening") && "✓"}
            </TabsTrigger>
          )}
          {hasTranslate && (
            <TabsTrigger value="translate" className="shrink-0 text-sm data-[state=active]:bg-background">
              ✍️ Translate {completed.includes("translate") && "✓"}
            </TabsTrigger>
          )}
          {hasReview && (
            <TabsTrigger value="review" className="shrink-0 text-sm data-[state=active]:bg-background">
              🔁 Review {completed.includes("review") && "✓"}
            </TabsTrigger>
          )}
          {hasQuiz && (
            <TabsTrigger value="quiz" className="shrink-0 text-sm data-[state=active]:bg-background">
              🎯 Quiz {completed.includes("quiz") && "✓"}
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
              onComplete={(score, total) => markComplete("learn", { score, total })}
              lessonId={lesson.id}
              lessonTitle={lesson.title}
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
              onComplete={(score, total) => markComplete("practice", { score, total })}
            />
          </TabsContent>
        )}

        {/* Matching Exercise */}
        {hasMatch && (
          <TabsContent value="match">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🔗 Match the Pairs</h2>
              <p className="text-sm text-muted-foreground">Connect each Swedish word or phrase to its correct match.</p>
            </div>
            <MatchingExercise
              pairs={lesson.match_pairs}
              onComplete={(score, total) => markComplete("match", { score, total })}
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

        {/* Listening */}
        {hasListening && (
          <TabsContent value="listening">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">👂 Listening Comprehension</h2>
              <p className="text-sm text-muted-foreground">Listen to Swedish phrases and test your comprehension.</p>
            </div>
            <ListeningExercise
              phrases={lesson.listening_phrases}
              onComplete={(score, total) => markComplete("listening", { score, total })}
            />
          </TabsContent>
        )}

        {/* Sentence Translation */}
        {hasTranslate && (
          <TabsContent value="translate">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">✍️ Translate to Swedish</h2>
              <p className="text-sm text-muted-foreground">Read the English sentence and type the Swedish translation.</p>
            </div>
            <SentenceTranslation
              wordPairs={lesson.word_pairs}
              onComplete={(score, total) => markComplete("translate", { score, total })}
            />
          </TabsContent>
        )}

        {/* Review — recycles vocabulary from earlier lessons */}
        {hasReview && (
          <TabsContent value="review">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🔁 Review Previous Lessons</h2>
              <p className="text-sm text-muted-foreground">Warm up with questions from earlier lessons to reinforce what you already know.</p>
            </div>
            <QuizRunner
              questions={lesson.review_questions}
              quizType="language"
              sourceId={lesson.id}
              sourceTitle={`${lesson.title} — Review`}
              onComplete={(score, total) => markComplete("review", { score, total })}
            />
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
              onComplete={(score, total) => markComplete("quiz", { score, total })}
            />
          </TabsContent>
        )}
      </Tabs>

      <LessonBottomNav prevLesson={prevLesson} nextLesson={nextLesson} />
    </div>
  );
}