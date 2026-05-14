import { useState } from "react";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SpeakingPractice({ phrases }) {
  const [expanded, setExpanded] = useState(null);

  if (!phrases || phrases.length === 0) {
    return <p className="text-muted-foreground text-sm">No speaking phrases available.</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Read each phrase aloud in Swedish. Tap to see the pronunciation tip.
      </p>
      {phrases.map((phrase, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
        >
          <Card className="border-border/50 hover:border-green-300/60 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-base leading-snug">{phrase.phrase_sv}</p>
                    <p className="text-sm text-muted-foreground">{phrase.phrase_en}</p>
                  </div>
                </div>
                {expanded === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                }
              </div>

              {expanded === i && phrase.pronunciation_tip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-border/50"
                >
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Pronunciation tip</p>
                  <p className="text-sm text-foreground">{phrase.pronunciation_tip}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}