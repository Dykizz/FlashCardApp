"use client";
import { ColumnDef } from "@tanstack/react-table";
import { FlashCard } from "@/models/FlashCard";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<FlashCard>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => {
      const title = getValue() as string;
      return (
        <span className="font-medium text-slate-900 dark:text-white">
          {title}
        </span>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ getValue }) => {
      const description = getValue() as string;
      return (
        <div className="max-w-xs truncate text-muted-foreground">
          {description || "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "subject",
    header: () => <div className="text-center">Môn học</div>,
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => {
      const subject = getValue() as string;
      return (
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {subject}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalQuestion",
    header: () => <div className="text-center">Số câu hỏi</div>,
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => {
      const total = getValue() as number;
      return (
        <div className="text-center font-semibold text-green-600 dark:text-green-400">
          {total}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Hành động</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Link href={`/admin/flashcards/${row.original._id}`}>
            <Button
              variant="ghost"
              size="icon"
              title="Xem chi tiết"
              className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Eye className="size-4" />
            </Button>
          </Link>
        </div>
      );
    },
    enableSorting: false,
  },
];
