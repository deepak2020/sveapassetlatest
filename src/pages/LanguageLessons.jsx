import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LevelBadge from "../components/shared/LevelBadge";
import EmptyState from "../components/shared/EmptyState";
import GenerateLessonModal from "../components/language/GenerateLessonModal";
import GenerateContentButton from "../components/language/GenerateContentButton";
import { motion } from "framer-motion";

const SFI_COURSES = [
  {
    id: "A",
    name: "Course A: Foundation",
    subtitle: "Absolute Beginner (A1)",
    description: "Learn your first Swedish words — greetings, numbers, time, family, and essential survival phrases. Master Swedish vowel sounds including Å, Ä, and Ö.",
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    level: "beginner",
    topics: ["Greetings & Introductions", "Pronunciation (Å, Ä, Ö)", "Numbers & Time", "En & Ett Nouns", "Family Members", "Ordering Food & Fika", "Asking Directions", "Emergency Phrases"],
  },
  {
    id: "B",
    name: "Course B: Daily Life",
    subtitle: "Beginner (A2)",
    description: "Build independence in Swedish daily life — shopping, transport, healthcare, and household routines. Learn the V2 word-order rule and past tense.",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    level: "beginner",
    topics: ["Shopping & Prices", "Plural Nouns", "Definite & Indefinite Forms", "Transport & Travel", "Daily Routines", "Adjective Agreement", "Past Tense", "Nature & Allemansrätten"],
  },
  {
    id: "C",
    name: "Course C: Integration",
    subtitle: "Intermediate (B1)",
    description: "Swedish for real-life integration — workplace communication, housing, formal writing, and reading news. Master complex grammar including subordinate clauses and perfect tense.",
    color: "from-violet-400 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    border: "border-violet-200 dark:border-violet-800",
    badge: "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
    level: "intermediate",
    topics: ["Workplace Swedish", "Perfect & Pluperfect Tense", "Subordinate Clauses", "Swedish Housing", "Email & Formal Writing", "Reading News", "Environment & Sustainability", "Försäkringskassan"],
  },
  {
    id: "D",
    name: "Course D: Advanced",
    subtitle: "Advanced (B2)",
    description: "Master advanced Swedish grammar, academic vocabulary, and formal expression. Write structured arguments, read complex texts, and speak fluently in professional settings.",
    color: "from-orange-400 to-red-500",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    level: "advanced",
    topics: ["Passive Voice", "Modal Verbs", "Conditional Sentences", "Complex Word Order", "Academic Vocabulary", "Idiomatic Expressions", "Formal Reports & Letters", "Job Applications"],
  },
];

const SKILL_FILTERS = [
  { key: "all", emoji: "✨", label: "All Skills" },
  { key: "vocabulary", emoji: "📝", label: "Vocabulary" },
  { key: "grammar", emoji: "🔤", label: "Grammar" },
  { key: "reading", emoji: "📖", label: "Reading" },
  { key: "writing", emoji: "✍️", label: "Writing" },
  { key: "speaking", emoji: "🗣️", label: "Speaking" },
];

const exerciseBadge = (lesson) => {
  const parts = [];
  if (lesson.fill_in_blanks?.length) parts.push(`${lesson.fill_in_blanks.length} fill-in`);
  if (lesson.quiz_questions?.length) parts.push(`${lesson.quiz_questions.length} quiz`);
  if (lesson.word_pairs?.length) parts.push(`${lesson.word_pairs.length} cards`);
  return parts.slice(0, 2).join(" · ") || "Interactive Lesson";
};

export default function LanguageLessons() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [skillFilter, setSkillFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => base44.entities.Lesson.list("order", 200),
  });

  const countByCourse = (courseId) => lessons.filter((l) => l.sfi_course === courseId).length;

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

      {/* Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          {activeCourse && (
            <button
              onClick={() => { setActiveCourse(null); setSkillFilter("all"); }}
              className="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1 transition-colors"
            >
              ← Back to All Courses
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight">
              {activeCourseData ? activeCourseData.name : "Vägen till Medborgarskap"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            {activeCourseData 
              ? activeCourseData.description 
              : "Master the Swedish language and pass the 2026 civic knowledge requirements with our structured SFI curriculum."}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowGenerate(true)} size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5" />
            AI Course Creator
          </Button>
        )}
      </div>

      {!activeCourse && isAdmin && lessons.length > 0 && (
        <div className="mb-6">
          <GenerateContentButton
            lessons={lessons}
            regenerateAll={false}
            autoStart={true}
            onDone={() => queryClient.invalidateQueries({ queryKey: ["lessons"] })}
          />
        </div>
      )}

      {!activeCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SFI_COURSES.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                onClick={() => setActiveCourse(course.id)}
                className={`w-full text-left rounded-3xl border-2 ${course.border} ${course.bg} p-8 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${course.badge}`}>
                    Module {course.id}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{course.name}</h2>
                  <p className="text-muted-foreground font-medium mb-6">{course.subtitle}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {course.topics.map((t) => (
                      <span key={t} className="px-3 py-1 bg-background/50 rounded-lg text-xs font-medium border border-border/20">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold text-primary">
                      {countByCourse(course.id)} Units Available
                    </span>
                    <div className={`p-2 rounded-full bg-gradient-to-r ${course.color} text-white`}>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {isAdmin && (
            <GenerateContentButton
              lessons={filteredLessons}
              onDone={() => queryClient.invalidateQueries({ queryKey: ["lessons"] })}
            />
          )}
          {/* Filters */}
          <div className="flex flex-wrap gap-3 pb-2 border-b border-border/50">
            {SKILL_FILTERS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSkillFilter(s.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  skillFilter === s.key 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => <Skeleton key={n} className="h-48 rounded-2xl" />)}
            </div>
          ) : filteredLessons.length === 0 ? (
            <EmptyState title="Units Loading" description="New lessons for this level are currently being curated by our educators." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson, idx) => (
                <LessonCard key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/language/${lesson.id}`}>
        <Card className="h-full hover:shadow-2xl hover:-translate-y-1 transition-all border-border/40 overflow-hidden group">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <LevelBadge level={lesson.level} />
                <span className="text-xs font-black text-muted-foreground bg-muted px-2 py-1 rounded">
                  {lesson.category?.toUpperCase() || "VOCAB"}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                {lesson.title}
              </h3>
              <p className="text-sm text-muted-foreground italic mb-4">
                {lesson.title_sv}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <span className="text-xs font-medium text-muted-foreground">
                  {exerciseBadge(lesson)}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}