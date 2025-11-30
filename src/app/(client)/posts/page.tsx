"use client";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/post";
import { SkeletonCard } from "@/components/SkeletonCard";
import { get } from "@/utils/apiClient";
import PostCard from "./PostCard";

export default function Posts() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await get<Post[]>("/api/posts?status=published");
      if (!res.success) {
        throw new Error("Lỗi tải posts");
      }
      return res.data;
    },
    retry: 1,
    staleTime: 1 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto  px-4 py-8 ">
          <header className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Thư viện Blog
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Cập nhật những bài viết mới nhất từ chúng tôi!
            </p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Đã có lỗi xảy ra khi tải posts.
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
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto  px-4 py-8 ">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Thư viện Blog
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Cập nhật những bài viết mới nhất từ chúng tôi!
          </p>
        </header>
        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts?.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
