import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SKILLS = [
  { key: "vocabulary", emoji: "📝", label: "Ordförråd", label_en: "Vocabulary" },
  { key: "grammar", emoji: "🔤", label: "Grammatik", label_en: "Grammar" },
  { key: "reading", emoji: "📖", label: "Läsning", label_en: "Reading" },
  { key: "writing", emoji: "✍️", label: "Skrivning", label_en: "Writing" },
  { key: "speaking", emoji: "🗣️", label: "Tal", label_en: "Speaking" },
  { key: "listening", emoji: "👂", label: "Hörförståelse", label_en: "Listening" },
];

export default function SkillBreakdown({ languageResults = [] }) {
  const breakdown = SKILLS.map((s) => {
    const items = languageResults.filter((r) => r.skill === s.key);
    const avg =
      items.length > 0
        ? Math.round(items.reduce((sum, r) => sum + (r.percentage || 0), 0) / items.length)
        : null;
    return { ...s, count: items.length, avg };
  });

  const hasAny = breakdown.some((b) => b.count > 0);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Framsteg per färdighet
          <span className="block text-xs text-muted-foreground/60 italic font-normal mt-0.5">
            Progress by skill
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAny ? (
          <p className="text-sm text-muted-foreground">
            Gör prov i olika färdigheter för att se din profil här.
            <span className="block italic text-muted-foreground/60">
              Take quizzes in different skills to see your skill profile.
            </span>
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {breakdown.map((s) => {
              const pct = s.avg ?? 0;
              const barColor =
                s.avg === null
                  ? "bg-muted-foreground/30"
                  : pct >= 80
                  ? "bg-emerald-500"
                  : pct >= 60
                  ? "bg-yellow-500"
                  : "bg-destructive";
              return (
                <div key={s.key} className="p-3 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{s.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground/60 italic truncate">
                        {s.label_en}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span
                      className={`text-lg font-bold ${
                        s.avg === null
                          ? "text-muted-foreground/50"
                          : pct >= 80
                          ? "text-emerald-600"
                          : pct >= 60
                          ? "text-yellow-600"
                          : "text-destructive"
                      }`}
                    >
                      {s.avg === null ? "—" : `${pct}%`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.count} {s.count === 1 ? "prov" : "prov"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}