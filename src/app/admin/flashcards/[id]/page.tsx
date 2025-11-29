"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/utils/apiClient";
import { FlashCardDetail } from "@/types/flashCard.type";
import { Question } from "@/types/question.type"; // ⭐ Import Question type
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import KatexContentRender from "@/components/KatexContentRender";
import Link from "next/link";

export default function FlashCardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["flashcard-detail", id],
    queryFn: async () => {
      const res = await get<FlashCardDetail>(`/api/flashcards/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Lỗi tải dữ liệu</h1>
          <Button onClick={() => router.back()} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const { title, description, subject, questions } = data;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0D14] p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
          <p className="text-sm text-muted-foreground">Môn: {subject}</p>
        </div>

        <div className="space-y-6">
          {questions && questions.length > 0 ? (
            questions.map((question: Question, index: number) => (
              <div
                key={question._id}
                className="bg-white dark:bg-[#15171E] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <Link href={`/admin/questions/${question._id}`}>
                  <Button className="ml-auto flex gap-3 items-center cursor-pointer">
                    <Edit className="size-4" /> Sửa
                  </Button>
                </Link>

                <div className="mb-4">
                  <KatexContentRender
                    border={false}
                    content={`**Câu ${index + 1}**: ` + question.content}
                  />
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Lựa chọn:</h4>
                  <ul className="space-y-2">
                    {question.options.map((option, i) => (
                      <li
                        key={i}
                        className={`p-3 rounded-lg flex items-center ${
                          i === question.correctAnswer
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            : "bg-slate-100 dark:bg-slate-800"
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <KatexContentRender content={option} border={false} />
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Giải thích:</h4>
                  <KatexContentRender content={question.explanation ?? ""} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              Không có câu hỏi nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
