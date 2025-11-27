// app/admin/source-articles/[id]/edit/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { SourceArticle } from "@/types/sourceArticle.type";
import { Skeleton } from "@/components/ui/skeleton";

import { get, patch } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import ArticleForm from "../../ArticleForm";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<SourceArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await get<SourceArticle>(`/api/source-articles/${id}`);

        if (res.success && res.data) {
          setArticle(res.data);
        } else {
          showToast({
            type: "error",
            title: "Lỗi tải dữ liệu",
            description: res.error?.message || "Không tìm thấy bài viết.",
          });
          router.push("/admin/source-articles");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        showToast({ type: "error", title: "Lỗi hệ thống" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id, router]);

  const handleSubmit = async (
    data: Omit<SourceArticle, "_id" | "createdAt" | "updatedAt">
  ) => {
    setIsSubmitting(true);
    try {
      const res = await patch(`/api/source-articles/${id}`, data);

      if (res.success) {
        showToast({
          type: "success",
          title: "Thành công",
          description: "Cập nhật bài viết thành công!",
        });
        router.push("/admin/source-articles");
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Cập nhật thất bại",
          description: res.error?.message,
        });
      }
    } catch (error) {
      console.error("Error updating article:", error);
      showToast({ type: "error", title: "Lỗi hệ thống" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 space-y-4">
        <div className="space-y-2 mb-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Chỉnh sửa Bài viết</h1>
          <p className="text-muted-foreground">
            Cập nhật nội dung và cấu trúc câu.
          </p>
        </div>

        <div className="bg-card rounded-xl border shadow-sm p-6">
          {article && (
            <ArticleForm
              article={article}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}
