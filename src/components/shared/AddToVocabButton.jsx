import { useState } from "react";
import { BookmarkPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function AddToVocabButton({ swedish, english, lessonId, lessonTitle, exampleSentence }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToVocab = async () => {
    setLoading(true);
    try {
      await base44.entities.UserVocabulary.create({
        swedish,
        english,
        lesson_id: lessonId,
        lesson_title: lessonTitle,
        example_sentence: exampleSentence,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add to vocabulary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={added ? "default" : "outline"}
      onClick={handleAddToVocab}
      disabled={loading || added}
      className="gap-1.5"
    >
      {added ? (
        <>
          <Check className="w-4 h-4" /> Added
        </>
      ) : (
        <>
          <BookmarkPlus className="w-4 h-4" /> Add to Vocab
        </>
      )}
    </Button>
  );
}