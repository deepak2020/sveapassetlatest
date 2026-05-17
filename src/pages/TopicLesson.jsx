import { useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
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
import LessonProgress from "../components/lesson/LessonProgress";
import MatchingExercise from "../components/lesson/MatchingExercise";
import ListeningExercise from "../components/lesson/ListeningExercise";
import ReactMarkdown from "react-markdown";

// Merge all lessons in a topic into a single combined "lesson"
function mergeLessons(lessons) {
  if (!lessons?.length) return null;
  const first = lessons[0];
  const merged = {
    id: `topic:${first.topic}:${first.sfi_course}`,
    title: first.topic,
    topic: first.topic,
    sfi_course: first.sfi_course,
    level: first.level,
    content: lessons.map((l) => l.content).filter(Boolean).join("\n\n---\n\n"),
    word_pairs: lessons.flatMap((l) => l.word_pairs || []),
    fill_in_blanks: lessons.flatMap((l) => l.fill_in_blanks || []),
    writing_prompts: lessons.flatMap((l) => l.writing_prompts || []),
    speaking_phrases: lessons.flatMap((l) => l.speaking_phrases || []),
    listening_phrases: lessons.flatMap((l) => l.listening_phrases || []),
    quiz_questions: lessons.flatMap((l) => l.quiz_questions || []),
    review_questions: lessons.flatMap((l) => l.review_questions || []),
    match_pairs: lessons.flatMap((l) => l.match_pairs || []),
  };
  return merged;
}

export default function TopicLesson() {
  const { course, topic: encodedTopic } = useParams();
  const topic = decodeURIComponent(encodedTopic || "");
  const topicKey = `topic:${course}:${topic}`;
  const { completed, scores, markComplete } = useLessonCompletion(topicKey);
  const confettiFired = useRef(false);

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["topic-lessons", course, topic],
    queryFn: () =>
      base44.entities.Lesson.filter({ sfi_course: course, topic }, "order", 200),
    enabled: !!course && !!topic,
  });

  const lesson = useMemo(() => mergeLessons(lessons), [lessons]);

  useEffect(() => {
    if (lesson) {
      setLastLesson({
        id: topicKey,
        title: lesson.title,
        title_sv: lesson.title,
        sfi_course: lesson.sfi_course,
        topic: lesson.topic,
        skill: "topic",
      });
    }
  }, [lesson, topicKey]);

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
        <p className="text-muted-foreground">Topic not found.</p>
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
  const hasTranslate = lesson.word_pairs?.some((wp) => wp.example_en && wp.example_sv);
  const hasMatch = lesson.match_pairs?.length > 0;
  const hasContent = !!lesson.content?.trim();

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

  const allDone = availableKeys.length > 0 && availableKeys.every((k) => completed.includes(k));

  if (allDone && !confettiFired.current && typeof window !== "undefined") {
    confettiFired.current = true;
    setTimeout(() => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }, 200);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28">
      <Link to="/language" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to all topics
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {lesson.sfi_course && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              SFI {lesson.sfi_course}
            </span>
          )}
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {lessons.length} lektioner · {lessons.length} lessons
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{lesson.title}</h1>
        <p className="text-muted-foreground mt-1">Alla aktiviteter för detta ämne · All activities for this topic</p>
      </div>

      <LessonProgress completed={completed} scores={scores} availableKeys={availableKeys} />

      {allDone && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Topic complete! 🎉</p>
            <p className="text-xs text-green-600">You've finished every activity for this topic.</p>
          </div>
          <Link to="/language" className="ml-auto">
            <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">Next topic</Button>
          </Link>
        </div>
      )}

      <Tabs defaultValue={hasVocab ? "learn" : hasBlanks ? "practice" : "content"} className="space-y-6">
        <TabsList className="flex w-full max-w-full overflow-x-auto sm:flex-wrap h-auto gap-1 justify-start sm:justify-center scrollbar-none">
          {hasContent && (
            <TabsTrigger value="content" className="shrink-0 gap-1.5 text-sm">
              <BookOpen className="w-3.5 h-3.5" /> Lesson
            </TabsTrigger>
          )}
          {hasVocab && (
            <TabsTrigger value="learn" className="shrink-0 gap-1.5 text-sm">
              🃏 Learn{completed.includes("learn") ? " ✓" : ` (${lesson.word_pairs.length})`}
            </TabsTrigger>
          )}
          {hasBlanks && (
            <TabsTrigger value="practice" className="shrink-0 gap-1.5 text-sm">
              🧩 Practice{completed.includes("practice") ? " ✓" : ` (${lesson.fill_in_blanks.length})`}
            </TabsTrigger>
          )}
          {hasMatch && (
            <TabsTrigger value="match" className="shrink-0 gap-1.5 text-sm">
              🔗 Match{completed.includes("match") ? " ✓" : ` (${lesson.match_pairs.length})`}
            </TabsTrigger>
          )}
          {hasWriting && (
            <TabsTrigger value="writing" className="shrink-0 gap-1.5 text-sm">
              <Pen className="w-3.5 h-3.5" /> Writing
            </TabsTrigger>
          )}
          {hasSpeaking && (
            <TabsTrigger value="speaking" className="shrink-0 gap-1.5 text-sm">
              <Mic className="w-3.5 h-3.5" /> Speaking
            </TabsTrigger>
          )}
          {hasListening && (
            <TabsTrigger value="listening" className="shrink-0 gap-1.5 text-sm">
              👂 Listening{completed.includes("listening") ? " ✓" : ` (${lesson.listening_phrases.length})`}
            </TabsTrigger>
          )}
          {hasTranslate && (
            <TabsTrigger value="translate" className="shrink-0 gap-1.5 text-sm">
              ✍️ Translate{completed.includes("translate") ? " ✓" : ""}
            </TabsTrigger>
          )}
          {hasReview && (
            <TabsTrigger value="review" className="shrink-0 gap-1.5 text-sm">
              🔁 Review{completed.includes("review") ? " ✓" : ` (${lesson.review_questions.length})`}
            </TabsTrigger>
          )}
          {hasQuiz && (
            <TabsTrigger value="quiz" className="shrink-0 gap-1.5 text-sm">
              🎯 Quiz{completed.includes("quiz") ? " ✓" : ` (${lesson.quiz_questions.length})`}
            </TabsTrigger>
          )}
        </TabsList>

        {hasContent && (
          <TabsContent value="content">
            <div className="prose prose-slate max-w-none bg-card rounded-xl border border-border/50 p-6">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          </TabsContent>
        )}

        {hasVocab && (
          <TabsContent value="learn">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🃏 Vocabulary Flashcards</h2>
              <p className="text-sm text-muted-foreground">Flip each card, then mark yourself.</p>
            </div>
            <FlashcardDeck
              wordPairs={lesson.word_pairs}
              onComplete={(score, total) => markComplete("learn", { score, total })}
              lessonId={lesson.id}
              lessonTitle={lesson.title}
            />
          </TabsContent>
        )}

        {hasBlanks && (
          <TabsContent value="practice">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🧩 Fill in the Blank</h2>
              <p className="text-sm text-muted-foreground">Complete the Swedish sentence.</p>
            </div>
            <FillInBlanks
              exercises={lesson.fill_in_blanks}
              onComplete={(score, total) => markComplete("practice", { score, total })}
            />
          </TabsContent>
        )}

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

        {hasWriting && (
          <TabsContent value="writing">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">✍️ Writing Practice</h2>
              <p className="text-sm text-muted-foreground">Short writing exercises to reinforce your learning.</p>
            </div>
            <WritingExercise prompts={lesson.writing_prompts} />
          </TabsContent>
        )}

        {hasSpeaking && (
          <TabsContent value="speaking">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🗣️ Speaking Practice</h2>
              <p className="text-sm text-muted-foreground">Read these phrases aloud to practice your pronunciation.</p>
            </div>
            <SpeakingPractice phrases={lesson.speaking_phrases} />
          </TabsContent>
        )}

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

        {hasReview && (
          <TabsContent value="review">
            <div className="space-y-2 mb-4">
              <h2 className="font-semibold text-lg">🔁 Review</h2>
              <p className="text-sm text-muted-foreground">Warm up with questions that reinforce what you already know.</p>
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
    </div>
  );
}