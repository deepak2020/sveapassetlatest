import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Landmark, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function CivicTopics() {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["civicTopics"],
    queryFn: () => base44.entities.CivicTopic.list("order", 100),
  });

  const filtered = categoryFilter === "all"
    ? topics
    : topics.filter((t) => t.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Civic Test Prep</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Learn about Swedish society, government, and culture
        </p>
      </div>

      {/* Filters */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="mb-8">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="government">Government</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="culture">Culture</TabsTrigger>
          <TabsTrigger value="rights_duties">Rights & Duties</TabsTrigger>
          <TabsTrigger value="society">Society</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Topics Grid */}
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
          title="No topics yet"
          description="Civic test topics will appear here once they are added."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((topic, index) => (
            <motion.div
              key={topic.id}
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
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {topic.key_facts?.length || 0} facts · {topic.quiz_questions?.length || 0} questions
                      </span>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}