"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  RotateCcw,
  Home,
  Share2,
  Sparkles,
  Award,
  CheckCircle2,
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { get, post } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import { UserProgress } from "@/types/sourceArticle.type";

// ... (Giữ nguyên các hàm getRankColor, getScoreColor) ...
const getRankColor = (rank?: string) => {
  const r = rank?.toLowerCase() || "";
  if (r.includes("master") || r.includes("chuyên gia"))
    return "bg-yellow-500 text-yellow-950 border-yellow-400 shadow-yellow-500/50";
  if (r.includes("pro") || r.includes("cao cấp"))
    return "bg-purple-500 text-purple-50 border-purple-400 shadow-purple-500/50";
  if (r.includes("apprentice") || r.includes("trung cấp"))
    return "bg-blue-500 text-blue-50 border-blue-400 shadow-blue-500/50";
  return "bg-slate-500 text-slate-50 border-slate-400";
};

const getScoreColor = (score: number) => {
  if (score >= 9.0) return "text-green-600 dark:text-green-400";
  if (score >= 7.0) return "text-blue-600 dark:text-blue-400";
  if (score >= 5.0) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const queryClient = useQueryClient();

  // 1. Query lấy dữ liệu
  const {
    data: progress,
    isLoading,
    // Bỏ refetch ở đây vì ta không dùng nữa
    error,
  } = useQuery({
    queryKey: ["user-progress-result", id],
    queryFn: async () => {
      const res = await get<UserProgress>(`/api/user-progress?articleId=${id}`);
      if (!res.success || !res.data) {
        throw new Error("Chưa tìm thấy dữ liệu bài làm.");
      }
      return res.data;
    },
    retry: false,
    // Quan trọng: Không tự động refetch khi focus để tránh đè dữ liệu
    refetchOnWindowFocus: false,
  });

  // 2. Mutation gọi AI
  const generateEvalMutation = useMutation({
    mutationFn: async () => {
      // Lưu ý: Đảm bảo endpoint đúng chính tả (/api/evaluate-overal hay overall?)
      const res = await post("/api/evaluate-overal", { articleId: id });
      if (!res.success) throw new Error(res.error?.message || "Lỗi đánh giá");
      return res.data;
    },
    onSuccess: (newEvaluation) => {
      // --- SỬA QUAN TRỌNG ---
      // Cập nhật cache ngay lập tức và KHÔNG gọi refetch()
      queryClient.setQueryData(["user-progress-result", id], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          overall_evaluation: newEvaluation,
        };
      });

      // Kích hoạt pháo hoa
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    },
    onError: (err: Error) => {
      console.error(err);
      showToast({
        type: "error",
        title: "Lỗi AI",
        description: "Không thể tạo đánh giá tổng quan lúc này.",
      });
    },
  });

  // 3. Effect tự động kích hoạt
  useEffect(() => {
    if (!isLoading && progress) {
      // Nếu chưa có đánh giá -> Gọi AI
      if (
        !progress.overall_evaluation &&
        !generateEvalMutation.isPending &&
        !generateEvalMutation.isError
      ) {
        generateEvalMutation.mutate();
      }
      // Nếu đã có -> Bắn pháo hoa
      else if (progress.overall_evaluation && !showConfetti) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [progress, isLoading]);

  // --- RENDER LOADING ---
  // Hiển thị loading khi:
  // 1. Đang tải dữ liệu ban đầu (isLoading)
  // 2. Đang chờ AI chạy (generateEvalMutation.isPending)
  // 3. Có dữ liệu nhưng chưa có evaluation và chưa báo lỗi (đang chờ Effect kích hoạt mutation)
  if (
    isLoading ||
    generateEvalMutation.isPending ||
    (progress && !progress.overall_evaluation && !generateEvalMutation.isError)
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0D14] gap-8 px-4">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-3 max-w-md animate-in fade-in duration-1000">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            Đang tổng hợp kết quả...
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            AI Coach đang phân tích điểm mạnh, điểm yếu và xây dựng lộ trình học
            tập riêng cho bạn.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-600 w-2/3 animate-[progress_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER ERROR ---
  // Chỉ hiện lỗi khi thực sự không có dữ liệu và Mutation đã thất bại hoặc không chạy
  if (error || !progress || !progress.overall_evaluation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0D14] gap-4 p-4">
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Không tìm thấy kết quả
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          Có thể bạn chưa hoàn thành bài học này hoặc quá trình đánh giá gặp
          lỗi.
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={() => router.push("/articles")}>
            Về danh sách
          </Button>
          <Button onClick={() => router.push(`/articles/${id}/learn`)}>
            Vào làm bài
          </Button>
        </div>
      </div>
    );
  }

  const evaluation = progress.overall_evaluation!;

  // --- RENDER SUCCESS ---
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0D14] text-slate-900 dark:text-slate-200 font-sans pb-20 relative overflow-x-hidden transition-colors duration-300">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
          />
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mt-6 animate-in slide-in-from-top-10 fade-in duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mb-4 shadow-lg shadow-yellow-500/20 animate-bounce">
            <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Xuất Sắc! Bạn đã về đích.
          </h1>
          <p className="text-muted-foreground text-lg">
            Dưới đây là bảng tổng kết hiệu suất luyện tập của bạn.
          </p>
        </div>

        {/* Score Card */}
        <Card className="border-none shadow-2xl bg-white/80 dark:bg-[#15171E]/90 backdrop-blur-xl overflow-hidden relative animate-in zoom-in-95 duration-700 delay-150">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardContent className="p-8 md:p-10 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="relative shrink-0 group">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[10px] border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center shadow-inner bg-white dark:bg-[#0B0D14] transition-transform group-hover:scale-105">
                  <span
                    className={`text-5xl md:text-6xl font-black tracking-tighter ${getScoreColor(
                      evaluation.final_score || 0
                    )}`}
                  >
                    {evaluation.final_score}
                  </span>
                  <span className="text-xs font-bold uppercase text-muted-foreground mt-1 tracking-widest">
                    Trung bình
                  </span>
                </div>
                <div
                  className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full border-4 border-white dark:border-[#15171E] shadow-lg font-bold text-sm uppercase tracking-wider whitespace-nowrap flex items-center gap-2 ${getRankColor(
                    evaluation.rank
                  )}`}
                >
                  <Award className="w-4 h-4" />
                  {evaluation.rank}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />{" "}
                  Nhận xét từ AI Coach
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    {evaluation.summary_comment}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-10 duration-700 delay-300">
          <Card className="bg-green-50/50 dark:bg-green-900/5 border-green-200 dark:border-green-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-lg">
                <Target className="w-5 h-5" /> Điểm mạnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation.strengths?.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-50/50 dark:bg-orange-900/5 border-orange-200 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-lg">
                <AlertTriangle className="w-5 h-5" /> Cần cải thiện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {evaluation.weaknesses?.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Study Plan */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl animate-in slide-in-from-bottom-10 duration-700 delay-500">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="p-3 bg-white/10 rounded-xl shrink-0 backdrop-blur-sm">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold uppercase tracking-wider opacity-90">
                  Lộ trình gợi ý tiếp theo
                </h3>
                <p className="text-blue-50 text-lg leading-relaxed font-medium">
                  {evaluation.study_plan}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 pb-12 animate-in fade-in duration-1000 delay-700">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.push("/articles")}
          >
            <Home className="w-4 h-4" /> Danh sách bài học
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => router.push(`/articles/${id}/learn`)}
          >
            <RotateCcw className="w-4 h-4" /> Xem lại bài làm chi tiết
          </Button>
        </div>
      </main>
    </div>
  );
}
