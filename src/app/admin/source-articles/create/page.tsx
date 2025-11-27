"use client";
import { useRouter } from "next/navigation";

import { SourceArticle } from "@/types/sourceArticle.type";
import ArticleForm from "../ArticleForm";
import { post } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import { useState } from "react";

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    data: Omit<SourceArticle, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsSubmitting(true);
      const response = await post("/api/source-articles", data);
      if (response.success) {
        showToast({
          type: "success",
          description: "Tạo bài viết thành công",
          title: "Thành công",
        });
        router.push("/admin/source-articles");
      } else {
        showToast({
          type: "error",
          description: response.error?.message || "Tạo bài viết thất bại",
          title: "Lỗi",
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        description: "Đã có lỗi xảy ra khi tạo bài viết",
        title: "Lỗi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tạo bài viết mới</h1>
          <p className="text-muted-foreground">
            Sử dụng biểu mẫu bên dưới để tạo bài viết nguồn mới cho hệ thống.
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          <ArticleForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
}
