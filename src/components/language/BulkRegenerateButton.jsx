import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function BulkRegenerateButton({ onDone }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, success: 0, failed: 0 });
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    if (!confirm("This will regenerate content for ALL 160 lessons. It can take 30-60 minutes. Keep this tab open. Continue?")) return;
    setRunning(true);
    setResult(null);
    setProgress({ done: 0, total: 0, success: 0, failed: 0 });

    const allErrors = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      // Step 1: get target lessons
      const listRes = await base44.functions.invoke("regenerateAllLessons", { list_only: true });
      const targets = listRes.data?.ids || [];
      const total = targets.length;
      setProgress({ done: 0, total, success: 0, failed: 0 });

      // Step 2: process one at a time
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        try {
          const res = await base44.functions.invoke("regenerateAllLessons", { lesson_id: t.id });
          if (res.data?.success) totalSuccess++;
          else {
            totalFailed++;
            allErrors.push({ id: t.id, title: t.title, error: res.data?.error });
          }
        } catch (e) {
          totalFailed++;
          allErrors.push({ id: t.id, title: t.title, error: e.message });
        }
        setProgress({ done: i + 1, total, success: totalSuccess, failed: totalFailed });
      }

      setResult({ success: totalSuccess, failed: totalFailed, total, errors: allErrors });
      onDone?.();
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-red-900 dark:text-red-200">Bulk Regenerate All Lessons</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Regenerates AI content for every lesson across all SFI courses (A–D). Long-running — keep the tab open.
          </p>
        </div>
        <Button onClick={handleClick} disabled={running} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          {running ? `Regenerating ${progress.done}/${progress.total || "…"}...` : "Regenerate ALL Lessons"}
        </Button>
      </div>

      {running && progress.total > 0 && (
        <div className="mt-3 space-y-1">
          <Progress value={pct} className="h-2" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {progress.done} / {progress.total} processed · ✅ {progress.success} · ❌ {progress.failed}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {result.error ? (
            <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-red-700">Error: {result.error}</span></>
          ) : (
            <><CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Done! {result.success}/{result.total} regenerated. {result.failed > 0 && `${result.failed} failed.`}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}