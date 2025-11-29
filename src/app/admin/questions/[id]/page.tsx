"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/utils/apiClient";
import { Question } from "@/models/Question";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import KatexContentRender from "@/components/KatexContentRender";
import { Eye, EyeOff, Plus, Trash2, ArrowLeft, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const queryClient = useQueryClient();

  const [content, setContent] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");

  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showExplanationPreview, setShowExplanationPreview] = useState(false);
  const [showOptionsPreview, setShowOptionsPreview] = useState(false);

  const {
    data: question,
    isLoading,
    isError,
  } = useQuery<Question, Error>({
    queryKey: ["admin-question", id],
    queryFn: async () => {
      const res = await get<Question>(`/api/admin/questions/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      if (res.data) {
        setContent(res.data.content);
        setOptions(res.data.options);
        setCorrectAnswer(res.data.correctAnswer);
        setExplanation(res.data.explanation || "");
      } else {
        showToast({
          type: "error",
          title: "Lỗi tải dữ liệu",
          description: "Câu hỏi không tồn tại.",
        });
      }
      return res.data!;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Question>) => {
      const res = await patch<Question>(`/api/admin/questions/${id}`, data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      showToast({
        type: "success",
        title: "Cập nhật thành công",
        description: "Câu hỏi đã được cập nhật.",
      });
      router.back();
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Cập nhật thất bại",
        description: error.message || "Đã có lỗi xảy ra.",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      content,
      options,
      correctAnswer,
      explanation,
    });
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !question) {
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

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B0D14] p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Chỉnh sửa câu hỏi
          </h1>
          <p className="text-muted-foreground mt-1">
            Cập nhật nội dung câu hỏi
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[#15171E] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* 1. NỘI DUNG CÂU HỎI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content" className="text-base font-semibold">
                Nội dung câu hỏi
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowContentPreview(!showContentPreview)}
                className="text-muted-foreground h-8"
              >
                {showContentPreview ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
              </Button>
            </div>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX)..."
              className="min-h-[100px]"
            />
            {showContentPreview && (
              <div className="bg-muted/50 p-4 rounded-md border mt-2">
                <KatexContentRender content={content} border={false} />
              </div>
            )}
          </div>

          <div className="border-t my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Các lựa chọn</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOptionsPreview(!showOptionsPreview)}
                className="text-muted-foreground h-8"
              >
                {showOptionsPreview ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {options.map((option, index) => (
                <div
                  key={index}
                  className={
                    "flex flex-col gap-2 p-3 border rounded-lg bg-card/50 " +
                    (index === correctAnswer
                      ? "border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50 text-green-900 dark:text-green-100"
                      : "border-transparent")
                  }
                >
                  <div className="flex gap-2 items-center">
                    <span className="text-sm font-medium w-6 text-center text-muted-foreground">
                      {index}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Nhập lựa chọn ${index}`}
                      className="flex-1"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="h-9 w-9 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {showOptionsPreview && option && (
                    <div className="pl-8">
                      <KatexContentRender
                        content={option}
                        className="text-sm bg-muted/30 p-2 rounded"
                        border={false}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="mt-2 w-full border-dashed"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm lựa chọn mới
            </Button>
          </div>

          <div className="border-t my-4" />

          <div className="gap-6">
            <div className="space-y-3">
              <Label htmlFor="correctAnswer" className="font-semibold">
                Đáp án đúng
              </Label>
              <div className="flex gap-3 mt-2">
                {options?.map((_, index) => (
                  <Button
                    variant={correctAnswer === index ? "default" : "ghost"}
                    className="hover:bg-primary cursor-pointer"
                    onClick={() => setCorrectAnswer(index)}
                    key={index}
                  >
                    {String.fromCharCode(65 + index)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="explanation" className="font-semibold">
                  Giải thích đáp án
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowExplanationPreview(!showExplanationPreview)
                  }
                  className="text-muted-foreground h-8"
                >
                  {showExplanationPreview ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <Textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Nhập giải thích chi tiết..."
                rows={5}
              />
              {showExplanationPreview && explanation && (
                <KatexContentRender content={explanation} />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => router.back()}>
              <X className="w-4 h-4 mr-2" />
              Hủy bỏ
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
