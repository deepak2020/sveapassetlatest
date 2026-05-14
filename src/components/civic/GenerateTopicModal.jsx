import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function GenerateTopicModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("government");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) return;
    setLoading(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a comprehensive Swedish civic education topic for citizenship test preparation.

Topic title: "${title}"
Category: ${category}

Return a JSON object with:
- content: detailed markdown content (3-5 paragraphs explaining the topic clearly for immigrants learning about Sweden)
- key_facts: array of 4-6 objects with "fact" (short statement) and "detail" (1-2 sentence explanation)
- quiz_questions: array of 4 multiple-choice questions, each with:
  - question: the question text
  - options: array of exactly 4 answer strings
  - correct_index: index (0-3) of the correct answer

Make sure the content is accurate, factual, and relevant to Swedish society and citizenship.`,
      response_json_schema: {
        type: "object",
        properties: {
          content: { type: "string" },
          key_facts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                fact: { type: "string" },
                detail: { type: "string" }
              }
            }
          },
          quiz_questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_index: { type: "number" }
              }
            }
          }
        }
      }
    });

    const newTopic = await base44.entities.CivicTopic.create({
      title: title.trim(),
      category,
      content: result.content,
      key_facts: result.key_facts,
      quiz_questions: result.quiz_questions,
    });

    setLoading(false);
    setTitle("");
    setCategory("government");
    onCreated(newTopic);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary-foreground" />
            Generate Topic with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Topic title</Label>
            <Input
              placeholder="e.g. The Swedish Healthcare System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="history">History</SelectItem>
                <SelectItem value="culture">Culture</SelectItem>
                <SelectItem value="rights_duties">Rights & Duties</SelectItem>
                <SelectItem value="society">Society</SelectItem>
                <SelectItem value="geography">Geography</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!title.trim() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Topic
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}