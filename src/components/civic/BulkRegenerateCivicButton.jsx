import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const BATCH_SIZE = 2;

export default function BulkRegenerateCivicButton({ onDone }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 37, success: 0, failed: 0 });
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    if (!confirm("This will DELETE all existing civic topics and regenerate all 37 topics from scratch. It can take 15-30 minutes. Keep this tab open. Continue?")) return;
    setRunning(true);
    setResult(null);
    setProgress({ done: 0, total: 37, success: 0, failed: 0 });

    const allErrors = [];
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      // Step 1: clear existing topics
      await base44.functions.invoke("regenerateAllCivic", { clear_only: true });

      // Step 2: loop batches
      let batchStart = 0;
      let total = 37;
      while (batchStart < total) {
        const res = await base44.functions.invoke("regenerateAllCivic", {
          batch_start: batchStart,
          batch_size: BATCH_SIZE,
        });
        const data = res.data || {};
        totalSuccess += data.success || 0;
        totalFailed += data.failed || 0;
        if (data.errors?.length) allErrors.push(...data.errors);
        total = data.total || total;
        batchStart = data.nextBatch ?? total;
        setProgress({ done: Math.min(batchStart, total), total, success: totalSuccess, failed: totalFailed });
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
          <p className="font-semibold text-red-900 dark:text-red-200">Bulk Regenerate All Civic Topics</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Deletes existing civic topics and regenerates all 37 from Sverige i Fokus. Long-running — keep the tab open.
          </p>
        </div>
        <Button onClick={handleClick} disabled={running} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          {running ? `Regenerating ${progress.done}/${progress.total}...` : "Regenerate ALL Civic Topics"}
        </Button>
      </div>

      {running && (
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