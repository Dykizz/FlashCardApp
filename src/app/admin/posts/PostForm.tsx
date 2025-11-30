"use client";

import React from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Tiptap from "@/components/Editor/Tiptap";
import { PostStatus } from "@/types/post";

export interface PostFormData {
  title: string;
  description: string;
  content: string | object; // Cho phép cả string và object
  status: PostStatus;
  thumbnail: string;
}

interface PostFormProps {
  formData: PostFormData;
  onFormChange: (data: Partial<PostFormData>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitButtonText?: string;
  mode?: "create" | "edit";
}

export default function PostForm({
  formData,
  onFormChange,
  onSubmit,
  onCancel,
  isSubmitting,
  submitButtonText,
  mode = "create",
}: PostFormProps) {
  const { title, description, content, status, thumbnail } = formData;
  console.log("PostForm content:", content);
  console.log("type of content:", typeof content);
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#0B0D14]">
      <div className="space-y-6 mt-5">
        <Card>
          <CardContent className="p-4 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <Label htmlFor="status">Trạng thái bài viết</Label>
              <Select
                value={status}
                onValueChange={(val) =>
                  onFormChange({ status: val as PostStatus })
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PostStatus.DRAFT}>Bản nháp</SelectItem>
                  <SelectItem value={PostStatus.PUBLISHED}>
                    Công khai
                  </SelectItem>
                  <SelectItem value={PostStatus.ARCHIVED}>Lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Tiêu đề bài viết</Label>
              <Input
                placeholder="Nhập tiêu đề bài viết..."
                value={title}
                id="title"
                onChange={(e) => onFormChange({ title: e.target.value })}
                autoFocus={mode === "create"}
              />
            </div>

            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-700/50">
              <Label htmlFor="description">Mô tả ngắn (SEO)</Label>
              <Textarea
                id="description"
                placeholder="Giới thiệu sơ lược về nội dung..."
                className="resize-none h-24"
                value={description}
                onChange={(e) => onFormChange({ description: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <Label>Ảnh bìa (URL)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Dán link ảnh vào đây..."
                  value={thumbnail}
                  onChange={(e) => onFormChange({ thumbnail: e.target.value })}
                />
              </div>

              {thumbnail && (
                <div className="relative aspect-video h-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 mt-3 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={thumbnail}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://placehold.co/600x400?text=Invalid+Image")
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full flex flex-col gap-8 mt-5">
        <div className="min-h-[500px]">
          <Tiptap
            content={content}
            onChange={(json) => onFormChange({ content: json })}
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 flex items-center justify-end gap-3 px-6 py-4 bg-white dark:bg-[#15171E] border-t border-slate-200 dark:border-slate-800 mt-8">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {submitButtonText ||
            (status === PostStatus.PUBLISHED ? "Đăng bài" : "Lưu nháp")}
        </Button>
      </div>
    </div>
  );
}
