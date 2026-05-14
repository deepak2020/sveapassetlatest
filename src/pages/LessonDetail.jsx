import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import LevelBadge from "../components/shared/LevelBadge";
import CategoryBadge from "../components/shared/CategoryBadge";
import WordPairCard from "../components/lesson/WordPairCard";
import FillInBlanks from "../components/lesson/FillInBlanks";
import WritingExercise from "../components/lesson/WritingExercise";
import SpeakingPractice from "../components/lesson/SpeakingPractice";
import QuizRunner from "../components/shared/QuizRunner";
import ReactMarkdown from "react-markdown";

export default function LessonDetail() {
  const pathParts = window.location.pathname.split("/");
  const lessonId = pathParts[pathParts.length - 1];

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

  // Build tabs dynamically based on what content exists
  const tabs = [{ value: "content", label: "📚 Lesson" }];
  if (lesson.fill_in_blanks?.length) tabs.push({ value: "blanks", label: `🧩 Fill-in (${lesson.fill_in_blanks.length})` });
  if (lesson.writing_prompts?.length) tabs.push({ value: "writing", label: `✍️ Writing (${lesson.writing_prompts.length})` });
  if (lesson.speaking_phrases?.length) tabs.push({ value: "speaking", label: `🗣️ Speaking (${lesson.speaking_phrases.length})` });
  if (lesson.word_pairs?.length) tabs.push({ value: "vocabulary", label: `📝 Words (${lesson.word_pairs.length})` });
  if (lesson.quiz_questions?.length) tabs.push({ value: "quiz", label: `🎯 Quiz (${lesson.quiz_questions.length})` });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back navigation */}
      <Link to="/language" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to all lessons
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <LevelBadge level={lesson.level} />
          <CategoryBadge category={lesson.skill || lesson.category} />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">{lesson.title}</h1>
        {lesson.title_sv && (
          <p className="text-lg text-muted-foreground italic mt-1">{lesson.title_sv}</p>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          {tabs.map(t => (
            <TabsTrigger key={t.value} value={t.value} className="text-sm">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="content">
          {lesson.content ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">No lesson content available yet.</p>
          )}
        </TabsContent>

        <TabsContent value="blanks">
          <FillInBlanks exercises={lesson.fill_in_blanks} />
        </TabsContent>

        <TabsContent value="writing">
          <WritingExercise prompts={lesson.writing_prompts} />
        </TabsContent>

        <TabsContent value="speaking">
          <SpeakingPractice phrases={lesson.speaking_phrases} />
        </TabsContent>

        <TabsContent value="vocabulary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.word_pairs?.map((pair, index) => (
              <WordPairCard key={index} pair={pair} index={index} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <QuizRunner
            questions={lesson.quiz_questions}
            quizType="language"
            sourceId={lesson.id}
            sourceTitle={lesson.title}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}