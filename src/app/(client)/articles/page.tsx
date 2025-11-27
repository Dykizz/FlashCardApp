"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Search,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArticleLevel, SourceArticle } from "@/types/sourceArticle.type";
import { get } from "@/utils/apiClient";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import LevelBadge from "@/components/LevelBadge";

export default function StudentPracticePage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<ArticleLevel | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 9;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student-articles", page, limit, debouncedSearch, filterLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterLevel !== "all") params.append("level", filterLevel);

      const res = await get<SourceArticle[]>(
        `/api/source-articles?${params.toString()}`
      );
      if (!res.success) throw new Error("Failed to fetch");
      return {
        articles: res.data || [],
        pagination: res.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });

  const articles = data?.articles || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterLevel]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D14] text-slate-900 dark:text-slate-200 font-sans pb-20 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-blue-200/40 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative pt-20 pb-12 px-4 text-center z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
          Luyện Viết{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
            Tiếng Anh
          </span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Nâng cao kỹ năng viết qua các bài dịch thực tế, nhận phản hồi AI tức
          thì và theo dõi tiến độ mỗi ngày.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 mb-12 relative z-20">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-all">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Tìm kiếm chủ đề, bài học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-500 focus-visible:ring-0 text-base rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            />
          </div>

          <div className="hidden md:block w-px bg-slate-200 dark:bg-white/10 my-2" />

          <div className="w-full md:w-[180px]">
            <Select
              value={filterLevel}
              onValueChange={(val) => setFilterLevel(val as any)}
            >
              <SelectTrigger className="h-12 bg-transparent border-none text-slate-700 dark:text-slate-300 focus:ring-0 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <SelectValue placeholder="Cấp độ" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#1A1D26] border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200">
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                {Object.values(ArticleLevel).map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 relative z-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-200 dark:bg-white/5 rounded-xl h-[220px] animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">
              Có lỗi xảy ra khi tải dữ liệu.
            </p>
            <Button
              variant="link"
              onClick={() => window.location.reload()}
              className="text-blue-600 dark:text-blue-400"
            >
              Thử lại
            </Button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-medium">Không tìm thấy bài học nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card
                key={article._id}
                className="group relative bg-white dark:bg-[#15171E] dark:hover:bg-[#1A1D26] border-slate-200 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/30 hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover:translate-y-0 shadow-lg bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:text-blue-600 dark:hover:text-blue-400 dark:text-slate-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/articles/${article._id}`);
                  }}
                >
                  <BookOpen className="size-4 mr-2" /> Xem trước
                </Button>

                <CardHeader className="pb-3 pt-5">
                  <div className="flex justify-between items-start mb-3">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-transparent dark:border-white/5"
                    >
                      {article.topic}
                    </Badge>
                    <LevelBadge level={article.level} />
                  </div>
                  <CardTitle className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-50 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {article.title_vn}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {article.description ||
                      "Thực hành dịch câu và cải thiện kỹ năng viết."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500 font-medium mt-1">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{article.source_sentences.length} câu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>~{article.source_sentences.length * 2} phút</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 relative z-10 pb-5 px-5">
                  <Button
                    className="w-full cursor-pointer bg-slate-100 dark:bg-white/5 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-900 dark:text-white hover:text-white border border-transparent dark:border-white/10 hover:border-transparent transition-all duration-300 group/btn shadow-sm hover:shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/articles/${article._id}/learn`);
                    }}
                  >
                    Bắt đầu ngay
                    <ArrowRight className="w-4 h-4 ml-2 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-16">
            <Button
              variant="ghost"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Trước
            </Button>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-500 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-sm">
              Trang{" "}
              <span className="text-slate-900 dark:text-white font-bold">
                {page}
              </span>{" "}
              / {totalPages}
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                setPage((old) => (pagination?.hasNextPage ? old + 1 : old))
              }
              disabled={!pagination?.hasNextPage}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
            >
              Sau
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
