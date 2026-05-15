import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Play, BookOpen, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GymSessionV2 from "@/components/gym/GymSessionV2";

const SFI_LEVELS = ["A", "B", "C", "D"];
const SENTENCE_COUNTS = [10, 25, 50];
const SKILLS = [
  { id: "vocabulary", label: "Vocabulaire", icon: "📚", desc: "Practique des mots et phrases" },
  { id: "grammar", label: "Grammaire", icon: "✍️", desc: "Formes et structures" },
  { id: "reading", label: "Lecture", icon: "👁️", desc: "Compréhension de textes" },
];

export default function Gym() {
  const [session, setSession] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: sentences = [] } = useQuery({
    queryKey: ["cloze-sentences"],
    queryFn: () => base44.entities.ClozeSentence.list("word_frequency_rank", 500),
  });

  const { data: srsCards = [] } = useQuery({
    queryKey: ["srs-cards"],
    queryFn: () => base44.entities.UserSRSCard.list(),
  });

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const today = new Date().toISOString().split("T")[0];
  const dueCount = srsCards.filter(c => c.due_date <= today && c.status !== "mastered").length;
  const masteredCount = srsCards.filter(c => c.mastery_percentage === 100).length;
  const masteryPct = srsCards.length > 0 ? Math.round((masteredCount / srsCards.length) * 100) : 0;

  const handleImportTatoeba = async (sfiLevel) => {
    setImporting(true);
    try {
      const res = await base44.functions.invoke('importTatoebaData', { limit: 50, sfiLevel });
      alert(`✓ Imported ${res.data.imported} sentences from Tatoeba`);
      window.location.reload();
    } catch (error) {
      alert(`✗ Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      setShowImport(false);
    }
  };

  if (session) {
    return (
      <GymSessionV2
        sentences={session.sentences}
        srsCards={srsCards}
        onFinish={() => setSession(null)}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h1 className="font-display text-3xl font-bold mb-2">Träningssalen</h1>
          <p className="text-muted-foreground">Högvolym-meningsträning med SRS-spårning</p>
        </div>
        {user?.role === 'admin' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(!showImport)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" /> Tatoeba
          </Button>
        )}
      </div>

      {/* Tatoeba Import Panel */}
      {user?.role === 'admin' && showImport && (
        <Card className="border-border/50 mb-8 bg-primary/5">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold">Importera från Tatoeba</h3>
            <div className="grid grid-cols-4 gap-2">
              {SFI_LEVELS.map(level => (
                <Button
                  key={level}
                  onClick={() => handleImportTatoeba(level)}
                  disabled={importing}
                  className="text-sm"
                >
                  {importing ? '⏳' : '↓'} SFI {level}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">Importer ~50 meningar från Tatoeba per SFI-nivå</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{sentences.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Totalt meningar</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{dueCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Förfallna för granskning</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{masteryPct}%</p>
            <p className="text-xs text-muted-foreground mt-1">Mastry ({masteredCount})</p>
          </CardContent>
        </Card>
      </div>

      {sentences.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Inga meningar ännu</h3>
            <p className="text-sm text-muted-foreground">Be en admin att lägga till cloze-meningar i träningssalen.</p>
          </CardContent>
        </Card>
      ) : (
        <GymDashboard sentences={sentences} srsCards={srsCards} onStartSession={setSession} />
      )}
    </div>
  );
}

function GymDashboard({ sentences, srsCards, onStartSession }) {
  const [selectedLevel, setSelectedLevel] = useState("A");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedMode, setSelectedMode] = useState("listen");
  const [count, setCount] = useState(10);

  let levelSentences = sentences.filter(s => s.sfi_level === selectedLevel);
  
  // Filter by skill if selected
  if (selectedSkill === "vocabulary") {
    levelSentences = levelSentences.filter(s => (s.word_frequency_rank || 500) < 300);
  } else if (selectedSkill === "grammar") {
    levelSentences = levelSentences.filter(s => (s.word_frequency_rank || 500) >= 300 && (s.word_frequency_rank || 500) < 700);
  } else if (selectedSkill === "reading") {
    levelSentences = levelSentences.filter(s => (s.word_frequency_rank || 500) >= 700);
  }
  
  // Group by topic
  const topicGroups = {};
  levelSentences.forEach(s => {
    const topic = s.topic || "Allmänt";
    if (!topicGroups[topic]) topicGroups[topic] = [];
    topicGroups[topic].push(s);
  });

  const topics = Object.entries(topicGroups)
    .map(([name, items]) => ({
      name,
      count: items.length,
      avgFrequency: items.reduce((avg, s) => avg + (s.word_frequency_rank || 500), 0) / items.length,
    }))
    .sort((a, b) => a.avgFrequency - b.avgFrequency);

  const startSession = () => {
    const sessionSentences = levelSentences.slice(0, Math.min(count, levelSentences.length));
    onStartSession({ sentences: sessionSentences, mode: selectedMode });
  };

  return (
    <div className="space-y-6">
      {/* SFI Level Selection */}
      <div>
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">SFI-nivå</h2>
        <div className="grid grid-cols-4 gap-3">
          {SFI_LEVELS.map(level => {
            const levelCount = sentences.filter(s => s.sfi_level === level).length;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  selectedLevel === level ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
                }`}
              >
                <p className="font-bold text-xl">{level}</p>
                <p className="text-xs text-muted-foreground mt-1">{levelCount} meningar</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Exercise Mode Selection */}
      <div>
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Övningstyp</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedMode("listen")}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedMode === "listen" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
            }`}
          >
            <p className="text-lg">👂</p>
            <p className="text-xs font-medium mt-1">Lyssna</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Läs engelska, lyssna på svenska</p>
          </button>
          <button
            onClick={() => setSelectedMode("read")}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedMode === "read" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
            }`}
          >
            <p className="text-lg">📖</p>
            <p className="text-xs font-medium mt-1">Läsa</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Läs både texterna</p>
          </button>
          <button
            onClick={() => setSelectedMode("type")}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedMode === "type" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
            }`}
          >
            <p className="text-lg">⌨️</p>
            <p className="text-xs font-medium mt-1">Skriva</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Alltid skriva svar</p>
          </button>
        </div>
      </div>

      {/* Skill Selection */}
      <div>
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Kompetens</h2>
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedSkill(null)}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedSkill === null ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
            }`}
          >
            <p className="text-lg">🎯</p>
            <p className="text-xs font-medium mt-1">Alla</p>
          </button>
          {SKILLS.map(skill => (
            <button
              key={skill.id}
              onClick={() => setSelectedSkill(skill.id)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedSkill === skill.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30"
              }`}
            >
              <p className="text-lg">{skill.icon}</p>
              <p className="text-xs font-medium mt-1">{skill.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Ämnen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topics.map(topic => (
              <Card key={topic.name} className="border-border/50 hover:shadow-sm transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{topic.name}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">
                      {topic.count}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {topic.avgFrequency < 200 ? "Vanliga ord" : topic.avgFrequency < 500 ? "Medel svårighet" : "Avancerad"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Session Length */}
      <div>
        <h2 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Sessionslängd</h2>
        <div className="grid grid-cols-3 gap-3">
          {SENTENCE_COUNTS.map(n => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                count === n ? "border-primary bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={startSession}
        size="lg"
        className="w-full gap-2 text-base"
        disabled={levelSentences.length === 0}
      >
        <Play className="w-5 h-5" /> Starta session ({Math.min(count, levelSentences.length)} meningar)
      </Button>
    </div>
  );
}