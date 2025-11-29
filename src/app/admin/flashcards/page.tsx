"use client";

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { get } from "@/utils/apiClient";
import { useDebounce } from "@/hooks/use-debounce";
import { FlashCard } from "@/models/FlashCard";

import { SortingState } from "@tanstack/react-table";
import { columns } from "./columns";

export default function FlashCardsManagementPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [page, setPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Query API
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-flashcards", page, limit, debouncedSearch, sorting],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (debouncedSearch) params.append("search", debouncedSearch);

      params.append("sort", sorting[0]?.id || "createdAt");
      params.append("order", sorting[0]?.desc ? "desc" : "asc");
      const res = await get<FlashCard[]>(
        `/api/flashcards?${params.toString()}`
      );
      if (!res.success) throw new Error(res.error?.message);

      return {
        flashcards: res.data || [],
        pagination: res.pagination,
      };
    },
    placeholderData: keepPreviousData,
  });

  const flashcards = data?.flashcards || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50/50 dark:bg-[#0B0D14] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Flash Cards
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý flash cards trong hệ thống ({pagination?.totalDocs || 0}).
          </p>
        </div>
      </div>

      {/* Toolbar: Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-[#15171E] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={flashcards}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={setSorting}
      />

      {/* Pagination */}
      {!isLoading && flashcards.length > 0 && (
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
    </div>
  );
}
