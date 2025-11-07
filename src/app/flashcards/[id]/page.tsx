"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Flashcard } from "./FlashCard";
import { ChevronRight } from "lucide-react";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";
import { FlashCardDetail, FlashCardProgress } from "@/types/flashCard.type";
import { usePriorityQueue } from "./usePriorityQueue";
import { GifDisplay } from "@/components/GifsDisplay";
import NotFoundFlashCard from "./NotFoundFlashCard";

type FeedbackState = "idle" | "correct" | "incorrect";

async function fetchFlashcard(id: string): Promise<{
  flashcard: FlashCardDetail;
  progress: FlashCardProgress;
}> {
  const res = await fetchWithAuth<{
    flashcard: FlashCardDetail;
    progress: FlashCardProgress;
  }>(`/api/flashcards/${id}`);
  if (!res.success) {
    throw new Error(res.error?.message || "Không thể tải flashcard");
  }
  return res.data!;
}

export default function FlashCardDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [autoNext, setAutoNext] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isInfiniteLoop, setIsInfiniteLoop] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const [showGif, setShowGif] = useState(false);
  const [gifType, setGifType] = useState<"correct" | "incorrect">("correct");

  const { data, isLoading, error } = useQuery({
    queryKey: ["flashcard", id],
    queryFn: async () => {
      const flashcardId = id as string;
      return await fetchFlashcard(flashcardId);
    },
    staleTime: 15 * 60 * 1000,
    retry: 1,
    enabled: !!id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const flashcard = data?.flashcard;
  const progress = data?.progress;

  const {
    currentQuestion,
    updateWeight,
    goToNext,
    reset,
    stats,
    questionNumber,
  } = usePriorityQueue(
    flashcard?.questions || [],
    progress?.progress || [],
    isInfiniteLoop
  );

  // ⭐ Preload GIFs ngay khi vào trang
  useEffect(() => {
    // Preload direct image URLs để browser cache
    const gifsToPreload = [
      // Correct GIFs
      "https://i.gifer.com/Aq.gif",
      "https://i.gifer.com/5e1.gif",
      "https://i.gifer.com/2DV.gif",
      "https://i.gifer.com/fxSL.gif",
      "https://i.gifer.com/i9.gif",
      "https://i.gifer.com/Bt4.gif",
      "https://i.gifer.com/2DV.gif",
      // Incorrect GIFs
      "https://i.gifer.com/1ze3.gif",
      "https://i.gifer.com/1vms.gif",
      "https://i.gifer.com/Elga.gif",
      "https://i.gifer.com/xC5.gif",
      "https://i.gifer.com/2yOW.gif",
    ];

    gifsToPreload.forEach((url) => {
      // Method 1: Link preload tag
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = "image";
      document.head.appendChild(link);

      // Method 2: Image object (backup)
      const img = new Image();
      img.src = url;
    });
  }, []);

  useEffect(() => {
    if (error) {
      showToast({
        description: (error as Error).message || "Không thể tải flashcard",
        type: "error",
        title: "Lỗi",
      });
    }
  }, [error]);

  const resetCardState = useCallback(() => {
    setSelectedOption(null);
    setFeedbackState("idle");
  }, []);

  const goToNextCard = useCallback(() => {
    const hasNext = goToNext();

    if (!hasNext) {
      setIsCompleted(true);
      return;
    }

    setIsFlipping(true);
    setShowGif(false);
    setTimeout(() => {
      resetCardState();
      setIsFlipping(false);
    }, 500);
  }, [goToNext, resetCardState]);

  useEffect(() => {
    if (autoNext && feedbackState === "correct") {
      const timer = setTimeout(() => {
        goToNextCard();
      }, 2000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [autoNext, feedbackState, goToNextCard]);

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (feedbackState !== "idle" || !currentQuestion) return;

      setSelectedOption(optionIndex);
      const isAnswerCorrect = optionIndex === currentQuestion.correctAnswer;

      updateWeight(currentQuestion._id, isAnswerCorrect);

      if (isAnswerCorrect) {
        setFeedbackState("correct");
        setGifType("correct");
        setShowGif(true);
      } else {
        setFeedbackState("incorrect");
        setGifType("incorrect");
        setShowGif(true);
        setTimeout(() => {
          resetCardState();
        }, 2000);
      }
    },
    [currentQuestion, feedbackState, updateWeight, resetCardState]
  );

  const restartQuiz = () => {
    setIsCompleted(false);
    reset();
    resetCardState();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg font-medium">Đang tải flashcard...</div>
          <div className="text-sm text-muted-foreground">
            Vui lòng đợi trong giây lát
          </div>
        </div>
      </div>
    );
  }

  if (error || !flashcard) {
    return <NotFoundFlashCard />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-50">
      <div className="w-full max-w-7xl mx-auto px-4">
        {isCompleted ? (
          <Card className="text-center max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                🎉 Chúc mừng! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground dark:text-slate-400">
                Bạn đã hoàn thành thành công tất cả các flashcard.
              </p>
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <p className="text-sm">
                  <strong>Tổng câu:</strong> {stats.totalQuestions}
                </p>
                <p className="text-sm">
                  <strong>Đã học:</strong> {stats.seenCount}
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={restartQuiz} className="w-full sm:w-auto">
                Học lại
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <header className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {flashcard.title}
              </h1>
              <p className="text-muted-foreground mt-2  dark:text-slate-400">
                {flashcard.description || "Kiểm tra kiến thức của bạn."}
              </p>
            </header>
            <div className="relative mb-4">
              <GifDisplay
                className="hidden lg:block absolute  -right-10 w-48"
                type={gifType}
                show={showGif}
              />

              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                <div className="w-full lg:flex-1 max-w-2xl">
                  <div
                    className={`transition-transform duration-300 ${
                      isFlipping
                        ? "transform rotate-y-90 scale-95"
                        : "transform rotate-y-0 scale-100"
                    }`}
                    style={{ perspective: "1000px" }}
                  >
                    {currentQuestion && (
                      <Flashcard
                        index={questionNumber}
                        card={currentQuestion}
                        selectedOption={selectedOption}
                        onSelectOption={handleSelectOption}
                        feedbackState={feedbackState}
                      />
                    )}
                  </div>
                </div>
              </div>

              <footer className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-next"
                      checked={autoNext}
                      onCheckedChange={setAutoNext}
                    />
                    <label
                      htmlFor="auto-next"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                    >
                      Tự động chuyển tiếp khi đúng
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="infinite-loop"
                      checked={isInfiniteLoop}
                      onCheckedChange={setIsInfiniteLoop}
                    />
                    <label
                      htmlFor="infinite-loop"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                    >
                      Vòng lặp vô hạn (ưu tiên câu sai)
                    </label>
                  </div>
                </div>

                {/* ⭐ Sticky button trên mobile, inline trên desktop */}
                {feedbackState === "correct" && (
                  <Button
                    onClick={goToNextCard}
                    className="w-full sm:w-auto fixed sm:relative cursor-pointer
                      bottom-4 sm:bottom-auto
                      left-4 sm:left-auto
                      right-4 sm:right-auto
                      z-50
                      shadow-lg sm:shadow-none
                    "
                  >
                    Thẻ tiếp theo
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </footer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
