import { ArticleLevel } from "@/types/sourceArticle.type";
import { Badge } from "./ui/badge";

const LevelBadge: React.FC<{ level: ArticleLevel }> = ({ level }) => {
  const colorMap: Record<ArticleLevel, string> = {
    [ArticleLevel.A1]: "bg-green-500/20 text-green-700 border-green-500/30",
    [ArticleLevel.A2]: "bg-cyan-500/20 text-cyan-700 border-cyan-500/30",
    [ArticleLevel.B1]: "bg-blue-500/20 text-blue-700 border-blue-500/30",
    [ArticleLevel.B2]: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
    [ArticleLevel.C1]: "bg-orange-500/20 text-orange-700 border-orange-500/30",
    [ArticleLevel.C2]: "bg-red-500/20 text-red-700 border-red-500/30",
  };
  return (
    <Badge
      variant="outline"
      className={`px-2 py-1 text-xs font-semibold ${colorMap[level]}`}
    >
      {level}
    </Badge>
  );
};

export default LevelBadge;
