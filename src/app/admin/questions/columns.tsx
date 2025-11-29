"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Question } from "@/models/Question";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "content",
    header: "Nội dung",
    sortingFn: "alphanumeric",
    cell: ({ getValue }) => {
      const content = getValue() as string;
      return (
        <div className="max-w-xs truncate font-medium text-slate-900 dark:text-white">
          {content}
        </div>
      );
    },
  },
  {
    accessorKey: "options",
    header: "Lựa chọn",
    cell: ({ getValue }) => {
      const options = getValue() as string[];
      return (
        <div className="max-w-xs truncate text-muted-foreground">
          {options.join(", ")}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "correctAnswer",
    header: () => <div className="text-center">Đáp án đúng</div>,
    cell: ({ getValue }) => {
      const correct = getValue() as number;
      return (
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            {String.fromCharCode(65 + correct)}
          </Badge>
        </div>
      );
    },
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "explanation",
    header: "Giải thích",
    cell: ({ getValue }) => {
      const explanation = getValue() as string;
      return (
        <div className="max-w-xs truncate text-muted-foreground">
          {explanation || "N/A"}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Hành động</div>,
    cell: ({ row }) => {
      const question = row.original;
      return (
        <div className="flex justify-center">
          <Link href={`/admin/questions/${question._id}`}>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
            >
              <Edit className="w-4 h-4 mr-2" />
              Sửa
            </Button>
          </Link>
        </div>
      );
    },
    enableSorting: false,
  },
];
