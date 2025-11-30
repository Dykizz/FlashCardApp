"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/toast";
import { post } from "@/utils/apiClient";
import { PostStatus } from "@/types/post";
import PostForm, { PostFormData } from "../PostForm";

export default function CreatePostPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    content: "",
    status: PostStatus.DRAFT,
    thumbnail: "",
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!formData.title.trim()) {
        throw new Error("Vui lòng nhập tiêu đề");
      }
      if (
        !formData.content ||
        formData.content === '{"type":"doc","content":[]}'
      ) {
        throw new Error("Vui lòng nhập nội dung bài viết");
      }

      let contentObj;
      if (typeof formData.content === "string") {
        try {
          contentObj = JSON.parse(formData.content);
        } catch (e) {
          throw new Error("Lỗi định dạng nội dung");
        }
      } else {
        contentObj = formData.content;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        content: contentObj,
        thumbnail: formData.thumbnail,
        status: formData.status,
        tags: [],
      };

      const res = await post("/api/posts", payload);

      if (!res.success) {
        throw new Error(res.error?.message || "Tạo bài viết thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Thành công",
        description: "Đã tạo bài viết mới!",
      });
      router.push("/admin/posts");
    },
    onError: (error: any) => {
      showToast({ type: "error", title: "Lỗi", description: error.message });
    },
  });

  const handleFormChange = (data: Partial<PostFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#0B0D14]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#15171E] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Viết bài mới
            </h1>
            <p className="text-xs text-muted-foreground">
              {formData.status === PostStatus.PUBLISHED
                ? "Sẽ đăng công khai ngay"
                : "Lưu nháp"}
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6">
        <PostForm
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={() => createPostMutation.mutate()}
          onCancel={() => router.push("/admin/posts")}
          isSubmitting={createPostMutation.isPending}
          mode="create"
        />
      </div>
    </div>
  );
}
