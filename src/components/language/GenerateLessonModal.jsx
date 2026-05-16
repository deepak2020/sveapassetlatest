import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SFI_COURSES } from "@/pages/LanguageLessons";

export default function GenerateLessonModal({ open, onClose, onCreated }) {
  const [topic, setTopic] = useState("");
  const [skill, setSkill] = useState("reading");
  const [level, setLevel] = useState("beginner");
  const [sfiCourse, setSfiCourse] = useState("A");
  const [loading, setLoading] = useState(false);

  const courseData = SFI_COURSES.find(c => c.id === sfiCourse);
  const availableTopics = courseData ? courseData.topics : [];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a Swedish language learning lesson for citizenship/immigration students.

Topic: "${topic}"
Skill focus: ${skill}
Level: ${level}

Return a JSON object with ALL of the following:
- title: lesson title in English
- title_sv: lesson title in Swedish
- content: detailed markdown content (3-4 paragraphs teaching the topic with examples in Swedish and English)
- word_pairs: array of 6-8 objects each with "swedish", "english", "example_sv" (a sentence using the word), "example_en" (translation of example)
- fill_in_blanks: array of 5-6 Clozemaster-style objects with "sentence_sv" (Swedish sentence with ___ for the missing word), "sentence_en" (English translation), "answer" (the missing word), "options" (array of 4 choices including the answer)
- writing_prompts: array of 3 objects with "prompt" (what to write about in Swedish), "hint" (helpful tip), "example_answer" (a sample short answer in Swedish)
- speaking_phrases: array of 5-6 objects with "phrase_sv" (Swedish phrase), "phrase_en" (English meaning), "pronunciation_tip" (how to pronounce key sounds)
- quiz_questions: array of 4 multiple-choice questions each with "question", "options" (4 choices), "correct_index" (0-3)

Make all content practical for everyday life in Sweden.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          title_sv: { type: "string" },
          content: { type: "string" },
          word_pairs: { type: "array", items: { type: "object" } },
          fill_in_blanks: { type: "array", items: { type: "object" } },
          writing_prompts: { type: "array", items: { type: "object" } },
          speaking_phrases: { type: "array", items: { type: "object" } },
          quiz_questions: { type: "array", items: { type: "object" } }
        }
      }
    });

    await base44.entities.Lesson.create({
      title: result.title || topic,
      title_sv: result.title_sv,
      topic: topic,
      category: skill === "reading" ? "reading" : skill === "writing" ? "writing" : skill === "speaking" ? "speaking" : "vocabulary",
      skill,
      level,
      sfi_course: sfiCourse,
      content: result.content,
      word_pairs: result.word_pairs || [],
      fill_in_blanks: result.fill_in_blanks || [],
      writing_prompts: result.writing_prompts || [],
      speaking_phrases: result.speaking_phrases || [],
      quiz_questions: result.quiz_questions || [],
    });

    setLoading(false);
    setTopic("");
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Lesson with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>SFI Course</Label>
            <Select value={sfiCourse} onValueChange={(val) => {
              setSfiCourse(val);
              setTopic("");
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Course A — Absolute Beginner</SelectItem>
                <SelectItem value="B">Course B — Beginner</SelectItem>
                <SelectItem value="C">Course C — Intermediate</SelectItem>
                <SelectItem value="D">Course D — Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic..." />
              </SelectTrigger>
              <SelectContent>
                {availableTopics.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Skill Focus</Label>
              <Select value={skill} onValueChange={setSkill}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">📖 Reading</SelectItem>
                  <SelectItem value="writing">✍️ Writing</SelectItem>
                  <SelectItem value="speaking">🗣️ Speaking</SelectItem>
                  <SelectItem value="listening">👂 Listening</SelectItem>
                  <SelectItem value="vocabulary">📝 Vocabulary</SelectItem>
                  <SelectItem value="grammar">🔤 Grammar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🟢 Beginner</SelectItem>
                  <SelectItem value="intermediate">🟡 Intermediate</SelectItem>
                  <SelectItem value="advanced">🔴 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating lesson...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Lesson</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}