import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

export default function LessonBottomNav({ prevLesson, nextLesson }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/60 md:hidden">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center gap-2">
        {prevLesson ? (
          <Link
            to={`/language/${prevLesson.id}`}
            className="flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-sm font-medium text-foreground min-h-11"
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span className="truncate">{prevLesson.title}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        <Link
          to="/language"
          className="p-2.5 rounded-xl bg-muted/60 hover:bg-muted shrink-0 min-h-11 min-w-11 flex items-center justify-center"
          aria-label="All lessons"
        >
          <List className="w-4 h-4" />
        </Link>

        {nextLesson ? (
          <Link
            to={`/language/${nextLesson.id}`}
            className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium min-h-11"
          >
            <span className="truncate">{nextLesson.title}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}