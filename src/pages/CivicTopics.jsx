import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { Landmark, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CategoryBadge from "../components/shared/CategoryBadge";
import EmptyState from "../components/shared/EmptyState";
import { motion } from "framer-motion";
import GenerateTopicModal from "../components/civic/GenerateTopicModal";
import GenerateCivicContentButton from "../components/civic/GenerateCivicContentButton";

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
  const [showGenerate, setShowGenerate] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["civicTopics"],
    queryFn: () => base44.entities.CivicTopic.list("order", 100),
  });

  // Deduplicate by title, keeping first occurrence
  const uniqueTopics = Array.from(
    new Map(topics.map(t => [t.title.toLowerCase(), t])).values()
  );

  const filtered = categoryFilter === "all"
    ? uniqueTopics
    : uniqueTopics.filter((t) => t.category === categoryFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <GenerateTopicModal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["civicTopics"] })}
      />
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-secondary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Förberedelse för samhällsprovet</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Lär dig om det svenska samhället, staten och kulturen
        </p>
        <p className="text-muted-foreground/60 text-sm italic mt-0.5">
          Learn about Swedish society, government, and culture
        </p>
      </div>

      {isAdmin && (
        <div className="mb-8 space-y-3">
          <GenerateCivicContentButton
            existingCount={topics.length}
            onDone={() => queryClient.invalidateQueries({ queryKey: ["civicTopics"] })}
          />
          <Button onClick={() => setShowGenerate(true)} variant="outline" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Generera eget ämne med AI
          </Button>
        </div>
      )}

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
          title="Inga ämnen ännu · No topics yet"
          description="Ämnen för samhällsprovet visas här när de har lagts till. · Civic test topics will appear here once they are added."
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
                    {topic.subtitle && (
                      <p className="text-sm text-muted-foreground/70 italic mb-2">{topic.subtitle}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}