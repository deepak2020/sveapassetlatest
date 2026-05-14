import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Dumbbell, Zap, Target, Play, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GymSession from "@/components/gym/GymSession";

const MODES = [
  { id: "word_bank", label: "Word Bank", desc: "Tap the correct word from 4 options", levels: ["A", "B"], icon: "🔤" },
  { id: "multiple_choice", label: "Multiple Choice", desc: "Choose from 4 options (A/B/C/D style)", levels: ["B", "C"], icon: "🅰️" },
  { id: "type", label: "Type Answer", desc: "Type the missing Swedish word", levels: ["C", "D"], icon: "⌨️" },
];

const COUNTS = [10, 25, 50];

export default function Gym() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("multiple_choice");
  const [count, setCount] = useState(10);
  const [levelFilter, setLevelFilter] = useState("all");

  const { data: sentences = [] } = useQuery({
    queryKey: ["cloze-sentences"],
    queryFn: () => base44.entities.ClozeSentence.list("word_frequency_rank", 500),
  });

  const { data: srsCards = [] } = useQuery({
    queryKey: ["srs-cards"],
    queryFn: () => base44.entities.UserSRSCard.list(),
  });

  const today = new Date().toISOString().split("T")[0];
  const dueCount = srsCards.filter(c => c.due_date <= today && c.status !== "mastered").length;

  const filtered = sentences.filter(s =>
    levelFilter === "all" || s.sfi_level === levelFilter
  );

  if (session) {
    return (
      <GymSession
        sentences={filtered.slice(0, count)}
        mode={mode}
        srsCards={srsCards}
        onFinish={() => setSession(null)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
          <Dumbbell className="w-7 h-7 text-violet-600" />
        </div>
        <h1 className="font-display text-3xl font-bold">Practice Gym</h1>
        <p className="text-muted-foreground mt-1">High-volume cloze sentence practice</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{sentences.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total sentences</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{dueCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Due for review</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{srsCards.filter(c => c.status === "mastered").length}</p>
            <p className="text-xs text-muted-foreground mt-1">Mastered</p>
          </CardContent>
        </Card>
      </div>

      {sentences.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">No sentences yet</h3>
            <p className="text-sm text-muted-foreground">Ask an admin to add cloze sentences to the gym.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Mode selection */}
          <div>
            <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Practice Mode</h2>
            <div className="space-y-2">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${mode === m.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{m.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc} · SFI {m.levels.join("–")}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">Sentences</h2>
              <div className="flex gap-2">
                {COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${count === n ? "border-primary bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">SFI Level</h2>
              <div className="flex gap-2 flex-wrap">
                {["all", "A", "B", "C", "D"].map(l => (
                  <button
                    key={l}
                    onClick={() => setLevelFilter(l)}
                    className={`px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${levelFilter === l ? "border-primary bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"}`}
                  >
                    {l === "all" ? "All" : l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={() => setSession(true)}
            size="lg"
            className="w-full gap-2 text-base"
            disabled={filtered.length === 0}
          >
            <Play className="w-5 h-5" /> Start Session ({Math.min(count, filtered.length)} sentences)
          </Button>
        </>
      )}
    </div>
  );
}