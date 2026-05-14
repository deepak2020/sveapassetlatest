import { Badge } from "@/components/ui/badge";

const categoryLabels = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  phrases: "Phrases",
  pronunciation: "Pronunciation",
  reading: "Reading",
  government: "Government",
  history: "History",
  culture: "Culture",
  rights_duties: "Rights & Duties",
  society: "Society",
  geography: "Geography",
};

export default function CategoryBadge({ category }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {categoryLabels[category] || category}
    </Badge>
  );
}