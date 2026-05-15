import { useState } from "react";
import { BookmarkPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function AddVocabDialog() {
  const [open, setOpen] = useState(false);
  const [swedish, setSwedish] = useState("");
  const [english, setEnglish] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!swedish.trim() || !english.trim()) return;
    
    setLoading(true);
    try {
      await base44.entities.UserVocabulary.create({
        swedish: swedish.trim(),
        english: english.trim(),
      });
      setSwedish("");
      setEnglish("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to add vocabulary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center justify-center w-14 h-14 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all"
      >
        <BookmarkPlus className="w-6 h-6" />
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dialog */}
      {open && (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 bg-card rounded-t-2xl md:rounded-2xl p-6 md:max-w-md md:w-full md:shadow-lg border-t md:border border-border/50 animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Add Word to Vocab</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                Swedish
              </label>
              <Input
                placeholder="e.g. hej"
                value={swedish}
                onChange={(e) => setSwedish(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">
                English
              </label>
              <Input
                placeholder="e.g. hello"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={loading || !swedish.trim() || !english.trim()}
              className="flex-1 h-11"
            >
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}