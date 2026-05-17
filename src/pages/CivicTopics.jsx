import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Landmark, ArrowRight, BookOpen, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CategoryBadge from "../components/shared/CategoryBadge";
import EmptyState from "../components/shared/EmptyState";
import { motion } from "framer-motion";

const categoryIcons = {
  government: "🏛️",
  history: "📜",
  culture: "🎭",
  rights_duties: "⚖️",
  society: "👥",
  geography: "🗺️",
};

// Chapter order as they appear in Sverige i Fokus
const CHAPTER_ORDER = [
  "Landet Sverige",
  "Sveriges demokratiska system",
  "Så här styrs Sverige",
  "Politiska val och partier",
  "Lag och rätt",
  "Mediernas roll",
  "Mänskliga rättigheter",
  "Arbetsmarknad och privatekonomi",
  "Välfärdssamhället",
  "Sveriges moderna historia",
  "Sverige och omvärlden",
  "En sekulär stat och ett mångreligiöst land",
  "Traditioner och högtider",
];

export default function CivicTopics() {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["civicTopics"],
    queryFn: () => base44.entities.CivicTopic.list("-created_date", 200),
  });

  // Deduplicate by title, keeping first occurrence
  const uniqueTopics = Array.from(
    new Map(topics.map(t => [t.title.toLowerCase(), t])).values()
  );

  const filtered = categoryFilter === "all"
    ? uniqueTopics
    : uniqueTopics.filter((t) => t.category === categoryFilter);

  // Group by chapter, preserving Sverige i Fokus chapter order
  const groupedByChapter = filtered.reduce((acc, topic) => {
    const chapter = topic.chapter || "Övrigt";
    if (!acc[chapter]) acc[chapter] = [];
    acc[chapter].push(topic);
    return acc;
  }, {});

  const sortedChapters = Object.keys(groupedByChapter).sort((a, b) => {
    const ai = CHAPTER_ORDER.indexOf(a);
    const bi = CHAPTER_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Flat view for non-"all" category filter (no chapter grouping needed)
  const useChapterView = categoryFilter === "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Förberedelse för medborgarskapsprovet
          </h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Lär dig om det svenska samhället, staten och kulturen
        </p>
        <p className="text-muted-foreground/60 text-sm italic mt-0.5">
          Based on <span className="font-medium not-italic">Sverige i Fokus</span> — the official UHR citizenship test study material
        </p>

        {/* Mock exam CTA */}
        <Link
          to="/citizenship-test"
          className="mt-6 block rounded-2xl border border-secondary/30 bg-gradient-to-r from-secondary/20 to-secondary/5 p-5 sm:p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground mb-0.5">
                Provläge · <span className="italic font-normal">Test mode</span>
              </p>
              <h3 className="font-display text-lg font-bold text-foreground">
                Gör ett medborgarskapsprov
              </h3>
              <p className="text-sm text-muted-foreground italic">
                25 questions · 30 min · simulates the official exam
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-secondary-foreground group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
      </div>

      {/* Filters */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="mb-8">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Alla ämnen</TabsTrigger>
          <TabsTrigger value="government">Staten</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
          <TabsTrigger value="culture">Kultur</TabsTrigger>
          <TabsTrigger value="rights_duties">Rättigheter & skyldigheter</TabsTrigger>
          <TabsTrigger value="society">Samhälle</TabsTrigger>
          <TabsTrigger value="geography">Geografi</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Topics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Inga ämnen ännu · No topics yet"
          description="Ämnen för medborgarskapsprovet visas här när de har lagts till. · Citizenship test topics will appear here once they are added."
        />
      ) : useChapterView ? (
        // Chapter-grouped view (Sverige i Fokus order)
        <div className="space-y-12">
          {sortedChapters.map((chapter, chapterIndex) => (
            <motion.div
              key={chapter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: chapterIndex * 0.08 }}
            >
              {/* Chapter heading */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{chapter}</h2>
                  <p className="text-xs text-muted-foreground/60">
                    Kapitel {CHAPTER_ORDER.indexOf(chapter) + 1} · Sverige i Fokus
                  </p>
                </div>
                <div className="flex-1 h-px bg-border/50 ml-2" />
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {groupedByChapter[chapter].length} ämnen
                </span>
              </div>

              {/* Topics grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedByChapter[chapter]
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((topic, index) => (
                    <TopicCard key={topic.id} topic={topic} index={index} />
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        // Flat grid view for category filter
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((topic, index) => (
              <TopicCard key={topic.id} topic={topic} index={index} />
            ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/civic/${topic.id}`}>
        <Card className="group h-full border-border/50 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{categoryIcons[topic.category] || "📋"}</span>
              <CategoryBadge category={topic.category} />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
              {topic.title}
            </h3>
            {topic.subtitle && (
              <p className="text-sm text-muted-foreground/70 italic mb-2">{topic.subtitle}</p>
            )}
            {topic.chapter && (
              <p className="text-xs text-muted-foreground/50 mb-2">{topic.chapter}</p>
            )}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {topic.key_facts?.length || 0} fakta · {topic.quiz_questions?.length || 0} frågor
                <span className="italic text-muted-foreground/60"> · facts · questions</span>
              </span>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}