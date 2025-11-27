"use client";
import { useQuery } from "@tanstack/react-query";
import FlashCard from "@/components/FlashCard";
import { FlashCardBase } from "@/types/flashCard.type";
import { SkeletonCard } from "@/components/SkeletonCard";
import { get } from "@/utils/apiClient";

export default function FlashCards() {
  const {
    data: flashCards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["flashcards"],
    queryFn: async () => {
      const res = await get<FlashCardBase[]>("/api/flashcards");
      if (!res.success) {
        throw new Error("Lỗi tải flashcards");
      }
      return res.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Đã có lỗi xảy ra khi tải flashcards.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {flashCards?.map((card) => (
        <FlashCard key={card._id} card={card} />
      ))}
    </div>
  );
}
