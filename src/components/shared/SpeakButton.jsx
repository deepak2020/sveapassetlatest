import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/hooks/useSpeech";

export default function SpeakButton({ text, lang = "sv-SE", className }) {
  const { speak, speaking } = useSpeech();

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(text, lang); }}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
        speaking
          ? "bg-primary/20 text-primary"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        className
      )}
      title={`Listen: ${text}`}
    >
      <Volume2 className={cn("w-4 h-4", speaking && "animate-pulse")} />
    </button>
  );
}