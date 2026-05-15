import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";

const TOTAL_TOPICS = 33;

export default function GenerateCivicContentButton({ existingCount, onDone }) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, errors: [] });

  const missing = TOTAL_TOPICS - existingCount;

  const handleGenerate = async () => {
    setRunning(true);
    setStarted(true);
    const errors = [];
    const startIndex = existingCount;
    const count = TOTAL_TOPICS - startIndex;
    setProgress({ done: 0, total: count, errors });

    for (let i = startIndex; i < TOTAL_TOPICS; i++) {
      try {
        await base44.functions.invoke("generateCivicContent", { topic_index: i });
      } catch (e) {
        errors.push(i);
      }
      setProgress((p) => ({ ...p, done: i - startIndex + 1, errors }));
    }

    setProgress((p) => ({ ...p, done: count, errors }));
    setRunning(false);
    onDone?.();
  };

  // Only auto-start once, and only when existingCount has loaded (> 0 or explicitly ready)
  useEffect(() => {
    if (!started && existingCount !== undefined && missing > 0) {
      handleGenerate();
    }
  }, [existingCount]);

  if (missing <= 0) return null;

  return (
    <div className="border border-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-amber-900 dark:text-amber-200">
            {running
              ? `Generating civic topics... (${progress.done}/${progress.total})`
              : `${missing} civic topics need content`}
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Based on informationsverige.se — official Swedish samhällsorientering
          </p>
        </div>
        {!running && (
          <Button
            onClick={handleGenerate}
            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Zap className="w-4 h-4" />
            Generate {missing} Topics
          </Button>
        )}
      </div>

      {running && (
        <div className="mt-4 space-y-2">
          <Progress value={(progress.done / progress.total) * 100} className="h-2" />
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {progress.done} of {progress.total} topics generated
          </p>
        </div>
      )}

      {!running && progress.done > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {progress.errors.length === 0 ? (
            <><CheckCircle className="w-4 h-4 text-green-600" /><span className="text-green-700">All {progress.done} topics generated!</span></>
          ) : (
            <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-red-600">{progress.errors.length} failed</span></>
          )}
        </div>
      )}
    </div>
  );
}