import { useState } from "react";
import { ChevronDown, ChevronUp, Mic, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SpeakButton from "@/components/shared/SpeakButton";

const fuzzyMatch = (userText, expectedText) => {
  const normalize = (text) => text.toLowerCase().trim().replace(/[.,!?]/g, "");
  const user = normalize(userText);
  const expected = normalize(expectedText);
  
  if (user === expected) return 1;
  
  let matches = 0;
  const minLen = Math.min(user.length, expected.length);
  for (let i = 0; i < minLen; i++) {
    if (user[i] === expected[i]) matches++;
  }
  return matches / expected.length;
};

export default function SpeakingPractice({ phrases }) {
  const [expanded, setExpanded] = useState(null);
  const [listening, setListening] = useState(null);
  const [feedback, setFeedback] = useState({});

  if (!phrases || phrases.length === 0) {
    return <p className="text-muted-foreground text-sm">No speaking phrases available.</p>;
  }

  const handleRecord = (index) => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "sv-SE";
    recognition.start();
    setListening(index);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const score = fuzzyMatch(transcript, phrases[index].phrase_sv);
      setFeedback({
        ...feedback,
        [index]: { transcript, score, isCorrect: score >= 0.75 }
      });
      setListening(null);
    };

    recognition.onerror = () => {
      setListening(null);
    };
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Read each phrase aloud in Swedish. Tap the mic button to verify your pronunciation.
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
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <SpeakButton
                    text={phrase.phrase_sv}
                    className="w-9 h-9 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-base leading-snug">{phrase.phrase_sv}</p>
                    <p className="text-sm text-muted-foreground">{phrase.phrase_en}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {feedback[i]?.isCorrect && <CheckCircle2 className="w-5 h-5 text-chart-3" />}
                  {feedback[i]?.isCorrect === false && <XCircle className="w-5 h-5 text-destructive" />}
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-9 h-9 rounded-xl"
                    onClick={() => handleRecord(i)}
                    disabled={listening === i}
                  >
                    <Mic className={`w-4 h-4 ${listening === i ? "animate-pulse" : ""}`} />
                  </Button>
                  {expanded === i
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  }
                </div>
              </div>

              {expanded === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-border/50 space-y-3"
                >
                  {phrase.pronunciation_tip && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">Pronunciation tip</p>
                      <p className="text-sm text-foreground">{phrase.pronunciation_tip}</p>
                    </div>
                  )}
                  {feedback[i] && (
                    <div className={`p-3 rounded-lg ${feedback[i].isCorrect ? "bg-chart-3/10 border border-chart-3/30" : "bg-destructive/10 border border-destructive/30"}`}>
                      <p className="text-xs font-semibold mb-1 text-foreground">You said:</p>
                      <p className="text-sm text-foreground italic mb-2">"{feedback[i].transcript}"</p>
                      {feedback[i].isCorrect ? (
                        <p className="text-xs font-semibold text-chart-3">✓ Perfect pronunciation!</p>
                      ) : (
                        <p className="text-xs text-destructive">Try again — focus on the pronunciation tip above.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}