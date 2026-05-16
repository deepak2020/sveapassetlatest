import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LevelBadge from "../components/shared/LevelBadge";
import EmptyState from "../components/shared/EmptyState";
import GrammarModule from "../components/language/GrammarModule";
import { motion } from "framer-motion";

import { SFI_COURSES } from "@/lib/course-constants";

const SKILL_FILTERS = [
  { key: "all", emoji: "✨", label: "Alla Färdigheter", label_en: "All Skills" },
  { key: "vocabulary", emoji: "📝", label: "Ordförråd", label_en: "Vocabulary" },
  { key: "grammar", emoji: "🔤", label: "Grammatik", label_en: "Grammar" },
  { key: "reading", emoji: "📖", label: "Läsning", label_en: "Reading" },
  { key: "writing", emoji: "✍️", label: "Skrivning", label_en: "Writing" },
  { key: "speaking", emoji: "🗣️", label: "Tal", label_en: "Speaking" },
];

const exerciseBadge = (lesson) => {
  const parts = [];
  if (lesson.fill_in_blanks?.length) parts.push(`${lesson.fill_in_blanks.length} fyllning`);
  if (lesson.quiz_questions?.length) parts.push(`${lesson.quiz_questions.length} quiz`);
  if (lesson.word_pairs?.length) parts.push(`${lesson.word_pairs.length} kort`);
  return parts.slice(0, 2).join(" · ") || "Interaktiv Lektion";
};

export default function LanguageLessons() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [skillFilter, setSkillFilter] = useState("all");

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => base44.entities.Lesson.list("order", 500),
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
      {/* Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          {activeCourse && (
            <button
              onClick={() => { setActiveCourse(null); setSkillFilter("all"); }}
              className="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1 transition-colors h-10 px-3 rounded-lg hover:bg-muted/50"
            >
              ← Tillbaka till alla kurser · <em className="font-normal italic">Back to All Courses</em>
            </button>
          )}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight">
              {activeCourseData ? activeCourseData.name : "Svenska Språkkurser"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            {activeCourseData 
              ? activeCourseData.description 
              : "Lär dig svenska från grunden till flytande tal med våra strukturerade kurser."}
          </p>
          {!activeCourseData && (
            <p className="text-muted-foreground/60 text-sm italic mt-1 max-w-2xl">
              Learn Swedish from beginner to fluent with our structured courses.
            </p>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="lessons" className="w-full mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="lessons">Lektioner · Lessons</TabsTrigger>
          <TabsTrigger value="grammar">Grammatik · Grammar</TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons">
      {!activeCourse ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SFI_COURSES.map((course, i) => {
            return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col gap-4"
            >
              <button
                onClick={() => setActiveCourse(course.id)}
                className={`w-full text-left rounded-3xl border-2 ${course.border} ${course.bg} p-8 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4 ${course.badge}`}>
                    Modul {course.id}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{course.name}</h2>
                  <p className="text-sm italic text-muted-foreground font-medium mb-1">{course.name_en}</p>
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
                      {countByCourse(course.id)} enheter tillgängliga · <span className="font-normal italic">units available</span>
                    </span>
                    <div className={`p-2 rounded-full bg-gradient-to-r ${course.color} text-white`}>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 pb-2 border-b border-border/50">
            {SKILL_FILTERS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSkillFilter(s.key)}
                className={`px-4 py-3 md:py-2 rounded-xl text-sm font-semibold transition-all min-h-10 ${
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
            <EmptyState title="Enheter laddas · Units Loading" description="Nya lektioner för denna nivå skapas just nu. · New lessons for this level are being created now." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson, idx) => (
                <LessonCard key={lesson.id} lesson={lesson} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}
      </TabsContent>

      {/* Grammar Tab */}
      <TabsContent value="grammar">
      <GrammarModule />
      </TabsContent>
      </Tabs>
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
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:opacity-100 transition-opacity">
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