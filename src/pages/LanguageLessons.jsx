import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, ArrowRight, Sparkles, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LevelBadge from "../components/shared/LevelBadge";
import EmptyState from "../components/shared/EmptyState";
import GenerateLessonModal from "../components/language/GenerateLessonModal";
import { motion } from "framer-motion";

const SFI_COURSES = [
  {
    id: "A",
    name: "SFI Course A",
    subtitle: "Absolute Beginner",
    description: "Learn the alphabet, basic greetings, numbers, and everyday survival phrases.",
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    level: "beginner",
    topics: ["Alphabet & Sounds", "Basic Greetings", "Numbers", "Colors & Shapes", "Family & Home", "Everyday Objects"],
  },
  {
    id: "B",
    name: "SFI Course B",
    subtitle: "Beginner",
    description: "Build sentences, talk about daily routines, shopping, and Swedish society basics.",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    level: "beginner",
    topics: ["Daily Routines", "Shopping & Food", "Transport", "Health & Body", "Time & Calendar", "Swedish Society"],
  },
  {
    id: "C",
    name: "SFI Course C",
    subtitle: "Intermediate",
    description: "Express opinions, navigate work life, understand Swedish culture and news.",
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    level: "intermediate",
    topics: ["Work & Jobs", "Swedish Culture", "News & Media", "Rights & Duties", "Environment", "Healthcare System"],
  },
  {
    id: "D",
    name: "SFI Course D",
    subtitle: "Advanced",
    description: "Master complex grammar, read authentic texts, and prepare for citizenship.",
    color: "from-orange-400 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    level: "advanced",
    topics: ["Complex Grammar", "Academic Reading", "Formal Writing", "Debate & Opinion", "Swedish History", "Citizenship Prep"],
  },
];

const SKILL_FILTERS = [
  { key: "all", emoji: "✨", label: "All Skills" },
  { key: "vocabulary", emoji: "📝", label: "Vocabulary" },
  { key: "grammar", emoji: "🔤", label: "Grammar" },
  { key: "reading", emoji: "📖", label: "Reading" },
  { key: "writing", emoji: "✍️", label: "Writing" },
  { key: "speaking", emoji: "🗣️", label: "Speaking" },
  { key: "listening", emoji: "👂", label: "Listening" },
];

const exerciseBadge = (lesson) => {
  const parts = [];
  if (lesson.fill_in_blanks?.length) parts.push(`${lesson.fill_in_blanks.length} fill-in`);
  if (lesson.writing_prompts?.length) parts.push(`${lesson.writing_prompts.length} writing`);
  if (lesson.speaking_phrases?.length) parts.push(`${lesson.speaking_phrases.length} speaking`);
  if (lesson.word_pairs?.length) parts.push(`${lesson.word_pairs.length} words`);
  if (lesson.quiz_questions?.length) parts.push(`${lesson.quiz_questions.length} quiz`);
  return parts.slice(0, 2).join(" · ");
};

export default function LanguageLessons() {
  const [activeCourse, setActiveCourse] = useState(null); // null = show all courses overview
  const [skillFilter, setSkillFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => base44.entities.Lesson.list("order", 200),
  });

  // Count lessons per SFI course
  const countByCourse = (courseId) =>
    lessons.filter((l) => l.sfi_course === courseId).length;

  // Filter lessons for the active course view
  const filteredLessons = lessons.filter((l) => {
    const courseMatch = !activeCourse || l.sfi_course === activeCourse;
    const skillMatch = skillFilter === "all" || l.skill === skillFilter || l.category === skillFilter;
    return courseMatch && skillMatch;
  });

  const activeCourseData = SFI_COURSES.find((c) => c.id === activeCourse);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <GenerateLessonModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["lessons"] })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          {activeCourse && (
            <button
              onClick={() => { setActiveCourse(null); setSkillFilter("all"); }}
              className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1 transition-colors"
            >
              ← All Courses
            </button>
          )}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {activeCourseData ? activeCourseData.name : "Swedish Language (SFI)"}
            </h1>
          </div>
          <p className="text-muted-foreground ml-13">
            {activeCourseData ? activeCourseData.description : "Structured learning following Sweden's official SFI curriculum"}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowGenerate(true)} className="gap-2 shrink-0">
            <Sparkles className="w-4 h-4" />
            Generate Lesson with AI
          </Button>
        )}
      </div>

      {/* Course overview (Babbel-style path selector) */}
      {!activeCourse ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {SFI_COURSES.map((course, i) => {
              const count = countByCourse(course.id);
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <button
                    onClick={() => setActiveCourse(course.id)}
                    className={`w-full text-left rounded-2xl border-2 ${course.border} ${course.bg} p-6 hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${course.badge}`}>
                          Course {course.id}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{course.name}</h2>
                        <p className="text-sm font-medium text-muted-foreground">{course.subtitle}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-white font-display font-bold text-xl shadow-md`}>
                        {course.id}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.topics.map((topic) => (
                        <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border/40 text-muted-foreground">
                          {topic}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {count > 0 ? `${count} lesson${count !== 1 ? "s" : ""}` : "No lessons yet"}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground group-hover:gap-2 transition-all">
                        {count > 0 ? "Start learning" : "Generate lessons"} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* All lessons (no course tag) */}
          {lessons.filter((l) => !l.sfi_course).length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">Other Lessons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons.filter((l) => !l.sfi_course).map((lesson, index) => (
                  <LessonCard key={lesson.id} lesson={lesson} index={index} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Skill filter for course view */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {SKILL_FILTERS.map(({ key, emoji, label }) => (
                <button
                  key={key}
                  onClick={() => setSkillFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    skillFilter === key
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span>{emoji}</span> {label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                </CardContent></Card>
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={`No lessons in Course ${activeCourse} yet`}
              description={isAdmin ? 'Use "Generate Lesson with AI" to create lessons for this course.' : "Check back soon — lessons are being added!"}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson, index) => (
                <LessonCard key={lesson.id} lesson={lesson} index={index} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LessonCard({ lesson, index }) {
  const skill = lesson.skill || lesson.category;
  const skillEmoji = {
    reading: "📖", writing: "✍️", speaking: "🗣️", listening: "👂",
    vocabulary: "📝", grammar: "🔤", phrases: "💬", pronunciation: "🔊",
  }[skill] || "✨";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/language/${lesson.id}`}>
        <Card className="group h-full border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <LevelBadge level={lesson.level} />
              <div className="flex items-center gap-2">
                {lesson.sfi_course && (
                  <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                    SFI {lesson.sfi_course}
                  </span>
                )}
                <span className="text-xl">{skillEmoji}</span>
              </div>
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors leading-snug">
              {lesson.title}
            </h3>
            {lesson.title_sv && (
              <p className="text-sm text-muted-foreground italic mb-3">{lesson.title_sv}</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{exerciseBadge(lesson)}</span>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}