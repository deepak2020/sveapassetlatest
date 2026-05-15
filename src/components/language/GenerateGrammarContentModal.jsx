import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const SFI_LEVELS = ["A", "B", "C", "D"];
const GRAMMAR_TOPICS = [
  "V2 Rule (Verb-Second Position)",
  "Cases and Gender",
  "Pronouns and Articles",
  "Tenses and Aspects",
  "Prepositions and Particles",
  "Sentence Structure",
  "Adjectives and Adverbs",
  "Modal Verbs",
];

export default function GenerateGrammarContentModal({ open, onOpenChange }) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("A");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!topic || !level) return;

    setLoading(true);
    try {
      const prompt = `Generate a comprehensive Swedish grammar lesson for SFI ${level} level on the topic: "${topic}".

Include:
1. **Explanation**: Clear explanation of the grammar rule in English
2. **Swedish Examples**: 5-7 real Swedish sentences demonstrating the rule
3. **Key Points**: 2-3 critical points to remember
4. **Practice Exercises**: 
   - 5 fill-in-the-blank sentences with options
   - 3 multiple-choice comprehension questions
5. **Word Pairs**: Vocabulary pairs related to this grammar topic (Swedish/English)

Return as JSON with structure:
{
  "title": "Topic title",
  "title_sv": "Swedish title",
  "explanation": "Clear explanation",
  "key_points": ["point1", "point2"],
  "word_pairs": [{"swedish": "", "english": ""}],
  "fill_in_blanks": [{"sentence_sv": "", "sentence_en": "", "answer": "", "options": []}],
  "quiz_questions": [{"question_sv": "", "question_en": "", "options": [], "correct_index": 0}]
}`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            title_sv: { type: "string" },
            explanation: { type: "string" },
            key_points: { type: "array", items: { type: "string" } },
            word_pairs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  swedish: { type: "string" },
                  english: { type: "string" },
                },
              },
            },
            fill_in_blanks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sentence_sv: { type: "string" },
                  sentence_en: { type: "string" },
                  answer: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                },
              },
            },
            quiz_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question_sv: { type: "string" },
                  question_en: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_index: { type: "number" },
                },
              },
            },
          },
        },
      });

      // Save as a lesson
      await base44.entities.Lesson.create({
        title: result.title,
        title_sv: result.title_sv,
        sfi_course: level,
        category: "grammar",
        skill: "grammar",
        level: level === "A" ? "beginner" : level === "B" ? "intermediate" : "advanced",
        content: result.explanation,
        word_pairs: result.word_pairs || [],
        fill_in_blanks: result.fill_in_blanks || [],
        quiz_questions: result.quiz_questions || [],
      });

      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      onOpenChange(false);
      setTopic("");
      setLevel("A");
      alert(`✓ Generated grammar lesson: ${result.title}`);
    } catch (error) {
      alert(`✗ Generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Grammar Lesson</DialogTitle>
          <DialogDescription>
            Create AI-powered grammar lessons with exercises
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Grammar Topic</label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic..." />
              </SelectTrigger>
              <SelectContent>
                {GRAMMAR_TOPICS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Custom Topic</label>
            <Input
              placeholder="Or type a custom grammar topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">SFI Level</label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SFI_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    SFI {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!topic || !level || loading}
            className="gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Generating..." : "Generate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}