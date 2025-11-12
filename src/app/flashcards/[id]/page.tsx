"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { get } from "@/utils/apiClient";
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
import { useSession } from "next-auth/react";
import { NotLogin } from "@/components/NotLogin";

type FeedbackState = "idle" | "correct" | "incorrect";

async function fetchFlashcard(id: string): Promise<{
  flashcard: FlashCardDetail;
  progress: FlashCardProgress;
}> {
  const res = await get<{
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
  const { data: seesion } = useSession();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");
  const [autoNext, setAutoNext] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isInfiniteLoop, setIsInfiniteLoop] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [gifKey, setGifKey] = useState(0);
  const [showGif, setShowGif] = useState(false);
  const [onGif, setOnGif] = useState(false);
  const [gifType, setGifType] = useState<"correct" | "incorrect">("correct");

  const { data, isLoading, error } = useQuery({
    queryKey: ["flashcard", id],
    queryFn: async () => {
      if (!seesion) return;
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

  const {
    currentQuestion,
    updateWeight,
    goToNext,
    reset,
    stats,
    questionNumber,
  } = usePriorityQueue(flashcard?.questions || [], [], isInfiniteLoop);

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
        setGifKey(0);
      } else {
        setFeedbackState("incorrect");
        setGifType("incorrect");
        setShowGif(true);
        setGifKey((prev) => prev + 1);
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

  if (!seesion) return <NotLogin />;

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
                Chúc mừng!
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
              {onGif && (
                <GifDisplay
                  className="hidden 2xl:block absolute  -right-10 w-48"
                  type={gifType}
                  show={showGif}
                />
              )}

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
                        key={gifKey}
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
                      Tự động chuyển
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
                      Vô hạn
                    </label>
                  </div>
                  <div className="hidden 2xl:block">
                    <div className="flex items-center space-x-2 ">
                      <Switch
                        id="on-gif"
                        checked={onGif}
                        onCheckedChange={setOnGif}
                      />
                      <label
                        htmlFor="on-gif"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300"
                      >
                        Bật GIF
                      </label>
                    </div>
                  </div>
                </div>

                {feedbackState === "correct" && (
                  <Button
                    onClick={goToNextCard}
                    className="w-full sm:w-auto fixed sm:relative cursor-pointer
                      bottom-4 sm:bottom-auto
                      left-4 sm:left-auto
                      right-4 sm:right-auto
                      z-50
                      rounded-xl
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
