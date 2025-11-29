"use client";

import React, { useState, useEffect } from "react";
import {
  useQuery,
  keepPreviousData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { get, patch } from "@/utils/apiClient";
import { useDebounce } from "@/hooks/use-debounce";
import { Question } from "@/models/Question";
import { SortingState } from "@tanstack/react-table";
import { EditQuestionModal } from "./EditQuestionModal";
import { columns } from "./columns";
import { showToast } from "@/utils/toast";

export default function QuestionsManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-questions", page, limit, debouncedSearch, sorting],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);

      params.append("sort", sorting[0]?.id || "createdAt");
      params.append("order", sorting[0]?.desc ? "desc" : "asc");
      const res = await get<Question[]>(
        `/api/admin/questions?${params.toString()}`
      );
      if (!res.success) throw new Error(res.error?.message);

      return {
        questions: res.data || [],
        pagination: res.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });

  const questions = data?.questions || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Question>;
    }) => {
      const res = await patch<Question>(`/api/admin/questions/${id}`, data);
      if (!res.success) throw new Error(res.error?.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
      setEditingQuestion(null);
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Cập nhật câu hỏi thất bại",
        description: error.message || "Đã có lỗi xảy ra, vui lòng thử lại.",
      });
    },
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 dark:bg-[#0B0D14] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Câu Hỏi
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý câu hỏi trong hệ thống ({pagination?.totalDocs || 0}).
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#15171E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo nội dung câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={questions}
        meta={{ setEditingQuestion }}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      {!isLoading && questions.length > 0 && (
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

      {/* Edit Modal */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={(data) =>
            updateMutation.mutate({ id: editingQuestion._id, data })
          }
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
