import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, CheckCircle2, XCircle, Mic } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const playAudio = async (text, lang = "sv-SE", speed = 1) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = speed;
  synth.speak(utterance);
};

export default function ListeningExercise({ phrases }) {
  const [current, setCurrent] = useState(0);
  const [typed, setTyped] = useState("");
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [listening, setListening] = useState(false);

  if (!phrases || phrases.length === 0) {
    return <p className="text-muted-foreground text-sm">No listening exercises available.</p>;
  }

  const phrase = phrases[current];
  const isTranscribe = phrase.exercise_type === "transcribe";

  const handleAnswer = (answer) => {
    if (answered) return;
    const expected = phrase.phrase_sv.trim().toLowerCase();
    const given = answer.trim().toLowerCase();
    const isCorrect = given === expected;
    setAnswered(true);
    setCorrect(isCorrect);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleListening = () => {
    if (listening || answered) return;
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in your browser");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = "sv-SE";
      recognition.interimResults = false;
      
      setListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          setTyped(transcript);
          handleAnswer(transcript);
        }
        setListening(false);
      };

      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
    } catch (error) {
      console.error("Speech recognition error:", error);
      setListening(false);
    }
  };

  const handleNext = () => {
    if (current + 1 >= phrases.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setTyped("");
      setSelected(null);
      setAnswered(false);
      setCorrect(false);
    }
  };

  if (finished) {
    const pct = Math.round((score / phrases.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <Card className="border-border/50 bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-lg text-green-900 mb-2">Listening complete!</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">{pct}%</p>
            <p className="text-sm text-green-700">{score} / {phrases.length} correct</p>
            <Button onClick={() => {
              setCurrent(0);
              setScore(0);
              setFinished(false);
              setAnswered(false);
              setTyped("");
              setSelected(null);
            }} className="mt-4">Try again</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{current + 1} / {phrases.length}</span>
        <span className="font-semibold text-primary">Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">{phrase.phrase_en}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Listen to the Swedish phrase:</p>
                <button
                  onClick={() => playAudio(phrase.phrase_sv, "sv-SE", 1)}
                  className="w-full p-4 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 font-semibold text-primary"
                >
                  <Volume2 className="w-5 h-5" /> Play audio
                </button>
              </div>

              {isTranscribe ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={typed}
                    onChange={e => setTyped(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !answered) handleAnswer(typed); }}
                    disabled={answered}
                    placeholder="Type what you hear..."
                    className="w-full border-2 border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {["å", "ä", "ö"].map(c => (
                      <button key={c} onClick={() => setTyped(t => t + c)}
                        className="px-2.5 py-1 border rounded-lg hover:bg-muted transition-colors font-medium">{c}</button>
                    ))}
                  </div>
                  {!answered && (
                    <div className="flex gap-2">
                      <Button onClick={handleListening} disabled={listening} className="flex-1 gap-2">
                        <Mic className={`w-4 h-4 ${listening ? "animate-pulse" : ""}`} />
                        {listening ? "Listening..." : "Tap to record"}
                      </Button>
                      <Button onClick={() => handleAnswer(typed)} className="flex-1">Check</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Choose the correct phrase:</p>
                  <div className="space-y-2">
                    {phrase.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelected(idx); handleAnswer(opt); }}
                        disabled={answered}
                        className={`w-full p-3 rounded-xl border-2 text-left text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                          answered
                            ? idx === phrase.correct_index
                              ? "border-green-400 bg-green-50"
                              : idx === selected
                              ? "border-red-400 bg-red-50 opacity-80"
                              : "border-border/30 opacity-40"
                            : "border-border/50 hover:border-primary/40 hover:bg-muted/50"
                        }`}
                      >
                        <span>{opt}</span>
                        {answered && idx === phrase.correct_index && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {answered && idx === selected && idx !== phrase.correct_index && <XCircle className="w-4 h-4 text-red-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {answered && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className={`p-3 rounded-lg ${correct ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    <p className={`text-sm font-semibold ${correct ? "text-green-700" : "text-red-700"}`}>
                      {correct ? "✓ Correct!" : `✗ Answer: ${phrase.phrase_sv}`}
                    </p>
                  </div>
                  <Button onClick={handleNext} className="w-full">
                    {current + 1 >= phrases.length ? "See results" : "Next"}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}