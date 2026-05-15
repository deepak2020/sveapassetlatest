import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

const GRAMMAR_TOPICS = [
  {
    level: "A",
    topics: [
      {
        title: "V2 Rule (Verb Second)",
        description: "Main verb comes in second position in main clauses",
        example: "Jag äter äpplen. (I eat apples.)",
        keyPoint: "Subject + Verb + Object"
      },
      {
        title: "Present Tense",
        description: "Basic present tense conjugation",
        example: "Jag är glad. Du är tröttad. Han/Hon är sjuk.",
        keyPoint: "-ar endings for regular verbs"
      },
      {
        title: "Definite & Indefinite Articles",
        description: "Swedish gender and article usage",
        example: "en hus (a house), ett hus (the house)",
        keyPoint: "en (common), ett (neuter), definite suffix -en/-et"
      },
      {
        title: "Imperative Form",
        description: "Commands and instructions",
        example: "Ät frukt! Drick vatten!",
        keyPoint: "Verb stem without ending"
      }
    ]
  },
  {
    level: "B",
    topics: [
      {
        title: "Past Tense (Preterit & Perfect)",
        description: "Describing past events",
        example: "Jag åt äpplen. Jag har ätit äpplen.",
        keyPoint: "-ade, -ede endings or irregular forms"
      },
      {
        title: "Adjective Agreement",
        description: "Adjectives must agree with noun gender",
        example: "en vacker dag, ett vackert hus",
        keyPoint: "Add -t for neuter, -a for plural"
      },
      {
        title: "Subordinate Clauses",
        description: "Complex sentences with subordination",
        example: "Jag vet att han kommer. Om jag har tid...",
        keyPoint: "Word order changes in subordinate clauses"
      },
      {
        title: "Reflexive Verbs",
        description: "Actions directed back to the subject",
        example: "Han tvättar sig. (He washes himself.)",
        keyPoint: "sig/mig/dig/oss pronouns"
      }
    ]
  },
  {
    level: "C",
    topics: [
      {
        title: "Conditional Mood",
        description: "Expressing wishes and hypotheticals",
        example: "Jag skulle vilja äta. Om jag hade tid...",
        keyPoint: "skulle + infinitive"
      },
      {
        title: "Passive Voice",
        description: "Action without focus on subject",
        example: "Huset byggdes år 1900. (The house was built in 1900.)",
        keyPoint: "-ades/-edes or bli + past participle"
      },
      {
        title: "Participles",
        description: "Present and past participles",
        example: "springande flicka, bruten arm",
        keyPoint: "-ande, -ad/-t endings"
      },
      {
        title: "Complex Word Order",
        description: "Advanced Swedish sentence structure",
        example: "På fredagen gick jag till biografen.",
        keyPoint: "Adverbials often placed before verb"
      }
    ]
  },
  {
    level: "D",
    topics: [
      {
        title: "Subjunctive Mood",
        description: "Formal expressions and wishes",
        example: "Leve kungen! (Long live the king!)",
        keyPoint: "Rare in modern Swedish, mainly in set phrases"
      },
      {
        title: "Advanced Sentence Construction",
        description: "Complex nested clauses",
        example: "Det är viktigt att vi förstår vad han menar.",
        keyPoint: "Balancing multiple clauses"
      },
      {
        title: "Stylistic Variations",
        description: "Register and formality levels",
        example: "Du talar vs Ni talar vs Dere talar",
        keyPoint: "Formal, informal, regional differences"
      },
      {
        title: "Idiomatic Expressions",
        description: "Common Swedish phrases and expressions",
        example: "Det är ju inte raketen! (It's not rocket science!)",
        keyPoint: "Cultural and linguistic nuances"
      }
    ]
  }
];

export default function GrammarModule() {
  const [selectedLevel, setSelectedLevel] = useState("A");

  const topicsForLevel = GRAMMAR_TOPICS.find(g => g.level === selectedLevel)?.topics || [];

  return (
    <div className="space-y-6">
      {/* Level selector */}
      <div className="flex gap-2">
        {["A", "B", "C", "D"].map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedLevel === level
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            SFI {level}
          </button>
        ))}
      </div>

      {/* Grammar topics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topicsForLevel.map((topic, idx) => (
          <Card key={idx} className="border-border/50 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <Badge variant="secondary" className="shrink-0">
                  SFI {selectedLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{topic.description}</p>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 space-y-1.5">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Example</div>
                <p className="text-sm text-blue-900 dark:text-blue-100 italic">{topic.example}</p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Key Point</div>
                <p className="text-sm text-amber-900 dark:text-amber-100">{topic.keyPoint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state if no topics */}
      {topicsForLevel.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">No grammar topics available for this level.</p>
        </div>
      )}
    </div>
  );
}