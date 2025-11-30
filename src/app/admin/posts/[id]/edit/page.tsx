"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showToast } from "@/utils/toast";
import { get, patch } from "@/utils/apiClient";
import { PostDetail, PostStatus } from "@/types/post";
import PostForm, { PostFormData } from "../../PostForm";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    description: "",
    content: "",
    status: PostStatus.DRAFT,
    thumbnail: "",
  });

  // Fetch post data
  const { data: post, isLoading } = useQuery<PostDetail>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await get<PostDetail>(`/api/posts/${postId}`);
      if (!res.success) {
        throw new Error(res.error?.message || "Không thể tải bài viết");
      }
      return res.data!;
    },
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        description: post.description || "",
        content: post.content || "",
        status: post.status || PostStatus.DRAFT,
        thumbnail: post.thumbnail || "",
      });
    }
  }, [post]);

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!formData.title.trim()) {
        throw new Error("Vui lòng nhập tiêu đề");
      }

      if (!formData.content) {
        throw new Error("Vui lòng nhập nội dung bài viết");
      }

      // Parse content nếu là string
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
        tags: post?.tags || [],
      };

      const res = await patch(`/api/posts/${postId}`, payload);

      if (!res.success) {
        throw new Error(res.error?.message || "Cập nhật bài viết thất bại");
      }
      return res.data;
    },
    onSuccess: () => {
      showToast({
        type: "success",
        title: "Thành công",
        description: "Đã cập nhật bài viết!",
      });
      router.push("/admin/posts");
    },
    onError: (error: any) => {
      showToast({ type: "error", title: "Lỗi", description: error.message });
    },
  });

  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#0B0D14]">
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#15171E] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Chỉnh sửa bài viết
            </h1>
            <p className="text-xs text-muted-foreground">
              {formData.status === PostStatus.PUBLISHED
                ? "Đang công khai"
                : "Bản nháp"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <PostForm
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={() => updatePostMutation.mutate()}
          onCancel={() => router.push("/admin/posts")}
          isSubmitting={updatePostMutation.isPending}
          submitButtonText="Cập nhật"
          mode="edit"
        />
      </div>
    </div>
  );
}
