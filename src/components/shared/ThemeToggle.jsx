import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { getStoredTheme, setStoredTheme } from "@/components/ThemeSync";

const ORDER = ["light", "dark", "system"];
const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: "Light", dark: "Dark", system: "System" };

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    setTheme(getStoredTheme());
    const onChange = (e) => setTheme(e.detail || getStoredTheme());
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
    setStoredTheme(next);
    setTheme(next);
  };

  const Icon = ICONS[theme];

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${LABELS[theme]} (click to change)`}
      className={`flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}