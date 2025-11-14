import { Play } from "lucide-react";

export default function NotSolution() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Play className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Chưa có lời giải</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Nhập các phụ thuộc hàm và nhấn <strong>Bắt đầu giải</strong> để xem lời
        giải chi tiết
      </p>
    </div>
  );
}
