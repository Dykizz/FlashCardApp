"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArticleLevel, SourceArticle } from "@/types/sourceArticle.type";
import { useDebounce } from "@/hooks/use-debounce";
import { del, get } from "@/utils/apiClient";
import { showToast } from "@/utils/toast";
import { DataTable } from "@/components/ui/data-table";
import LevelBadge from "@/components/LevelBadge";

export default function ArticlesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [articleToDelete, setArticleToDelete] = useState<SourceArticle | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<ArticleLevel | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading } = useQuery({
    queryKey: ["articles", page, limit, debouncedSearch, filterLevel],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterLevel !== "all") params.append("level", filterLevel);

      const res = await get<SourceArticle[]>(
        `/api/source-articles?${params.toString()}`
      );
      if (!res.success) throw new Error(res.error?.message || "Failed");

      return {
        articles: res.data || [],
        pagination: res.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });

  const articles = data?.articles || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  // --- Mutation ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await del(`/api/source-articles/${id}`);
      if (!res.success) throw new Error(res.error?.message);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["articles", page, limit, debouncedSearch, filterLevel],
      });
      setArticleToDelete(null);
      showToast({ type: "success", title: "Xóa thành công" });
    },
    onError: (error: Error) => {
      showToast({
        type: "error",
        title: "Lỗi xóa",
        description: error.message,
      });
    },
  });

  const handleCreate = useCallback(() => {
    router.push("source-articles/create");
  }, [router]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`source-articles/${id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((article: SourceArticle) => {
    setArticleToDelete(article);
  }, []);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterLevel]);

  // --- ĐỊNH NGHĨA CỘT (COLUMNS) ---
  const columns = useMemo<ColumnDef<SourceArticle>[]>(
    () => [
      {
        accessorKey: "title_vn",
        header: "Tiêu đề",
        cell: ({ row }) => (
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {row.getValue("title_vn")}
          </span>
        ),
      },
      {
        accessorKey: "topic",
        header: "Chủ đề",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.getValue("topic")}</span>
        ),
      },
      {
        accessorKey: "level",
        header: () => <div className="text-center">Cấp độ</div>,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <LevelBadge level={row.getValue("level")} />
          </div>
        ),
      },
      {
        id: "sentences",
        header: () => <div className="text-center">Số câu</div>,
        cell: ({ row }) => (
          <div className="text-center text-muted-foreground font-mono">
            {row.original.source_sentences?.length || 0}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Thao tác</div>,
        cell: ({ row }) => {
          const article = row.original;
          return (
            <div className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                title="Xem chi tiết"
                className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => router.push(`source-articles/${article._id}`)}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Chỉnh sửa"
                className="size-8 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                onClick={() => handleEdit(article._id)}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Xóa"
                className="size-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => handleDelete(article)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [router, handleEdit, handleDelete]
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="shrink-0">
            <h1 className="text-3xl font-bold text-foreground">
              Quản lý bài viết
            </h1>
            <p className="text-muted-foreground mt-1">
              Quản lý nội dung dịch thuật của bạn ({pagination?.totalDocs || 0}{" "}
              bài).
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9"
              />
            </div>
            <Select
              value={filterLevel}
              onValueChange={(val) =>
                setFilterLevel(val as ArticleLevel | "all")
              }
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.values(ArticleLevel).map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} className="shrink-0 shadow-md">
              <Plus className="w-4 h-4 mr-2" /> Tạo mới
            </Button>
          </div>
        </header>

        {/* Table */}
        <DataTable columns={columns} data={articles} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && articles.length > 0 && (
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-sm text-muted-foreground mr-2">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="size-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="size-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Delete Alert */}
      <AlertDialog
        open={!!articleToDelete}
        onOpenChange={(open) => !open && setArticleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bài viết{" "}
              <span className="font-bold text-foreground">
                {articleToDelete?.title_vn}
              </span>{" "}
              sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                articleToDelete && deleteMutation.mutate(articleToDelete._id)
              }
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
