import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import LevelBadge from "../components/shared/LevelBadge";
import EmptyState from "../components/shared/EmptyState";
import GenerateLessonModal from "../components/language/GenerateLessonModal";
import { motion } from "framer-motion";

const skillConfig = {
  all:       { emoji: "✨", label: "All" },
  reading:   { emoji: "📖", label: "Reading" },
  writing:   { emoji: "✍️", label: "Writing" },
  speaking:  { emoji: "🗣️", label: "Speaking" },
  listening: { emoji: "👂", label: "Listening" },
  vocabulary:{ emoji: "📝", label: "Vocabulary" },
  grammar:   { emoji: "🔤", label: "Grammar" },
};

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
  const [skillFilter, setSkillFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [showGenerate, setShowGenerate] = useState(false);
  const queryClient = useQueryClient();

  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ["lessons"],
    queryFn: () => base44.entities.Lesson.list("order", 100),
  });

  const filtered = lessons.filter((l) => {
    const skillMatch = skillFilter === "all" || l.skill === skillFilter || l.category === skillFilter;
    const levelMatch = levelFilter === "all" || l.level === levelFilter;
    return skillMatch && levelMatch;
  });

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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Swedish Language</h1>
          </div>
          <p className="text-muted-foreground ml-13">Practice reading, writing, speaking & more</p>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="gap-2 shrink-0">
          <Sparkles className="w-4 h-4" />
          Generate Lesson with AI
        </Button>
      </div>

      {/* Skill track tabs */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skill</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(skillConfig).map(([key, { emoji, label }]) => (
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

      {/* Level filter */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Level</p>
        <Tabs value={levelFilter} onValueChange={setLevelFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="beginner">🟢 Beginner</TabsTrigger>
            <TabsTrigger value="intermediate">🟡 Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">🔴 Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Lessons Grid */}
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
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No lessons yet"
          description='Click "Generate Lesson with AI" to create your first lesson!'
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lesson, index) => {
            const skill = lesson.skill || lesson.category;
            const cfg = skillConfig[skill] || skillConfig.all;
            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Link to={`/language/${lesson.id}`}>
                  <Card className="group h-full border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 overflow-hidden">
                    {/* top color strip */}
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <LevelBadge level={lesson.level} />
                        <span className="text-xl">{cfg.emoji}</span>
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
          })}
        </div>
      )}
    </div>
  );
}