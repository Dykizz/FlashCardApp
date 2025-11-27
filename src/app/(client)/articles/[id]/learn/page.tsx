"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  Keyboard,
  Eye,
  EyeOff,
  Loader2,
  ChevronRight,
  RotateCcw,
  ScanEye,
  BarChart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { get, post } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import {
  SourceArticle,
  GradingSentence,
  UserProgress,
} from "@/types/sourceArticle.type";
import FeedbackHighlighter from "./FeedbackHighlighter";
import ComplexityBadge from "@/components/ComplexityBadge";
import LevelBadge from "@/components/LevelBadge";
import { HintBox } from "./HintBox";

// --- Helper: Màu điểm số ---
const getScoreColor = (score: number) => {
  if (score >= 9)
    return "text-green-600 border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400";
  if (score >= 7)
    return "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400";
  if (score >= 5)
    return "text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400";
  return "text-red-600 border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400";
};

const formatCorrectionText = (text: string) => {
  const parts = text.split(/'([^']+)'/g);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <span key={index} className="font-bold text-slate-900 dark:text-white">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // --- STATE ---
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState<"typing" | "checking" | "result">(
    "typing"
  );
  const [feedback, setFeedback] = useState<GradingSentence | null>(null);
  const [showUserAnswer, setShowUserAnswer] = useState(true);

  // State cho Resume Dialog
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [savedStep, setSavedStep] = useState(0);
  const hasCheckedProgress = useRef(false);

  // --- 1. QUERY: Bài viết ---
  const {
    data: article,
    isLoading: isLoadingArticle,
    isError,
  } = useQuery({
    queryKey: ["learn-article", id],
    queryFn: async () => {
      const res = await get<SourceArticle>(`/api/source-articles/${id}`);
      if (!res.success || !res.data) throw new Error("Lỗi tải bài");
      return res.data;
    },
    retry: false,
  });

  // --- 2. QUERY: Tiến trình ---
  const { data: progressData, refetch: refetchProgress } = useQuery({
    queryKey: ["user-progress", id],
    queryFn: async () => {
      const res = await get<UserProgress>(`/api/user-progress?articleId=${id}`);
      return res.success ? res.data : null;
    },
    enabled: !!id,
    retry: false,
  });

  // --- 3. EFFECT: HỎI RESUME (Chỉ chạy 1 lần) ---
  useEffect(() => {
    if (
      progressData &&
      progressData.current_step > 0 &&
      !hasCheckedProgress.current
    ) {
      // Nếu đã hoàn thành (is_completed), không hỏi resume mà cho về câu 1 để review
      if (!progressData.is_completed) {
        setSavedStep(progressData.current_step);
        setResumeDialogOpen(true);
      }
      hasCheckedProgress.current = true;
    }
  }, [progressData]);

  // --- 4. EFFECT: ĐỒNG BỘ DỮ LIỆU CŨ KHI CHUYỂN CÂU (QUAN TRỌNG NHẤT) ---
  useEffect(() => {
    if (!article || !progressData?.history) return;

    const currentSentenceId =
      article.source_sentences[currentStep]?.sentence_id;

    const historyItem = progressData.history.find(
      (h: any) => h.sentence_id === currentSentenceId
    );

    if (historyItem) {
      // A. ĐÃ LÀM: Load lại bài cũ & Kết quả chấm
      setUserInput(historyItem.user_submission);
      setFeedback(historyItem.ai_feedback); // Load lại feedback AI đã lưu
      setStatus("result"); // Chuyển ngay sang trạng thái ĐÃ CÓ KẾT QUẢ
      setShowUserAnswer(true);
    } else {
      // B. CHƯA LÀM: Reset trắng
      setUserInput("");
      setFeedback(null);
      setStatus("typing");
    }
  }, [currentStep, progressData, article]);

  // --- 5. AUTO FOCUS INPUT ---
  useEffect(() => {
    if (status === "typing" && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [status]);

  // --- HELPER VARIABLES ---
  const currentSentence = article?.source_sentences[currentStep];
  const isLastSentence =
    article && currentStep === article.source_sentences.length - 1;
  const progressPercent = article
    ? ((currentStep + (status === "result" ? 1 : 0)) /
        article.source_sentences.length) *
      100
    : 0;

  // Check xem người dùng đã hoàn thành cả bài chưa
  const isArticleCompleted = progressData?.is_completed;

  // --- MUTATION CHẤM ĐIỂM ---
  const checkMutation = useMutation({
    mutationFn: async () => {
      if (!currentSentence) throw new Error("No data");
      const res = await post<GradingSentence>("/api/check-sentence", {
        articleId: article._id,
        sentenceId: currentSentence.sentence_id,
        totalSentences: article.source_sentences.length,
        vnSentence: currentSentence.content_vn,
        enSubmission: userInput,
        level: article.level,
      });
      if (!res.success || !res.data) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback(data);
      setStatus("result");
      refetchProgress(); // Cập nhật lại tiến độ mới nhất
    },
    onError: (err: Error) => {
      showToast({ type: "error", title: "Lỗi", description: err.message });
      setStatus("typing");
    },
  });

  // --- HANDLERS ---
  const handleCheck = () => {
    if (!userInput.trim()) return;
    setStatus("checking");
    checkMutation.mutate();
  };

  const handleNext = () => {
    if (isLastSentence) {
      // Nếu là câu cuối -> Chuyển sang trang kết quả tổng quan
      router.push(`/articles/${id}/result`);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleRetry = () => {
    setStatus("typing");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleResume = () => {
    // Giới hạn không nhảy quá số câu
    const maxIndex = (article?.source_sentences.length || 1) - 1;
    setCurrentStep(Math.min(savedStep, maxIndex));
    setResumeDialogOpen(false);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setResumeDialogOpen(false);
  };

  // --- RENDER ---
  if (isLoadingArticle || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-slate-900 dark:text-slate-50 font-sans pb-32 transition-colors duration-300">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#020817]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                {article.topic} <LevelBadge level={article.level} />
              </div>
              <p className="font-semibold text-sm ">{article.title_vn}</p>
            </div>

            {/* Nút xem kết quả tổng quan (Chỉ hiện nếu đã hoàn thành bài này) */}
            {isArticleCompleted ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-2 border-green-500/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => router.push(`/articles/${id}/result`)}
              >
                <BarChart className="w-4 h-4" /> Tổng kết
              </Button>
            ) : (
              <div className="w-9" />
            )}
          </div>

          <div className="w-full flex items-center gap-3">
            <Progress
              value={progressPercent}
              className="h-1.5 w-full bg-slate-200 dark:bg-slate-800"
            />
            <span className="text-xs font-mono font-medium text-muted-foreground whitespace-nowrap">
              {currentStep + (status === "result" ? 1 : 0)}/
              {article.source_sentences.length}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-4 mt-6 space-y-8">
        {/* 1. CÂU HỎI */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs px-2.5 py-0.5">
              Câu {currentStep + 1}
            </Badge>
            <ComplexityBadge score={currentSentence?.complexity_score || 0} />
          </div>
          <h2 className="text-lg md:text-xl font-medium leading-snug">
            {currentSentence?.content_vn}
          </h2>
        </section>
        <HintBox hints={currentSentence?.hints} />

        {/* 2. INPUT */}
        <section className="space-y-2 transition-all duration-500">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2 tracking-wider">
              <MessageSquare className="w-3 h-3" /> Bài làm của bạn
            </p>
            {status === "result" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-muted-foreground hover:text-primary"
                onClick={() => setShowUserAnswer(!showUserAnswer)}
              >
                {showUserAnswer ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1.5" /> Ẩn
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1.5" /> Hiện
                  </>
                )}
              </Button>
            )}
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              !showUserAnswer && status === "result"
                ? "h-0 opacity-0"
                : "h-auto opacity-100"
            }`}
          >
            <Card
              className={`border-slate-200 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/5 bg-white dark:bg-[#111827] shadow-sm ${
                status === "result" ? "opacity-80" : ""
              }`}
            >
              <CardContent className="p-0">
                <div className="p-4">
                  <Textarea
                    ref={inputRef}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.ctrlKey &&
                      e.key === "Enter" &&
                      status === "typing" &&
                      handleCheck()
                    }
                    disabled={status !== "typing"}
                    placeholder="Nhập bản dịch tiếng Anh..."
                    className={`min-h-[120px] resize-none border-none focus-visible:ring-0 p-0 shadow-none bg-transparent ${
                      status === "result" ? "text-muted-foreground" : ""
                    }`}
                    spellCheck={false}
                  />
                </div>
                {status !== "result" && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Keyboard className="w-3 h-3" /> Ctrl + Enter
                    </span>
                    <Button
                      onClick={handleCheck}
                      disabled={!userInput.trim() || checkMutation.isPending}
                      className="min-w-[120px] font-semibold shadow-md"
                    >
                      {checkMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Chấm...
                        </>
                      ) : (
                        <>
                          <ChevronRight className="w-4 h-4 mr-1" /> Kiểm tra
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 3. RESULT */}
        {status === "result" && feedback && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800">
            {/* Score */}
            <div className="flex items-center gap-4">
              <div
                className={`flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 shadow-sm ${getScoreColor(
                  feedback.score
                )} bg-white dark:bg-transparent`}
              >
                <span className="text-2xl font-black tracking-tighter">
                  {feedback.score}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase mb-1">
                  Đánh giá tổng quan
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  {feedback.overall_comment}
                </p>
              </div>
            </div>

            {/* Highlight */}
            {feedback.highlighted_sentence && (
              <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#111827]">
                <CardHeader className="py-3 px-4 border-b bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                    <ScanEye className="w-4 h-4 text-purple-500" /> Phân tích
                    lỗi sai
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <FeedbackHighlighter
                    htmlString={feedback.highlighted_sentence}
                  />
                </CardContent>
              </Card>
            )}

            {/* Improvement */}
            {feedback.model_improvement && (
              <Card className="overflow-hidden border-blue-200 dark:border-blue-800 shadow-md bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader className="py-3 px-4 border-b border-blue-100 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-900/20">
                  <CardTitle className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Gợi ý tối ưu hóa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-lg font-medium leading-relaxed">
                    {feedback.model_improvement}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Corrections */}
            {feedback.corrections?.length > 0 && (
              <Card className="border-l-4 border-l-orange-400 shadow-sm bg-white dark:bg-[#111827]">
                <CardHeader className="py-3 px-4 border-b bg-orange-50/50 dark:bg-orange-900/10">
                  <CardTitle className="text-sm font-bold uppercase text-orange-700 dark:text-orange-400">
                    Chi tiết cần sửa
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {feedback.corrections.map((corr, idx) => (
                    <div key={idx} className="flex gap-3 items-start text-sm">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <span className="inline-block font-bold text-[10px] text-red-600 dark:text-red-400 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 rounded mr-2 uppercase">
                          {corr.type}
                        </span>
                        {formatCorrectionText(corr.text)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tham khảo thêm */}
            <div className="pt-4">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2 tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Các cách diễn đạt khác
              </h3>
              <div className="grid gap-2.5">
                {(currentSentence?.sample_answers?.length ?? 0) > 0 ? (
                  currentSentence!.sample_answers.map((answer, idx) => (
                    <div
                      key={idx}
                      className="group relative p-3.5 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all"
                    >
                      <div className="flex gap-3">
                        <Badge
                          variant="secondary"
                          className="h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px] shrink-0 font-mono"
                        >
                          {idx + 1}
                        </Badge>
                        <p className="text-sm leading-relaxed pr-2">{answer}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-lg">
                    Chưa có đáp án tham khảo.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#020817]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex justify-center z-50">
              <div className="w-full max-w-6xl flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRetry}
                  className="flex-1 border-dashed dark:bg-[#111827] dark:hover:bg-slate-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Làm lại
                </Button>
                <Button
                  size="lg"
                  onClick={handleNext}
                  className="flex-1 shadow-xl shadow-primary/20"
                >
                  {isLastSentence ? "Hoàn thành" : "Tiếp theo"}{" "}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
            <div className="h-20" />
          </section>
        )}
      </main>

      {/* DIALOG RESUME */}
      <AlertDialog open={resumeDialogOpen} onOpenChange={setResumeDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-[#15171E]">
          <AlertDialogHeader>
            <AlertDialogTitle>Phát hiện bài đang làm dở</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đã hoàn thành đến <b>câu {savedStep}</b>. Muốn tiếp tục không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRestart}>
              Làm lại từ đầu
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResume}>
              Tiếp tục câu {savedStep + 1}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
