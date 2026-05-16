import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function BulkRegenerateCivicButton({ onDone }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const handleClick = async () => {
    if (!confirm("This will DELETE all existing civic topics and regenerate all 37 topics from scratch. It can take 15-30 minutes. Continue?")) return;
    setRunning(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("regenerateAllCivic", { clear_existing: true });
      setResult(res.data);
      onDone?.();
    } catch (e) {
      setResult({ error: e.message });
    }
    setRunning(false);
  };

  return (
    <div className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-red-900 dark:text-red-200">Bulk Regenerate All Civic Topics</p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Deletes existing civic topics and regenerates all 37 from Sverige i Fokus. Long-running.
          </p>
        </div>
        <Button onClick={handleClick} disabled={running} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Regenerating all 37 topics..." : "Regenerate ALL Civic Topics"}
        </Button>
      </div>

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