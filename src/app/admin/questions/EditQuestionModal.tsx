"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Question } from "@/models/Question";
import KatexContentRender from "@/components/KatexContentRender";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
  onSave: (data: Partial<Question>) => void;
  isLoading: boolean;
}

export function EditQuestionModal({
  question,
  onClose,
  onSave,
  isLoading,
}: EditQuestionModalProps) {
  const [content, setContent] = useState(question.content);
  const [options, setOptions] = useState<string[]>(question.options);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [explanation, setExplanation] = useState(question.explanation || "");

  // States để quản lý việc hiển thị xem trước
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showExplanationPreview, setShowExplanationPreview] = useState(false);
  const [showOptionsPreview, setShowOptionsPreview] = useState(false);

  const handleSave = () => {
    onSave({
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      {/* max-h-[90vh] và flex-col giúp modal không bị tràn màn hình và cố định header/footer */}
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Sửa Câu Hỏi</DialogTitle>
        </DialogHeader>

        {/* Phần nội dung chính có thể cuộn (overflow-y-auto) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <>
                    <EyeOff className="w-4 h-4 mr-2" /> Ẩn xem trước
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Xem trước
                  </>
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
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase">
                  Preview:
                </p>
                <KatexContentRender content={content} border={false} />
              </div>
            )}
          </div>

          <div className="border-t my-4" />

          {/* 2. CÁC LỰA CHỌN */}
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
                  <>
                    <EyeOff className="w-4 h-4 mr-2" /> Ẩn xem trước options
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Xem trước options
                  </>
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 border rounded-lg bg-card/50"
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

                  {/* Chỉ hiện preview của từng option nếu nút bật được kích hoạt */}
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

          {/* 3. ĐÁP ÁN ĐÚNG & GIẢI THÍCH */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="correctAnswer" className="font-semibold">
                Đáp án đúng (Index)
              </Label>
              <Input
                id="correctAnswer"
                type="number"
                min={0}
                max={options.length - 1}
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(parseInt(e.target.value))}
                placeholder="Ví dụ: 0"
              />
              <p className="text-xs text-muted-foreground">
                Nhập số thứ tự của đáp án đúng (bắt đầu từ 0).
              </p>
            </div>

            <div className="md:col-span-2 space-y-2">
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
                <div className="bg-muted/50 p-4 rounded-md border mt-2">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase">
                    Preview:
                  </p>
                  <KatexContentRender content={explanation} border={false} />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
