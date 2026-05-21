import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryBadge from "../components/shared/CategoryBadge";
import CivicQuizRunner from "../components/civic/CivicQuizRunner";
import ReactMarkdown from "react-markdown";

export default function TopicDetail() {
  const pathParts = window.location.pathname.split("/");
  const topicId = pathParts[pathParts.length - 1];

  const { data: topic, isLoading } = useQuery({
    queryKey: ["civicTopic", topicId],
    queryFn: async () => {
      const topics = await base44.entities.CivicTopic.filter({ id: topicId });
      return topics[0];
    },
    enabled: !!topicId,
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

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-muted-foreground">Topic not found.</p>
        <Link to="/civic">
          <Button variant="outline" className="mt-4 gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to topics
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back navigation */}
      <Link to="/civic" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to all topics
      </Link>

      {/* Header */}
      <div className="mb-8">
        <CategoryBadge category={topic.category} />
        <h1 className="font-display text-3xl font-bold text-foreground mt-3">{topic.title}</h1>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Innehål · Content</TabsTrigger>
          {topic.key_facts?.length > 0 && (
            <TabsTrigger value="facts">Nyckeltal · Key Facts ({topic.key_facts.length})</TabsTrigger>
          )}
          {topic.quiz_questions?.length > 0 && (
            <TabsTrigger value="quiz">Frågor · Quiz ({topic.quiz_questions.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="content">
          {topic.content ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{topic.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground">No content available yet.</p>
          )}
        </TabsContent>

        {topic.key_facts?.length > 0 && (
          <TabsContent value="facts">
            <div className="space-y-4">
              {topic.key_facts.map((fact, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Lightbulb className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fact.fact}</p>
                      {fact.detail && (
                        <p className="text-sm text-muted-foreground mt-1">{fact.detail}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}

        {topic.quiz_questions?.length > 0 && (
          <TabsContent value="quiz">
            <CivicQuizRunner
              questions={topic.quiz_questions}
              quizType="civic"
              sourceId={topic.id}
              sourceTitle={topic.title}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}