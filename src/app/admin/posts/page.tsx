"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  PenTool,
  Trash,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { del, get } from "@/utils/apiClient";
import { useDebounce } from "@/hooks/use-debounce";

import { SortingState } from "@tanstack/react-table";
import { columns } from "./columns";
import { Post } from "@/types/post";
import { showToast } from "@/utils/toast";

export default function PostsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [page, setPage] = useState(1);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const limit = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-posts", page, limit, debouncedSearch, sorting],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);

      params.append("sort", sorting[0]?.id || "createdAt");
      params.append("order", sorting[0]?.desc ? "desc" : "asc");

      const res = await get<Post[]>(`/api/posts?${params.toString()}`);

      if (!res.success) throw new Error(res.error?.message);

      return {
        posts: res.data || [],
        pagination: res.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });

  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await del(`/api/posts/${postId}`);
      if (!res.success) throw new Error(res.error?.message);
      return postId;
    },
    onSuccess: (deletedId) => {
      showToast({
        type: "success",
        title: "Thành công",
        description: `Đã xóa bài viết ${deletedId}`,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-posts", page, limit, debouncedSearch, sorting],
      });
      setPostToDelete(null);
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Lỗi xóa",
        description: error.message,
      });
      setPostToDelete(null); // Đóng dialog
    },
  });

  const handleDeletePost = (postId: string) => {
    deletePostMutation.mutate(postId);
    queryClient.invalidateQueries({
      queryKey: ["admin-posts", page, limit, debouncedSearch, sorting],
    });
  };

  const handleOpenDeleteDialog = (post: Post) => {
    setPostToDelete(post);
  };

  const posts = data?.posts || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 dark:bg-[#0B0D14] min-h-screen">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PenTool className="h-8 w-8" /> Quản lý bài viết
          </h1>
          <p className="text-muted-foreground mt-1">
            Danh sách tất cả bài viết trên Blog ({pagination?.totalDocs || 0}).
          </p>
        </div>

        <Link href="/admin/posts/new">
          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Viết bài mới
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#15171E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#15171E] rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={posts}
          isLoading={isLoading}
          sorting={sorting}
          onSortingChange={setSorting}
          meta={{
            handleOpenDeleteDialog: handleOpenDeleteDialog,
            handleDeletePost: handleDeletePost,
            isDeleting: deletePostMutation.isPending,
            deletingId: deletePostMutation.variables,
          }}
        />
      </div>

      {!isLoading && posts.length > 0 && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <span className="text-sm text-muted-foreground mr-4">
            Trang <strong>{page}</strong> / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <Trash className="w-6 h-6" /> Xác nhận xóa
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa bài viết
              <span className="font-bold text-red-600">
                {postToDelete?.title}
              </span>
              này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPostToDelete(null)}>
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              disabled={deletePostMutation.isPending}
              onClick={() => handleDeletePost(postToDelete!._id)} // Gọi hàm xóa
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePostMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Xóa vĩnh viễn"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
