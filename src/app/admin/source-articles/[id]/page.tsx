"use client";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  List,
  Info,
  Calendar,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SourceArticle } from "@/types/sourceArticle.type";
import { get, del } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import Loading from "@/components/Loading";
import LevelBadge from "@/components/LevelBadge";

export default function AdminArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-article-detail", id],
    queryFn: async () => {
      const res = await get<SourceArticle>(`/api/source-articles/${id}`);
      if (!res.success || !res.data) throw new Error("Không tìm thấy bài viết");
      return res.data;
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await del(`/api/source-articles/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => {
      showToast({ type: "success", title: "Đã xóa bài viết" });
      router.push("/admin/source-articles");
    },
    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Lỗi xóa",
        description: error.message,
      });
    },
  });

  const handleEdit = () => router.push(`${id}/edit`);
  const handleDeleteConfirm = () => deleteMutation.mutate();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading message="Đang tải bài viết..." size="lg" />
      </div>
    );
  if (isError || !article)
    return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D14] text-slate-900 dark:text-slate-200 font-sans pb-20">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0B0D14]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-4">
        <div className=" flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Button>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Xóa bài
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa bài viết?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa vĩnh viễn
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="default"
              size="sm"
              onClick={handleEdit}
              className="gap-2 cursor-pointer"
            >
              <Pencil className="w-4 h-4" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <main className="p-6 space-y-8">
        {/* 1. Header Thông Tin Chung */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white">
            {article.title_vn}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge
              variant="secondary"
              className="uppercase tracking-wide bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300"
            >
              {article.topic}
            </Badge>
            <LevelBadge level={article.level} />
            <span className="text-slate-400 px-2">|</span>
            <div className="flex items-center text-muted-foreground gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Tạo:{" "}
                {new Date(article.createdAt as string).toLocaleDateString(
                  "vi-VN"
                )}
              </span>
            </div>
            <div className="flex items-center text-muted-foreground gap-1 ml-3">
              <List className="w-3.5 h-3.5" />
              <span>{article.source_sentences.length} câu</span>
            </div>
          </div>

          {/* Description Box */}
          {article.description && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-4 rounded-lg flex gap-3 text-sm">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold block mb-1 text-blue-700 dark:text-blue-400 uppercase text-xs tracking-wider">
                  Mô tả / Đề bài
                </span>
                {article.description}
              </div>
            </div>
          )}
        </div>

        {/* 2. Nội dung Gốc */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" /> Nội dung gốc
          </h3>
          <div className="p-6 bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="text-lg leading-loose text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
              {article.original_text}
            </div>
          </div>
        </div>

        {/* 3. Chi tiết Cấu trúc & Đáp án (Layout Dọc Rộng Rãi) */}
        <div className="space-y-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <List className="w-5 h-5 text-primary" /> Phân tích chi tiết từng
              câu
            </h3>
            <span className="text-xs text-muted-foreground italic">
              Dùng để kiểm tra dữ liệu tách câu và đáp án mẫu
            </span>
          </div>

          <div className="grid gap-6">
            {article.source_sentences.map((sentence, index) => (
              <Card
                key={index}
                className="border-slate-200 dark:border-white/5 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Phần Tiếng Việt */}
                  <div className="md:w-5/12 bg-slate-50 dark:bg-white/5 p-5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded">
                        Câu {index + 1}
                      </span>
                      {sentence.complexity_score !== undefined && (
                        <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                          Độ khó: {sentence.complexity_score}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {sentence.content_vn}
                    </p>
                  </div>

                  {/* Phần Đáp Án Mẫu */}
                  <div className="md:w-7/12 p-5 bg-white dark:bg-[#15171E]">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5" /> Đáp án mẫu (
                      {sentence.sample_answers.length})
                    </p>

                    {sentence.sample_answers.length > 0 ? (
                      <ul className="space-y-3">
                        {sentence.sample_answers.map((ans, idx) => (
                          <li key={idx} className="flex gap-3 text-sm group">
                            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-500 shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
                              {idx + 1}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors leading-relaxed">
                              {ans}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-red-400 italic flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-2 rounded">
                        <Info className="w-4 h-4" /> Chưa có đáp án mẫu nào.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
