import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WordPairCard({ pair, index }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <Card
      className="group cursor-pointer border-border/50 hover:border-primary/20 transition-all duration-300"
      onClick={() => setRevealed(!revealed)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="font-semibold text-foreground text-lg">{pair.swedish}</p>
            <div className={`transition-all duration-300 ${revealed ? "opacity-100 max-h-40 mt-2" : "opacity-0 max-h-0 overflow-hidden"}`}>
              <p className="text-primary font-medium">{pair.english}</p>
              {pair.example_sv && (
                <div className="mt-3 pl-3 border-l-2 border-secondary/50">
                  <p className="text-sm text-foreground italic">"{pair.example_sv}"</p>
                  <p className="text-sm text-muted-foreground">"{pair.example_en}"</p>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground">
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        {!revealed && (
          <p className="text-xs text-muted-foreground mt-2">Tap to reveal translation</p>
        )}
      </CardContent>
    </Card>
  );
}