import { Badge } from "@/components/ui/badge";

const levelConfig = {
  beginner: { label: "Beginner", className: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  intermediate: { label: "Intermediate", className: "bg-secondary/20 text-secondary-foreground border-secondary/30" },
  advanced: { label: "Advanced", className: "bg-chart-1/10 text-chart-1 border-chart-1/20" },
};

export default function LevelBadge({ level }) {
  const config = levelConfig[level] || levelConfig.beginner;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}