import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

const ComplexityBadge = ({ score = 0 }: { score: number }) => {
  let colorClass =
    "border-slate-200 text-slate-500 bg-slate-100 dark:border-slate-800 dark:bg-slate-900";
  let label = "Chưa rõ";

  if (score > 0 && score <= 3) {
    colorClass =
      "border-green-200 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    label = "Dễ";
  } else if (score <= 6) {
    colorClass =
      "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    label = "Vừa";
  } else if (score <= 8) {
    colorClass =
      "border-yellow-200 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
    label = "Khó";
  } else if (score > 8) {
    colorClass =
      "border-red-200 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    label = "Rất khó";
  }

  return (
    <Badge
      variant="outline"
      className={cn("px-2.5 py-0.5 text-xs font-semibold", colorClass)}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60" />
      {label} {score}/10
    </Badge>
  );
};

export default ComplexityBadge;
