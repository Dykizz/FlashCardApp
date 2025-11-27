"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileText,
  List,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SourceArticle } from "@/types/sourceArticle.type";
import { get } from "@/utils/apiClient";
import Loading from "@/components/Loading";
import LevelBadge from "@/components/LevelBadge";

export default function StudentArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["article-detail-student", id],
    queryFn: async () => {
      const res = await get<SourceArticle>(`/api/source-articles/${id}`);
      if (!res.success || !res.data) {
        throw new Error(res.error?.message || "Không tìm thấy bài viết");
      }
      return res.data;
    },
    retry: false,
  });

  const handleBack = () => router.back();

  const handleStart = () => {
    router.push(`/articles/${id}/learn`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loading message="Đang tải thông tin bài làm..." />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D14] flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">Không tìm thấy bài viết.</p>
        <Button onClick={() => router.push("/articles")}>
          Quay về danh sách
        </Button>
      </div>
    );
  }

  const estimatedTime = Math.ceil(article.source_sentences.length * 1.5);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D14] text-slate-900 dark:text-slate-200  pb-20 transition-colors duration-300">
      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div className="space-y-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="uppercase tracking-wider bg-slate-200/50 dark:bg-white/10 text-slate-600 dark:text-slate-300"
            >
              {article.topic}
            </Badge>
            <LevelBadge level={article.level} />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900 dark:text-white tracking-tight">
            {article.title_vn}
          </h1>

          {article.description && (
            <div className="bg-white dark:bg-[#15171E] border-l-4 border-blue-500 p-5 rounded-r-lg shadow-sm border-y border-r  dark:border-white/5">
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                {article.description}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className=" space-y-6">
            <Card className="border-slate-200 dark:border-white/10 shadow-md bg-slate-50/50 dark:bg-[#15171E]/50 backdrop-blur-sm">
              <CardHeader className="pb-2 border-b border-slate-200 dark:border-white/5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" /> Tổng quan bài
                  học
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <List className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Số lượng câu</span>
                  </div>
                  <span className="text-lg font-bold">
                    {article.source_sentences.length}
                  </span>
                </div>

                <Separator className="bg-slate-200 dark:bg-white/5" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">
                      Thời gian ước tính
                    </span>
                  </div>
                  <span className="text-lg font-bold">
                    ~{estimatedTime} phút
                  </span>
                </div>

                <Separator className="bg-slate-200 dark:bg-white/5" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Chủ đề</span>
                  </div>
                  <span className="text-sm font-bold text-right">
                    {article.topic}
                  </span>
                </div>
                <Button className="cursor-pointer" onClick={handleStart}>
                  Bắt đầu làm
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <FileText className="w-5 h-5 text-blue-500" /> Nội dung bài đọc
              </h3>
            </div>

            <Card className="border-none shadow-lg bg-white dark:bg-[#15171E] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/30" />

              <CardContent className="p-8">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="md:text-lg leading-relaxed text-slate-700 dark:text-slate-300  whitespace-pre-wrap">
                    {article.original_text}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
