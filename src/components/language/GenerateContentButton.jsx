import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";

export default function GenerateContentButton({ lessons, onDone }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "", errors: [] });

  const emptyLessons = lessons.filter(
    (l) => !l.content && (!l.fill_in_blanks || l.fill_in_blanks.length === 0)
  );

  const handleGenerate = async () => {
    if (!emptyLessons.length) return;
    setRunning(true);
    const errors = [];
    setProgress({ done: 0, total: emptyLessons.length, current: "", errors });

    for (let i = 0; i < emptyLessons.length; i++) {
      const lesson = emptyLessons[i];
      setProgress((p) => ({ ...p, current: lesson.title, done: i }));
      try {
        await base44.functions.invoke("generateLessonContent", { lesson_id: lesson.id });
      } catch (e) {
        errors.push(lesson.title);
      }
    }

    setProgress({ done: emptyLessons.length, total: emptyLessons.length, current: "Done!", errors });
    setRunning(false);
    onDone?.();
  };

  if (emptyLessons.length === 0) return null;

  return (
    <div className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {emptyLessons.length} lessons have no content yet
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Generate word pairs, exercises, and quizzes using AI
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={running}
          className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Zap className="w-4 h-4" />
          {running ? `Generating... (${progress.done}/${progress.total})` : `Generate All ${emptyLessons.length} Lessons`}
        </Button>
      </div>

      {running && (
        <div className="mt-4 space-y-2">
          <Progress value={(progress.done / progress.total) * 100} className="h-2" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {progress.current && `Processing: ${progress.current}`}
          </p>
        </div>
      )}

      {!running && progress.done > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {progress.errors.length === 0 ? (
            <><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-green-700">All {progress.done} lessons generated!</span></>
          ) : (
            <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-red-600">{progress.errors.length} failed: {progress.errors.slice(0,3).join(", ")}</span></>
          )}
        </div>
      )}
    </div>
  );
}